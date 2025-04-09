@echo off
echo Starting Betaboss Testing Tool...

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the development server with TypeScript checking disabled
echo Starting development server...
echo.
echo The application will be available at http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

REM Run Vite directly with TypeScript checking disabled
call npx vite --force

pause
