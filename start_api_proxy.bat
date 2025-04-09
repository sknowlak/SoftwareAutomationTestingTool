@echo off
echo Starting API Proxy Server...

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Install dependencies if needed
echo Installing dependencies...
pip install -r requirements.txt

REM Start the server
echo Starting server...
start "API Proxy Server" python api_proxy_server.py

echo.
echo API Proxy Server is running at http://localhost:8000
echo API documentation is available at http://localhost:8000/docs
echo.
echo Press any key to stop the server...
pause

REM Kill the server process
taskkill /FI "WINDOWTITLE eq API Proxy Server" /F

echo Server stopped
pause
