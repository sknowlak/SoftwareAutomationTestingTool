from fastapi import FastAPI, HTTPException, Depends, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from datetime import datetime

# Import configuration
import config

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

# Create recordings directory if it doesn't exist
os.makedirs(config.RECORDINGS_DIR, exist_ok=True)

# Mount static files for recordings
app.mount("/recordings", StaticFiles(directory=config.RECORDINGS_DIR), name="recordings")

# Models
class TestCase(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    base_url: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    steps_count: int
    last_run_status: Optional[str] = None

class TestRun(BaseModel):
    id: int
    test_case_id: int
    test_case_name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    browser: str
    duration: Optional[int] = None

# Mock data
test_cases = [
    {
        "id": 1,
        "name": "Login Test",
        "description": "Test user login functionality",
        "base_url": "https://example.com/login",
        "created_at": datetime(2023, 10, 15, 10, 30),
        "updated_at": datetime(2023, 10, 15, 14, 45),
        "steps_count": 5,
        "last_run_status": "passed",
    },
    {
        "id": 2,
        "name": "Registration Test",
        "description": "Test user registration process",
        "base_url": "https://example.com/register",
        "created_at": datetime(2023, 10, 14, 9, 15),
        "updated_at": datetime(2023, 10, 14, 11, 20),
        "steps_count": 8,
        "last_run_status": "failed",
    },
]

test_runs = [
    {
        "id": 1,
        "test_case_id": 1,
        "test_case_name": "Login Test",
        "start_time": datetime(2023, 10, 15, 14, 30),
        "end_time": datetime(2023, 10, 15, 14, 31, 5),
        "status": "passed",
        "browser": "chromium",
        "duration": 65,
    },
    {
        "id": 2,
        "test_case_id": 2,
        "test_case_name": "Registration Test",
        "start_time": datetime(2023, 10, 15, 13, 45),
        "end_time": datetime(2023, 10, 15, 13, 46, 30),
        "status": "failed",
        "browser": "firefox",
        "duration": 90,
    },
]

@app.get("/")
async def root():
    return {"message": "Welcome to the Web Automation Testing Tool API"}

@app.get("/api/config")
async def get_config():
    # Only return non-sensitive configuration
    return {
        "googleApiKey": config.GOOGLE_API_KEY,
        "recordingsDir": config.RECORDINGS_DIR
    }

@app.get("/api/test-cases", response_model=List[TestCase])
async def get_test_cases():
    return test_cases

@app.get("/api/test-cases/{test_case_id}", response_model=TestCase)
async def get_test_case(test_case_id: int):
    for test_case in test_cases:
        if test_case["id"] == test_case_id:
            return test_case
    raise HTTPException(status_code=404, detail="Test case not found")

@app.get("/api/test-runs", response_model=List[TestRun])
async def get_test_runs():
    return test_runs

@app.get("/api/test-runs/{test_run_id}", response_model=TestRun)
async def get_test_run(test_run_id: int):
    for test_run in test_runs:
        if test_run["id"] == test_run_id:
            return test_run
    raise HTTPException(status_code=404, detail="Test run not found")

@app.post("/api/recordings/start")
async def start_recording(url: str = Form(...), browser_type: str = Form("chromium")):
    recording_id = f"recording_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    # In a real app, you would start the recording process here

    return {
        "recording_id": recording_id,
        "status": "recording",
        "url": url,
        "browser": browser_type
    }

@app.post("/api/recordings/stop")
async def stop_recording(recording_id: str = Form(...)):
    # In a real app, you would stop the recording process here

    return {
        "recording_id": recording_id,
        "status": "stopped",
        "actions_count": 10,  # Mock data
    }

@app.post("/api/test-generator/generate")
async def generate_test(
    recording_id: str = Form(...),
    test_name: str = Form(...),
    test_type: str = Form("playwright")
):
    # In a real app, you would generate the test here

    return {
        "recording_id": recording_id,
        "test_name": test_name,
        "test_type": test_type,
        "steps_count": 10,  # Mock data
    }

@app.post("/api/test-runs/start")
async def start_test_run(
    test_case_id: int = Form(...),
    browser_type: str = Form("chromium")
):
    # Check if test case exists
    test_case = None
    for tc in test_cases:
        if tc["id"] == test_case_id:
            test_case = tc
            break

    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")

    # In a real app, you would start the test run here

    test_run_id = len(test_runs) + 1

    return {
        "test_run_id": test_run_id,
        "test_case_id": test_case_id,
        "status": "running",
        "browser": browser_type
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
