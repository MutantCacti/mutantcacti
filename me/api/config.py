from pathlib import Path
import os
import secrets

BASE_DIR = Path(__file__).parent

# Database
DATABASE_PATH = BASE_DIR / "data" / "me.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Session
SECRET_KEY = os.environ.get("ME_SECRET_KEY", secrets.token_hex(32))
SESSION_COOKIE_NAME = "me_session"
SESSION_MAX_AGE = 60 * 60 * 24 * 30  # 30 days
