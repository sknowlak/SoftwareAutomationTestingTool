from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.endpoints import router as api_router
from app.db.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Web Automation Testing Tool",
    description="A tool for recording web interactions and generating automated tests",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")

# Create recordings directory if it doesn't exist
os.makedirs("recordings", exist_ok=True)

# Mount static files for recordings
app.mount("/recordings", StaticFiles(directory="recordings"), name="recordings")

@app.get("/")
async def root():
    return {"message": "Welcome to the Web Automation Testing Tool API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
