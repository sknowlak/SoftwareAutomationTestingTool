# Web Automation Testing Tool

A comprehensive web automation testing tool that allows users to record browser interactions and automatically generate test cases.

## Features

- **Record Web Interactions**: Capture user actions on web pages
- **DOM Element Identification**: Automatically identify and track DOM elements
- **Test Case Generation**: Generate test scripts from recorded sessions
- **Test Execution**: Run tests and view results
- **Cross-Browser Testing**: Support for Chromium, Firefox, and WebKit

## Tech Stack

- **Backend**: Python with FastAPI
- **Frontend**: React with Material-UI
- **Database**: PostgreSQL
- **Automation Engine**: Playwright

## Project Structure

```
web-automation-tool/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── recorder/
│   │   ├── test_generator/
│   │   └── utils/
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.11+ (for local development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/web-automation-tool.git
   cd web-automation-tool
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Local Development

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Install Playwright browsers:
   ```
   playwright install
   ```

5. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. **Recording a Test**:
   - Navigate to the Recorder page
   - Enter the URL to test
   - Click "Start Recording"
   - Perform actions on the website
   - Click "Stop Recording" when finished
   - Enter a test name and select a test type
   - Click "Generate Test"

2. **Running Tests**:
   - Navigate to the Test Cases page
   - Find the test you want to run
   - Click the "Run" button
   - View the results on the Test Runs page

## License

This project is licensed under the MIT License - see the LICENSE file for details.
