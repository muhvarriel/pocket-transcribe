import os
import logging
from contextlib import asynccontextmanager
from typing import Optional, Any, Annotated
from dotenv import load_dotenv

from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from supabase import create_client, Client
from services import process_and_notify_service
from database import init_db
from database_utils import get_db_cursor, row_to_dict
from models import (
    MeetingProcessRequest,
    UpdateMeetingRequest,
    ProfileUpdateRequest
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Supabase constants
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "your-anon-key")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle startup and shutdown events using lifespan API.
    """
    logger.info("Backend starting up...")
    init_db()
    yield
    logger.info("Backend shutting down...")

app = FastAPI(lifespan=lifespan)

def get_db() -> Client:
    """Yields a Supabase client instance."""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def read_root():
    """Root endpoint to check service status."""
    return {"status": "ok", "service": "PocketTranscribe Backend"}

@app.post("/process-meeting")
async def process_meeting(
    request: MeetingProcessRequest,
    background_tasks: BackgroundTasks,
    db: Annotated[Client, Depends(get_db)],
) -> dict[str, str]:
    """Endpoint to trigger meeting processing."""
    if not request.meeting_id or not request.push_token:
        raise HTTPException(
            status_code=400, detail="Missing meeting_id or push_token"
        )

    with get_db_cursor(commit=True) as cur:
        query = """
            INSERT INTO meetings (title, user_id, status, audio_url, duration)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """
        cur.execute(
            query,
            (
                "New Meeting",
                request.user_id,
                "processing",
                request.audio_url,
                request.duration,
            ),
        )
        final_meeting_id = str(cur.fetchone()[0])
        logger.info("MIGRATION: Created new meeting record with ID: %s", final_meeting_id)

    background_tasks.add_task(
        process_and_notify_service,
        final_meeting_id,
        request.audio_url,
        request.push_token,
        db,
    )

    return {"status": "processing_started", "meeting_id": final_meeting_id}

@app.get("/meetings", response_model=dict[str, Any])
async def get_meetings(
    page: Annotated[int, "Current page number"] = 1,
    limit: Annotated[int, "Number of items per page"] = 10,
    search: Annotated[Optional[str], "Search query for titles"] = None,
    status: Annotated[Optional[str], "Filter by meeting status"] = None,
    user_id: Annotated[Optional[str], "Owner user ID"] = None,
) -> dict[str, Any]:
    """Fetch meetings with pagination, search, and filtering."""
    try:
        with get_db_cursor() as cur:
            conditions = ["1=1"]
            params: list[Any] = []

            if user_id:
                conditions.append("user_id = %s")
                params.append(user_id)

            if status and status != "All":
                conditions.append("status = %s")
                params.append(status.lower())

            if search:
                conditions.append("title ILIKE %s")
                params.append(f"%{search}%")

            where_clause = " WHERE " + " AND ".join(conditions)
            
            # Count query for pagination meta
            count_query = f"SELECT COUNT(*) FROM meetings {where_clause}"
            cur.execute(count_query, params)
            res = cur.fetchone()
            total_count = res[0] if res else 0

            # Data query with ordering and pagination
            offset = (page - 1) * limit
            data_query = (
                f"SELECT * FROM meetings {where_clause} "
                "ORDER BY created_at DESC LIMIT %s OFFSET %s"
            )
            cur.execute(data_query, params + [limit, offset])

            rows = cur.fetchall()
            data = [row_to_dict(cur, row) for row in rows]

            return {
                "data": data,
                "meta": {
                    "current_page": page,
                    "limit": limit,
                    "total_count": total_count,
                    "has_more": (offset + limit) < total_count
                }
            }
    except Exception as e:
        logger.error("L7_ERROR: Failed to fetch meetings: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve meetings.")

@app.get("/meetings/{meeting_id}", response_model=Optional[dict[str, Any]])
async def get_meeting(meeting_id: str) -> Optional[dict[str, Any]]:
    """Fetch a specific meeting."""
    with get_db_cursor() as cur:
        cur.execute("SELECT * FROM meetings WHERE id = %s", (meeting_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return row_to_dict(cur, row)

@app.delete("/meetings/{meeting_id}")
async def delete_meeting(meeting_id: str) -> dict[str, str]:
    """Delete a specific meeting."""
    with get_db_cursor(commit=True) as cur:
        cur.execute("DELETE FROM meetings WHERE id = %s", (meeting_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return {"status": "deleted", "id": meeting_id}

@app.patch("/meetings/{meeting_id}")
async def update_meeting(
    meeting_id: str, 
    request: UpdateMeetingRequest
) -> dict[str, str]:
    """Update a meeting title."""
    with get_db_cursor(commit=True) as cur:
        cur.execute(
            "UPDATE meetings SET title = %s, updated_at = now() WHERE id = %s",
            (request.title, meeting_id)
        )
        return {"status": "updated", "id": meeting_id, "title": request.title}

@app.get("/profile/{user_id}", response_model=dict[str, Any])
async def get_profile(user_id: str) -> dict[str, Any]:
    """Fetch a user profile."""
    with get_db_cursor() as cur:
        cur.execute("SELECT * FROM profiles WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            return {"id": user_id, "full_name": "", "avatar_url": None}
        return row_to_dict(cur, row) or {}

@app.patch("/profile/{user_id}")
async def update_profile(
    user_id: str, 
    request: ProfileUpdateRequest
) -> dict[str, Any]:
    """Update a user profile."""
    with get_db_cursor(commit=True) as cur:
        cur.execute("SELECT id FROM profiles WHERE id = %s", (user_id,))
        exists = cur.fetchone()

        if not exists:
            cur.execute(
                "INSERT INTO profiles (id, full_name, avatar_url) VALUES (%s, %s, %s)",
                (user_id, request.full_name, request.avatar_url)
            )
        else:
            updates: list[str] = []
            params: list[Any] = []
            if request.full_name is not None:
                updates.append("full_name = %s")
                params.append(request.full_name)
            if request.avatar_url is not None:
                updates.append("avatar_url = %s")
                params.append(request.avatar_url)
            if updates:
                params.append(user_id)
                update_query = (
                    f"UPDATE profiles SET {', '.join(updates)}, "
                    "updated_at = now() WHERE id = %s"
                )
                cur.execute(update_query, tuple(params))

        return {"status": "updated", "profile": request.model_dump(exclude_none=True)}
