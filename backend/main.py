"""
FastAPI Backend for Event Ticket System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Event Ticket System API",
    description="Backend API for event registration and ticket management",
    version="1.0.0"
)

# CORS configuration for frontend apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",  # registration-form
        "http://localhost:5001",  # admin-dashboard
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/static", StaticFiles(directory="static"), name="static")

# Import routes
# from routes import registration, admin

@app.get("/")
async def root():
    return {
        "message": "Event Ticket System API",
        "status": "active",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
