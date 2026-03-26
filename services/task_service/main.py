import sys
from os.path import abspath, dirname, join

# 1. Ensure the root directory is in the path so 'common' and 'services' can be found
root_path = abspath(join(dirname(__file__), "../../.."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.task_service.api.v1.task import router as tasks_v1_router

app = FastAPI(
    title="Task Service",
    description="Task Management API for Primetrade.ai",
    version="1.0.0"
)

# --- CORS Configuration ---
# Important: Allows your React/Next.js frontend to talk to this specific service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Route Registration ---
# This makes your URL: http://localhost:8002/api/v1/tasks/
app.include_router(
    tasks_v1_router, 
    prefix="/api/v1/tasks", 
    tags=["Tasks V1"]
)

@app.get("/")
def health_check():
    return {
        "status": "Task Service is healthy",
        "service": "task-management",
        "version": "v1"
    }

if __name__ == "__main__":
    import uvicorn
    # We use port 8002 to avoid conflict with Auth Service (8001)
    uvicorn.run(app, host="127.0.0.1", port=8002)