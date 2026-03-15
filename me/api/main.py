from litestar import Litestar, get
from litestar.config.cors import CORSConfig

from config import TRANSFERS_DIR
from db import init_db, get_session
from routes.auth import auth_router
from routes.transfers import transfers_router


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
    route_handlers=[health_check, auth_router, transfers_router],
    cors_config=cors_config,
    on_startup=[lambda: (init_db(), TRANSFERS_DIR.mkdir(parents=True, exist_ok=True), __import__('config').THUMBS_DIR.mkdir(parents=True, exist_ok=True))],
    debug=False,
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
