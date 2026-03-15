"""
Test signatures for me/api

These define WHAT to test. Implementation details will be filled in
once auth changes are stable.

Run with: pytest test_api.py -v
"""

import pytest


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
