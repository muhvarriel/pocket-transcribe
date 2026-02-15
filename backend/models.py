"""
Pydantic data models for the PocketTranscribe API.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class MeetingProcessRequest(BaseModel):
    """Schema for meeting processing requests."""
    meeting_id: Optional[str] = None
    user_id: str
    audio_url: str
    push_token: str
    duration: Optional[int] = 0

class UpdateMeetingRequest(BaseModel):
    """Schema for updating meeting titles."""
    title: str

class ProfileUpdateRequest(BaseModel):
    """Schema for updating user profiles."""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class MeetingResponse(BaseModel):
    """Schema for meeting details in responses."""
    id: str
    user_id: str
    title: str
    status: str
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    duration: Optional[int] = None
    created_at: datetime
    updated_at: datetime
