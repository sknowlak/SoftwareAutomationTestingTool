"""
API Proxy Server for Betaboss API Testing Tool

This server acts as a proxy for API requests, handling CORS issues and providing
additional functionality like cURL parsing.
"""

import shlex
import json
import re
import time
from typing import Dict, Any, Optional, List, Union

import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
from pydantic import BaseModel

# Create FastAPI app
app = FastAPI(title="Betaboss API Proxy")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class KeyValuePair(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    enabled: Optional[bool] = True

class ApiRequest(BaseModel):
    method: str
    url: str
    headers: Optional[List[KeyValuePair]] = []
    params: Optional[List[KeyValuePair]] = []
    body: Optional[str] = None

class CurlRequest(BaseModel):
    curl_command: str

class ProxyResponse(BaseModel):
    status: int
    statusText: str
    headers: Dict[str, str]
    body: str
    time: float
    size: int

# cURL Parser
def parse_curl_command(curl_command: str) -> ApiRequest:
    """Parse a cURL command into an ApiRequest object"""
    # Remove 'curl' from the beginning if present
    if curl_command.lower().startswith('curl '):
        curl_command = curl_command[5:]
    
    # Handle line continuations
    curl_command = curl_command.replace('\\\n', ' ').replace('\\\r\n', ' ')
    
    # Split the command into tokens, respecting quotes
    try:
        tokens = shlex.split(curl_command)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid cURL command: {str(e)}")
    
    # Initialize request object
    method = "GET"  # Default method
    url = ""
    headers = []
    params = []
    body = None
    
    i = 0
    while i < len(tokens):
        token = tokens[i]
        
        # Handle method
        if token in ['--request', '-X']:
            if i + 1 < len(tokens):
                method = tokens[i + 1].upper()
                i += 2
            else:
                i += 1
        
        # Handle URL (any token that starts with http or https)
        elif token.startswith('http://') or token.startswith('https://'):
            url = token
            
            # Extract query parameters if present
            if '?' in url:
                url_parts = url.split('?', 1)
                url = url_parts[0]
                query_string = url_parts[1]
                
                # Parse query parameters
                for param in query_string.split('&'):
                    if '=' in param:
                        key, value = param.split('=', 1)
                        params.append(KeyValuePair(key=key, value=value))
            
            i += 1
        
        # Handle headers
        elif token in ['--header', '-H']:
            if i + 1 < len(tokens):
                header = tokens[i + 1]
                if ':' in header:
                    key, value = header.split(':', 1)
                    headers.append(KeyValuePair(key=key.strip(), value=value.strip()))
                i += 2
            else:
                i += 1
        
        # Handle data
        elif token in ['--data', '--data-raw', '--data-binary', '-d']:
            if i + 1 < len(tokens):
                body = tokens[i + 1]
                # If method is not specified explicitly but data is present, assume POST
                if method == "GET":
                    method = "POST"
                i += 2
            else:
                i += 1
        
        # Handle data with equals sign (--data=value)
        elif token.startswith('--data=') or token.startswith('--data-raw=') or token.startswith('-d='):
            body = token.split('=', 1)[1]
            # If method is not specified explicitly but data is present, assume POST
            if method == "GET":
                method = "POST"
            i += 1
        
        # Skip other options
        else:
            i += 1
    
    # Create and return the ApiRequest
    return ApiRequest(
        method=method,
        url=url,
        headers=headers,
        params=params,
        body=body
    )

# Routes
@app.post("/api/proxy", response_model=ProxyResponse)
async def proxy_request(request: ApiRequest):
    """
    Proxy an API request to the target server
    """
    try:
        # Convert headers and params to dictionaries
        headers_dict = {h.key: h.value for h in request.headers if h.enabled}
        params_dict = {p.key: p.value for p in request.params if p.enabled}
        
        # Start timing
        start_time = time.time()
        
        # Make the request
        response = requests.request(
            method=request.method,
            url=request.url,
            headers=headers_dict,
            params=params_dict,
            data=request.body if request.method != "GET" and request.body else None,
            timeout=30  # 30 second timeout
        )
        
        # End timing
        end_time = time.time()
        duration = (end_time - start_time) * 1000  # Convert to milliseconds
        
        # Create response object
        return ProxyResponse(
            status=response.status_code,
            statusText=response.reason,
            headers=dict(response.headers),
            body=response.text,
            time=duration,
            size=len(response.content)
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/parse-curl", response_model=ApiRequest)
async def parse_curl(request: CurlRequest):
    """
    Parse a cURL command into an ApiRequest object
    """
    try:
        return parse_curl_command(request.curl_command)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "ok"}

# Run the server
if __name__ == "__main__":
    uvicorn.run("api_proxy_server:app", host="0.0.0.0", port=8000, reload=True)
