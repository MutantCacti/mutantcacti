"""
Test signatures for me/api

These define WHAT to test. Implementation details will be filled in
once auth changes are stable.

Run with: pytest test_api.py -v
"""

import pytest
from datetime import datetime, timedelta


# === FIXTURES (to be implemented) ===

@pytest.fixture
def client():
    """Litestar test client with fresh in-memory DB."""
    # TODO: Create test app with sqlite:///:memory:
    # TODO: Initialize tables
    # TODO: Return TestClient
    pass


@pytest.fixture
def auth_client(client):
    """Client with valid session (logged in)."""
    # TODO: Set up user, login, return client with session cookie
    pass


@pytest.fixture
def api_key(auth_client):
    """Create and return a valid API key."""
    # TODO: Create API key via endpoint, return raw key
    pass


# === HEALTH ===

def test_health_check(client):
    """GET /health returns 200 with status ok."""
    pass


# === AUTH: LOGIN ===

def test_login_success(client):
    """POST /auth/login with correct password returns 200 and sets session cookie."""
    pass


def test_login_wrong_password(client):
    """POST /auth/login with wrong password returns 401."""
    pass


def test_login_no_user_configured(client):
    """POST /auth/login when no user exists returns 401."""
    pass


def test_logout_clears_cookie(auth_client):
    """POST /auth/logout clears session cookie."""
    pass


# === AUTH: SESSION VALIDATION ===

def test_protected_route_without_auth(client):
    """Protected routes return 401 without session or API key."""
    pass


def test_protected_route_with_session(auth_client):
    """Protected routes work with valid session cookie."""
    pass


def test_protected_route_with_invalid_session(client):
    """Protected routes reject invalid/forged session tokens."""
    pass


def test_protected_route_with_api_key(client, api_key):
    """Protected routes work with valid API key in Authorization header."""
    pass


def test_protected_route_with_invalid_api_key(client):
    """Protected routes reject invalid API keys."""
    pass


# === AUTH: API KEYS ===

def test_create_api_key(auth_client):
    """POST /auth/api-keys creates key and returns it once."""
    pass


def test_create_api_key_requires_auth(client):
    """POST /auth/api-keys requires authentication."""
    pass


def test_list_api_keys(auth_client):
    """GET /auth/api-keys lists keys without exposing raw keys."""
    pass


def test_delete_api_key(auth_client):
    """DELETE /auth/api-keys/{id} removes the key."""
    pass


def test_delete_nonexistent_api_key(auth_client):
    """DELETE /auth/api-keys/{id} returns 404 for unknown id."""
    pass


def test_api_key_updates_last_used(client, api_key):
    """Using an API key updates its last_used timestamp."""
    pass


# === DEADLINES: CRUD ===

def test_create_deadline(auth_client):
    """POST /deadlines creates a deadline with slug ID."""
    pass


def test_create_deadline_duplicate_id(auth_client):
    """POST /deadlines with existing ID returns 409."""
    pass


def test_create_deadline_invalid_slug(auth_client):
    """POST /deadlines with invalid slug pattern returns 422."""
    pass


def test_get_deadline(auth_client):
    """GET /deadlines/{id} returns the deadline."""
    pass


def test_get_deadline_not_found(auth_client):
    """GET /deadlines/{id} returns 404 for unknown id."""
    pass


def test_update_deadline(auth_client):
    """PATCH /deadlines/{id} updates specified fields only."""
    pass


def test_update_deadline_not_found(auth_client):
    """PATCH /deadlines/{id} returns 404 for unknown id."""
    pass


def test_delete_deadline(auth_client):
    """DELETE /deadlines/{id} removes the deadline."""
    pass


def test_delete_deadline_not_found(auth_client):
    """DELETE /deadlines/{id} returns 404 for unknown id."""
    pass


# === DEADLINES: LIST & FILTER ===

def test_list_deadlines(auth_client):
    """GET /deadlines returns all deadlines sorted by date."""
    pass


def test_list_deadlines_filter_by_status(auth_client):
    """GET /deadlines?status=active filters by status."""
    pass


def test_list_deadlines_filter_by_project(auth_client):
    """GET /deadlines?project=foo filters by project."""
    pass


def test_list_deadlines_filter_by_days(auth_client):
    """GET /deadlines?days=7 filters by upcoming N days."""
    pass


def test_upcoming_deadlines(auth_client):
    """GET /deadlines/upcoming returns active/watching within N days."""
    pass


def test_upcoming_excludes_completed(auth_client):
    """GET /deadlines/upcoming excludes completed/expired deadlines."""
    pass


# === DEADLINES: TAGS ===

def test_deadline_tags_stored_as_json(auth_client):
    """Tags are stored as JSON and returned as list."""
    pass


def test_deadline_update_tags(auth_client):
    """PATCH can update tags without affecting other fields."""
    pass


# === DEADLINES: STATUS ===

def test_deadline_status_validation(auth_client):
    """Status must be one of: watching, active, completed, expired."""
    pass


def test_deadline_default_status(auth_client):
    """Default status is 'watching' when not specified."""
    pass
