from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, Field


# Auth
class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    message: str = "logged in"


class ApiKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class ApiKeyResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    last_used: Optional[datetime]


class ApiKeyCreated(ApiKeyResponse):
    key: str  # Only returned on creation, never stored


# Deadlines
StatusType = Literal["watching", "active", "completed", "expired"]


class DeadlineCreate(BaseModel):
    id: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-z0-9\-]+$")
    title: str = Field(..., min_length=1, max_length=255)
    deadline: datetime
    description: Optional[str] = None
    project: Optional[str] = Field(None, max_length=100)
    status: StatusType = "watching"
    url: Optional[str] = Field(None, max_length=500)
    tags: list[str] = Field(default_factory=list)


class DeadlineUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    deadline: Optional[datetime] = None
    description: Optional[str] = None
    project: Optional[str] = Field(None, max_length=100)
    status: Optional[StatusType] = None
    url: Optional[str] = Field(None, max_length=500)
    tags: Optional[list[str]] = None


class DeadlineResponse(BaseModel):
    id: str
    title: str
    deadline: datetime
    description: Optional[str]
    project: Optional[str]
    status: StatusType
    url: Optional[str]
    tags: list[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
