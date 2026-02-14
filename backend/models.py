from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class MeetingProcessRequest(BaseModel):
    """Request model for processing a meeting."""
    meeting_id: str
    audio_url: str
    push_token: str
    user_id: Optional[str] = None
    duration: int = 0

class UpdateMeetingRequest(BaseModel):
    """Request model for updating a meeting."""
    title: str

class ProfileUpdateRequest(BaseModel):
    """Request model for updating a profile."""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class MeetingResponse(BaseModel):
    """Standard meeting response model."""
    id: str
    title: str
    status: str
    duration: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    user_id: Optional[str] = None
