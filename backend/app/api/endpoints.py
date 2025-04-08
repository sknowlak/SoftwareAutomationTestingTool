from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import json
from datetime import datetime

from ..db.database import get_db
from ..models import models
from ..recorder.recorder import WebRecorder
from ..test_generator.generator import TestGenerator
from . import schemas

router = APIRouter()

@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # In a real app, you would hash the password here
    db_user = models.User(email=user.email, hashed_password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.post("/projects/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects/", response_model=List[schemas.Project])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(models.Project).offset(skip).limit(limit).all()
    return projects

@router.post("/test-cases/", response_model=schemas.TestCase)
def create_test_case(test_case: schemas.TestCaseCreate, db: Session = Depends(get_db)):
    db_test_case = models.TestCase(**test_case.dict())
    db.add(db_test_case)
    db.commit()
    db.refresh(db_test_case)
    return db_test_case

@router.get("/test-cases/", response_model=List[schemas.TestCase])
def read_test_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    test_cases = db.query(models.TestCase).offset(skip).limit(limit).all()
    return test_cases

@router.post("/recordings/start")
def start_recording(url: str = Form(...), browser_type: str = Form("chromium")):
    # Create recordings directory if it doesn't exist
    os.makedirs("recordings", exist_ok=True)
    
    # Initialize recorder
    recorder = WebRecorder(base_url=url)
    recording_id = recorder.start_recording(browser_type=browser_type, headless=False)
    
    return {"recording_id": recording_id, "status": "recording", "url": url}

@router.post("/recordings/stop")
def stop_recording(recording_id: str = Form(...)):
    # This is a simplified version. In a real app, you would store the recorder instance
    # in a database or cache and retrieve it here.
    recorder = WebRecorder(base_url="", output_dir="recordings")
    recorder.recording_id = recording_id
    recorder.recording_path = os.path.join("recordings", recording_id)
    
    result = recorder.stop_recording()
    
    return {
        "recording_id": recording_id,
        "status": "stopped",
        "actions_count": result["actions_count"],
        "actions_file": result["actions_file"]
    }

@router.post("/test-generator/generate")
def generate_test(
    recording_id: str = Form(...),
    test_name: str = Form(...),
    test_type: str = Form("playwright"),
    db: Session = Depends(get_db)
):
    recording_path = os.path.join("recordings", recording_id)
    
    if not os.path.exists(recording_path):
        raise HTTPException(status_code=404, detail="Recording not found")
    
    generator = TestGenerator(recording_path)
    
    if test_type == "playwright":
        output_file = generator.generate_playwright_test(test_name=test_name)
    elif test_type == "pytest":
        output_file = generator.generate_pytest_test(test_name=test_name)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported test type: {test_type}")
    
    # Generate test steps for database storage
    test_steps = generator.generate_test_steps()
    
    # In a real app, you would create a test case in the database here
    
    return {
        "recording_id": recording_id,
        "test_name": test_name,
        "test_type": test_type,
        "output_file": output_file,
        "steps_count": len(test_steps)
    }

@router.post("/test-runs/start")
def start_test_run(
    test_case_id: int = Form(...),
    browser_type: str = Form("chromium"),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    # Get the test case
    test_case = db.query(models.TestCase).filter(models.TestCase.id == test_case_id).first()
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    
    # Create a new test run
    test_run = models.TestRun(
        test_case_id=test_case_id,
        status="running",
        browser=browser_type
    )
    db.add(test_run)
    db.commit()
    db.refresh(test_run)
    
    # In a real app, you would run the test in the background
    # background_tasks.add_task(run_test, test_case, test_run.id, db)
    
    return {
        "test_run_id": test_run.id,
        "test_case_id": test_case_id,
        "status": "running",
        "browser": browser_type
    }

@router.get("/test-runs/{test_run_id}")
def get_test_run(test_run_id: int, db: Session = Depends(get_db)):
    test_run = db.query(models.TestRun).filter(models.TestRun.id == test_run_id).first()
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")
    
    return {
        "test_run_id": test_run.id,
        "test_case_id": test_run.test_case_id,
        "status": test_run.status,
        "browser": test_run.browser,
        "start_time": test_run.start_time,
        "end_time": test_run.end_time
    }
