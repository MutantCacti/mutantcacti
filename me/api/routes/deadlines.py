from datetime import datetime, timedelta
from typing import Optional

from litestar import Router, get, post, patch, delete
from litestar.exceptions import NotFoundException, ClientException
from litestar.response import Response
from litestar.params import Parameter
from sqlalchemy.orm import Session
from sqlalchemy import and_

from db import get_session
from models import Deadline
from schemas import DeadlineCreate, DeadlineUpdate, DeadlineResponse, StatusType
from routes.auth import require_auth


def deadline_to_response(d: Deadline) -> DeadlineResponse:
    """Convert ORM model to response schema."""
    return DeadlineResponse(
        id=d.id,
        title=d.title,
        deadline=d.deadline,
        description=d.description,
        project=d.project,
        status=d.status,
        url=d.url,
        tags=d.tags,
        created_at=d.created_at,
        updated_at=d.updated_at,
    )


@get("/")
async def list_deadlines(
    request,
    days: Optional[int] = None,
    status: Optional[StatusType] = None,
    project: Optional[str] = None,
    session: Session = Parameter(default=None),
) -> list[DeadlineResponse]:
    """List deadlines with optional filters."""
    require_auth(request)

    if session is None:
        session = next(get_session())

    query = session.query(Deadline)

    if days is not None:
        cutoff = datetime.utcnow() + timedelta(days=days)
        query = query.filter(Deadline.deadline <= cutoff)

    if status is not None:
        query = query.filter(Deadline.status == status)

    if project is not None:
        query = query.filter(Deadline.project == project)

    query = query.order_by(Deadline.deadline.asc())

    return [deadline_to_response(d) for d in query.all()]


@get("/upcoming")
async def upcoming_deadlines(
    request,
    days: int = 7,
    session: Session = Parameter(default=None),
) -> list[DeadlineResponse]:
    """Get upcoming deadlines within N days (default 7)."""
    require_auth(request)

    if session is None:
        session = next(get_session())

    now = datetime.utcnow()
    cutoff = now + timedelta(days=days)

    deadlines = (
        session.query(Deadline)
        .filter(
            and_(
                Deadline.deadline >= now,
                Deadline.deadline <= cutoff,
                Deadline.status.in_(["watching", "active"]),
            )
        )
        .order_by(Deadline.deadline.asc())
        .all()
    )

    return [deadline_to_response(d) for d in deadlines]


@post("/")
async def create_deadline(
    data: DeadlineCreate,
    request,
    session: Session = Parameter(default=None),
) -> DeadlineResponse:
    """Create a new deadline."""
    require_auth(request)

    if session is None:
        session = next(get_session())

    # Check if ID already exists
    existing = session.query(Deadline).filter(Deadline.id == data.id).first()
    if existing:
        raise ClientException(f"Deadline with id '{data.id}' already exists", status_code=409)

    deadline = Deadline(
        id=data.id,
        title=data.title,
        deadline=data.deadline,
        description=data.description,
        project=data.project,
        status=data.status,
        url=data.url,
    )
    deadline.tags = data.tags

    session.add(deadline)
    session.commit()
    session.refresh(deadline)

    return deadline_to_response(deadline)


@get("/{deadline_id:str}")
async def get_deadline(
    deadline_id: str,
    request,
    session: Session = Parameter(default=None),
) -> DeadlineResponse:
    """Get a single deadline by ID."""
    require_auth(request)

    if session is None:
        session = next(get_session())

    deadline = session.query(Deadline).filter(Deadline.id == deadline_id).first()
    if deadline is None:
        raise NotFoundException(f"Deadline '{deadline_id}' not found")

    return deadline_to_response(deadline)


@patch("/{deadline_id:str}")
async def update_deadline(
    deadline_id: str,
    data: DeadlineUpdate,
    request,
    session: Session = Parameter(default=None),
) -> DeadlineResponse:
    """Update a deadline (partial update)."""
    require_auth(request)

    if session is None:
        session = next(get_session())

    deadline = session.query(Deadline).filter(Deadline.id == deadline_id).first()
    if deadline is None:
        raise NotFoundException(f"Deadline '{deadline_id}' not found")

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == "tags":
            deadline.tags = value
        else:
            setattr(deadline, field, value)

    session.commit()
    session.refresh(deadline)

    return deadline_to_response(deadline)


@delete("/{deadline_id:str}")
async def delete_deadline(
    deadline_id: str,
    request,
    session: Session = Parameter(default=None),
) -> Response:
    """Delete a deadline."""
    require_auth(request)

    if session is None:
        session = next(get_session())

    deadline = session.query(Deadline).filter(Deadline.id == deadline_id).first()
    if deadline is None:
        raise NotFoundException(f"Deadline '{deadline_id}' not found")

    session.delete(deadline)
    session.commit()

    return Response(None, status_code=204)


deadlines_router = Router(path="/deadlines", route_handlers=[
    list_deadlines, upcoming_deadlines, create_deadline,
    get_deadline, update_deadline, delete_deadline
])
