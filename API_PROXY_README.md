# API Proxy Server for Betaboss API Testing Tool

This API Proxy Server helps resolve CORS issues and provides more reliable API testing functionality for the Betaboss API Testing Tool.

## Features

- Bypasses CORS restrictions by proxying requests through a Python backend
- Provides proper cURL command parsing
- Handles complex HTTP requests reliably
- Provides detailed error information
- Works with any API endpoint

## Requirements

- Python 3.7 or higher
- Node.js and npm (for the frontend)

## Installation

The required Python dependencies are listed in `requirements.txt` and will be installed automatically when you run the server.

## Running the Server

### Windows

1. Double-click the `start_api_proxy.bat` file
2. The server will start and open a command window
3. The API proxy will be available at http://localhost:8000

### Manual Start

1. Open a terminal/command prompt
2. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Start the server:
   ```
   python api_proxy_server.py
   ```

## API Documentation

Once the server is running, you can access the API documentation at:
http://localhost:8000/docs

## Endpoints

- `POST /api/proxy` - Proxy an API request
- `POST /api/parse-curl` - Parse a cURL command
- `GET /health` - Health check endpoint

## Using with the Frontend

The frontend will automatically detect if the API proxy server is running and use it for API requests. If the server is not running, it will fall back to direct API requests, which may have CORS limitations.

## Troubleshooting

If you encounter any issues:

1. Make sure Python is installed and in your PATH
2. Check that the server is running (http://localhost:8000/health should return `{"status": "ok"}`)
3. Look for error messages in the terminal window where the server is running
4. If you see CORS errors in the browser console, make sure the API proxy server is running

## Security Considerations

This API proxy is intended for local development and testing only. It should not be exposed to the public internet as it could potentially be used to bypass security restrictions.
