import secrets
from datetime import datetime

from litestar import Router, post, get, delete
from litestar.exceptions import NotAuthorizedException, NotFoundException
from litestar.response import Response
from litestar.params import Parameter
from sqlalchemy.orm import Session
from passlib.hash import bcrypt

from db import get_session
from models import Auth, ApiKey
from schemas import (
    LoginRequest, LoginResponse,
    ApiKeyCreate, ApiKeyResponse, ApiKeyCreated
)
from config import SESSION_COOKIE_NAME, SESSION_MAX_AGE


def verify_session(request) -> bool:
    """Check if request has valid session cookie."""
    session_token = request.cookies.get(SESSION_COOKIE_NAME)
    return session_token is not None


def require_auth(request):
    """Dependency to require authentication."""
    # Check session cookie first
    if request.cookies.get(SESSION_COOKIE_NAME):
        return True

    # Check API key
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        key = auth_header[7:]
        session = next(get_session())
        try:
            key_hash = bcrypt.hash(key)
            # We need to check all keys since we can't reverse the hash
            for api_key in session.query(ApiKey).all():
                if bcrypt.verify(key, api_key.key_hash):
                    api_key.last_used = datetime.utcnow()
                    session.commit()
                    return True
        finally:
            session.close()

    raise NotAuthorizedException("Authentication required")


@post("/login")
async def login(
    data: LoginRequest,
    session: Session = Parameter(default=None),
) -> Response[LoginResponse]:
    """Login with password, returns session cookie."""
    if session is None:
        session = next(get_session())

    auth = session.query(Auth).first()
    if auth is None:
        raise NotAuthorizedException("No user configured")

    if not bcrypt.verify(data.password, auth.password_hash):
        raise NotAuthorizedException("Invalid password")

    # Create session token
    session_token = secrets.token_urlsafe(32)

    response = Response(
        LoginResponse(),
        status_code=200,
    )
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return response


@post("/logout")
async def logout() -> Response:
    """Clear session cookie."""
    response = Response({"message": "logged out"}, status_code=200)
    response.delete_cookie(SESSION_COOKIE_NAME)
    return response


@post("/api-keys")
async def create_api_key(
    data: ApiKeyCreate,
    request,
    session: Session = Parameter(default=None),
) -> ApiKeyCreated:
    """Create a new API key. Returns the key once (not stored)."""
    require_auth(request)

    if session is None:
        session = next(get_session())

    # Generate key
    raw_key = secrets.token_urlsafe(32)
    key_hash = bcrypt.hash(raw_key)

    api_key = ApiKey(
        key_hash=key_hash,
        name=data.name,
    )
    session.add(api_key)
    session.commit()
    session.refresh(api_key)

    return ApiKeyCreated(
        id=api_key.id,
        name=api_key.name,
        created_at=api_key.created_at,
        last_used=api_key.last_used,
        key=raw_key,
    )


@get("/api-keys")
async def list_api_keys(
    request,
    session: Session = Parameter(default=None),
) -> list[ApiKeyResponse]:
    """List all API keys (without the actual keys)."""
    require_auth(request)

    if session is None:
        session = next(get_session())

    keys = session.query(ApiKey).all()
    return [
        ApiKeyResponse(
            id=k.id,
            name=k.name,
            created_at=k.created_at,
            last_used=k.last_used,
        )
        for k in keys
    ]


@delete("/api-keys/{key_id:int}")
async def delete_api_key(
    key_id: int,
    request,
    session: Session = Parameter(default=None),
) -> Response:
    """Delete an API key."""
    require_auth(request)

    if session is None:
        session = next(get_session())

    api_key = session.query(ApiKey).filter(ApiKey.id == key_id).first()
    if api_key is None:
        raise NotFoundException("API key not found")

    session.delete(api_key)
    session.commit()

    return Response(None, status_code=204)


auth_router = Router(path="/auth", route_handlers=[
    login, logout, create_api_key, list_api_keys, delete_api_key
])
