import os
import contextlib
import logging
from typing import Generator, Any, Optional
import psycopg2
from psycopg2.extensions import cursor
from fastapi import HTTPException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@contextlib.contextmanager
def get_db_cursor(commit: bool = False) -> Generator[cursor, None, None]:
    """
    Context manager for database connection and cursor.
    Implements L7 standards for connection integrity and explicit error surfacing.
    """
    db_url = os.environ.get("DIRECT_DB_URL")
    if not db_url:
        logger.error("L7_CONFIG_ERROR: DIRECT_DB_URL is missing.")
        raise HTTPException(
            status_code=500, detail="Database configuration is incomplete."
        )

    conn = None
    try:
        conn = psycopg2.connect(db_url, connect_timeout=10)
        cur = conn.cursor()
        try:
            yield cur
            if commit:
                conn.commit()
        except Exception as e:
            if commit and conn:
                conn.rollback()
            logger.error("L7_QUERY_ERROR: Transaction failed: %s", e)
            raise e
        finally:
            cur.close()
    except psycopg2.Error as e:
        logger.error("L7_CONN_ERROR: Postgres connection failed: %s", e)
        raise HTTPException(
            status_code=500, detail="Database connection could not be established."
        ) from e
    except Exception as e:
        logger.error("L7_UNHANDLED_ERROR: Unified database handler caught: %s", e)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Critical service failure.") from e
    finally:
        if conn:
            conn.close()

def row_to_dict(cursor: cursor, row: Any) -> Optional[dict[str, Any]]:
    """Strictly typed conversion of database rows to dictionary format."""
    if not row or not cursor.description:
        return None
    return {col[0]: row[i] for i, col in enumerate(cursor.description)}
