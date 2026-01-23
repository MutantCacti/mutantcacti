from litestar import Litestar, get
from litestar.config.cors import CORSConfig

from db import init_db, get_session
from routes.auth import auth_router
from routes.deadlines import deadlines_router


@get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}


cors_config = CORSConfig(
    allow_origins=["https://mutantcacti.com", "https://me.mutantcacti.com"],
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=True,
)

app = Litestar(
    route_handlers=[health_check, auth_router, deadlines_router],
    cors_config=cors_config,
    on_startup=[lambda: init_db()],
    debug=False,
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
