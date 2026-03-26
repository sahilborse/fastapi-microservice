from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.auth_service.api.v1.auth import router as auth_v1_router

app = FastAPI(
    title="Auth Service",
    description="Scalable Auth API for Primetrade.ai",
    version="1.0.0"
)

# --- CORS Configuration ---
# Required for your React Frontend to communicate with the Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Versioned Route Registration ---
# This makes your URL: http://localhost:8001/api/v1/login
app.include_router(
    auth_v1_router, 
    prefix="/api/v1", 
    tags=["Authentication V1"]
)

@app.get("/")
def health_check():
    return {"status": "Auth Service is running", "version": "v1"}

if __name__ == "__main__":
    import uvicorn
    # Launching on port 8001 for Auth (Task Service would use 8002)
    uvicorn.run(app, host="127.0.0.1", port=8001)