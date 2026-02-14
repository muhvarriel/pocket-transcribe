import os
import logging
from typing import Optional
import psycopg2
from psycopg2.extensions import connection, cursor
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

logger = logging.getLogger(__name__)

load_dotenv()

# Storage Constants
AVATARS_BUCKET = "avatars"
RECORDINGS_BUCKET = "recordings"

def get_db_connection() -> connection:
    """Create a connection to the PostgreSQL database."""
    db_url = os.environ.get("DIRECT_DB_URL")
    if not db_url:
        raise ValueError("DIRECT_DB_URL environment variable is not set")
    return psycopg2.connect(db_url)

def _create_tables(cur: cursor) -> None:
    """Ensure the required database tables exist."""
    logger.info("MIGRATION: Ensuring 'meetings' table exists...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS meetings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            title TEXT NOT NULL,
            audio_url TEXT,
            transcript TEXT,
            summary TEXT,
            status TEXT DEFAULT 'processing',
            duration INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    """)

    # Migration: Ensure updated_at exists for existing tables
    cur.execute(
        "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();"
    )

    # Enable RLS
    logger.info("MIGRATION: Enabling RLS on 'meetings' table...")
    cur.execute("ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;")

    # Optional: Add indexes
    cur.execute("CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);")

    # Create profiles table (Mirroring auth.users concepts)
    logger.info("MIGRATION: Ensuring 'profiles' table exists...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            avatar_url TEXT,
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    """)

    # Enable RLS on profiles
    logger.info("MIGRATION: Enabling RLS on 'profiles' table...")
    cur.execute("ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;")

def _ensure_storage_buckets(cur: cursor) -> None:
    """Ensure storage buckets exist."""
    logger.info("MIGRATION: Ensuring storage buckets exist...")
    cur.execute(f"""
        INSERT INTO storage.buckets (id, name, public)
        VALUES 
            ('{AVATARS_BUCKET}', '{AVATARS_BUCKET}', true),
            ('{RECORDINGS_BUCKET}', '{RECORDINGS_BUCKET}', true)
        ON CONFLICT (id) DO NOTHING;
    """)
    logger.info("MIGRATION: Storage buckets ensured.")

def _configure_storage_policies(cur: cursor) -> None:
    """Configure storage RLS policies."""
    logger.info("MIGRATION: Configuring storage policies...")
    cur.execute(f"""
        BEGIN;
        
        -- Avatars: Public Read
        DROP POLICY IF EXISTS "Public Access to Avatars" ON storage.objects;
        CREATE POLICY "Public Access to Avatars" ON storage.objects
        FOR SELECT USING ( bucket_id = '{AVATARS_BUCKET}' );
        
        -- Avatars: Auth Upload
        DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
        CREATE POLICY "Auth Upload Avatars" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = '{AVATARS_BUCKET}' AND
            auth.role() = 'authenticated'
        );
        
        -- Avatars: Auth Update/Delete (Own files)
        DROP POLICY IF EXISTS "Auth Update Own Avatars" ON storage.objects;
        CREATE POLICY "Auth Update Own Avatars" ON storage.objects
        FOR UPDATE USING (
            bucket_id = '{AVATARS_BUCKET}' AND
            auth.uid() = owner
        );

        DROP POLICY IF EXISTS "Auth Delete Own Avatars" ON storage.objects;
        CREATE POLICY "Auth Delete Own Avatars" ON storage.objects
        FOR DELETE USING (
            bucket_id = '{AVATARS_BUCKET}' AND
            auth.uid() = owner
        );
        
        -- Recordings: Auth Upload
        DROP POLICY IF EXISTS "Auth Upload Recordings" ON storage.objects;
        CREATE POLICY "Auth Upload Recordings" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = '{RECORDINGS_BUCKET}' AND
            auth.role() = 'authenticated'
        );
        
        -- Recordings: Auth Read (Own files only)
        DROP POLICY IF EXISTS "Auth Read Own Recordings" ON storage.objects;
        CREATE POLICY "Auth Read Own Recordings" ON storage.objects
        FOR SELECT USING (
            bucket_id = '{RECORDINGS_BUCKET}' AND
            auth.uid() = owner
        );
        
        COMMIT;
    """)
    logger.info("MIGRATION: Storage policies applied.")

def init_db() -> None:
    """
    Connects to the database using DIRECT_DB_URL and ensures
    that the required tables exist.
    """
    db_url = os.environ.get("DIRECT_DB_URL")

    if not db_url:
        logger.warning("MIGRATION: DIRECT_DB_URL not set. Skipping auto-migration.")
        logger.info("TIP: Add DIRECT_DB_URL to your .env file to enable auto-table creation.")
        return

    conn: Optional[connection] = None
    try:
        logger.info("MIGRATION: Connecting to database for migrations...")
        conn = get_db_connection()
        conn.autocommit = True
        cur = conn.cursor()

        _create_tables(cur)

        # Storage-related migrations in a sub-try block
        try:
            _ensure_storage_buckets(cur)
            _configure_storage_policies(cur)
        except Exception as e:
            logger.error(
                "MIGRATION WARNING: Could not auto-create storage buckets or policies: %s",
                e
            )
            if conn:
                conn.rollback()

        logger.info("MIGRATION: Database initialized successfully.")
        cur.close()
    except Exception as e:
        logger.error("MIGRATION ERROR: Failed to initialize database: %s", e)
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    # Allow running standalone
    logging.basicConfig(level=logging.INFO)
    init_db()

if __name__ == "__main__":
    # Allow running standalone
    init_db()
