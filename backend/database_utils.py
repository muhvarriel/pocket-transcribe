"""
Low-level database utilities for PocketTranscribe.
Provides context managers for database cursors and row conversion helpers.
"""
import os
import logging
from contextlib import contextmanager
from typing import Generator, Any, Optional
import psycopg2
from psycopg2.extensions import cursor
from fastapi import HTTPException

# Configure logging
logger = logging.getLogger(__name__)

@contextmanager
def get_db_cursor(commit: bool = False) -> Generator[cursor, None, None]:
    """
    Context manager for database connection and cursor.
    Implements standards for connection integrity and explicit error surfacing.
    """
    db_url = os.environ.get("DIRECT_DB_URL")
    if not db_url:
        logger.error("CONFIG_ERROR: DIRECT_DB_URL is missing.")
        raise HTTPException(
            status_code=500, detail="Database configuration is incomplete."
        )

    conn = None
    try:
        conn = psycopg2.connect(db_url, connect_timeout=10)
        _cursor = conn.cursor()
        try:
            yield _cursor
            if commit:
                conn.commit()
        except Exception as e:
            if commit and conn:
                conn.rollback()
            logger.error("QUERY_ERROR: Transaction failed: %s", e)
            raise e
        finally:
            _cursor.close()
    except psycopg2.Error as e:
        logger.error("CONN_ERROR: Postgres connection failed: %s", e)
        raise HTTPException(
            status_code=500, detail="Database connection could not be established."
        ) from e
    except Exception as e:
        logger.error("UNHANDLED_ERROR: Unified database handler caught: %s", e)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Critical service failure.") from e
    finally:
        if conn:
            conn.close()

def row_to_dict(cur: cursor, row: Any) -> Optional[dict[str, Any]]:
    """Strictly typed conversion of database rows to dictionary format."""
    if not row or not cur.description:
        return None
    return {col[0]: row[i] for i, col in enumerate(cur.description)}
