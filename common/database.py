import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# Shared SQLAlchemy Base for all services
Base = declarative_base()

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'Vasu123')
DB_PORT = int(os.getenv('DB_PORT', 3306))

def get_database_url(db_name: str) -> str:
    """Generate database URL for a specific service database."""
    if DB_PASSWORD:
        return f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{db_name}"
    else:
        return f"mysql+pymysql://{DB_USER}@{DB_HOST}:{DB_PORT}/{db_name}"

# Auth Service Database
AUTH_DB_NAME = os.getenv('AUTH_DB_NAME', 'auth_db')
auth_engine = create_engine(
    get_database_url(AUTH_DB_NAME),
    echo=os.getenv('DB_ECHO', 'False') == 'True',
    pool_pre_ping=True
)
AuthSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=auth_engine)

# Task Service Database
TASK_DB_NAME = os.getenv('TASK_DB_NAME', 'task_db')
task_engine = create_engine(
    get_database_url(TASK_DB_NAME),
    echo=os.getenv('DB_ECHO', 'False') == 'True',
    pool_pre_ping=True
)
TaskSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=task_engine)

def get_auth_db():
    """Dependency injection for auth service database."""
    db = AuthSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_task_db():
    """Dependency injection for task service database."""
    db = TaskSessionLocal()
    try:
        yield db
    finally:
        db.close()

 