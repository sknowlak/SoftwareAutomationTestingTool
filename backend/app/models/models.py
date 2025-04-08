from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="projects")
    test_cases = relationship("TestCase", back_populates="project")

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    base_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    project = relationship("Project", back_populates="test_cases")
    steps = relationship("TestStep", back_populates="test_case")
    runs = relationship("TestRun", back_populates="test_case")

class TestStep(Base):
    __tablename__ = "test_steps"

    id = Column(Integer, primary_key=True, index=True)
    order = Column(Integer)
    action_type = Column(String)  # click, type, navigate, assert, etc.
    selector = Column(String, nullable=True)  # CSS selector, XPath, etc.
    selector_type = Column(String, nullable=True)  # css, xpath, text, etc.
    value = Column(String, nullable=True)  # Value to type, assert, etc.
    screenshot = Column(String, nullable=True)  # Path to screenshot
    test_case_id = Column(Integer, ForeignKey("test_cases.id"))
    
    test_case = relationship("TestCase", back_populates="steps")

class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String)  # running, passed, failed, error
    browser = Column(String)
    test_case_id = Column(Integer, ForeignKey("test_cases.id"))
    
    test_case = relationship("TestCase", back_populates="runs")
    results = relationship("TestResult", back_populates="test_run")

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    step_order = Column(Integer)
    status = Column(String)  # passed, failed, error
    error_message = Column(Text, nullable=True)
    screenshot = Column(String, nullable=True)  # Path to screenshot
    execution_time = Column(Integer, nullable=True)  # in milliseconds
    test_run_id = Column(Integer, ForeignKey("test_runs.id"))
    
    test_run = relationship("TestRun", back_populates="results")

class DOMElement(Base):
    __tablename__ = "dom_elements"

    id = Column(Integer, primary_key=True, index=True)
    test_case_id = Column(Integer, ForeignKey("test_cases.id"))
    selector = Column(String)
    selector_type = Column(String)  # css, xpath, text, etc.
    friendly_name = Column(String, nullable=True)
    attributes = Column(JSON, nullable=True)  # Store element attributes
    
    test_case = relationship("TestCase")
