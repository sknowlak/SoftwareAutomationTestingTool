from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    owner_id: int

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Test case schemas
class TestCaseBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_url: str
    project_id: int

class TestCaseCreate(TestCaseBase):
    pass

class TestCase(TestCaseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Test step schemas
class TestStepBase(BaseModel):
    order: int
    action_type: str
    selector: Optional[str] = None
    selector_type: Optional[str] = None
    value: Optional[str] = None
    screenshot: Optional[str] = None
    test_case_id: int

class TestStepCreate(TestStepBase):
    pass

class TestStep(TestStepBase):
    id: int

    class Config:
        orm_mode = True

# Test run schemas
class TestRunBase(BaseModel):
    browser: str
    test_case_id: int

class TestRunCreate(TestRunBase):
    pass

class TestRun(TestRunBase):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str

    class Config:
        orm_mode = True

# Test result schemas
class TestResultBase(BaseModel):
    step_order: int
    status: str
    error_message: Optional[str] = None
    screenshot: Optional[str] = None
    execution_time: Optional[int] = None
    test_run_id: int

class TestResultCreate(TestResultBase):
    pass

class TestResult(TestResultBase):
    id: int

    class Config:
        orm_mode = True

# DOM element schemas
class DOMElementBase(BaseModel):
    test_case_id: int
    selector: str
    selector_type: str
    friendly_name: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

class DOMElementCreate(DOMElementBase):
    pass

class DOMElement(DOMElementBase):
    id: int

    class Config:
        orm_mode = True
