/**
 * API Proxy Service
 * 
 * This service handles communication with the Python API proxy server
 * to make API requests and parse cURL commands.
 */

import { ApiRequest, ApiResponse, KeyValuePair } from '../types/apiTypes';

// API proxy server URL
const API_PROXY_URL = 'http://localhost:8000';

/**
 * Send an API request through the proxy server
 */
export const sendApiRequest = async (request: ApiRequest): Promise<ApiResponse> => {
  try {
    const startTime = performance.now();
    
    const response = await fetch(`${API_PROXY_URL}/api/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API proxy error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    const endTime = performance.now();
    
    return {
      status: data.status,
      statusText: data.statusText,
      headers: data.headers,
      body: data.body,
      time: data.time,
      size: data.size
    };
  } catch (error) {
    console.error('Error sending API request:', error);
    
    // Return error response
    return {
      status: 0,
      statusText: error instanceof Error ? error.message : 'Unknown error',
      headers: {},
      body: error instanceof Error ? error.stack || error.message : 'Unknown error',
      time: 0,
      size: 0
    };
  }
};

/**
 * Parse a cURL command using the proxy server
 */
export const parseCurlCommand = async (curlCommand: string): Promise<ApiRequest> => {
  try {
    const response = await fetch(`${API_PROXY_URL}/api/parse-curl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ curl_command: curlCommand }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`cURL parsing error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    return {
      method: data.method,
      url: data.url,
      headers: data.headers || [],
      params: data.params || [],
      body: data.body || ''
    };
  } catch (error) {
    console.error('Error parsing cURL command:', error);
    throw error;
  }
};

/**
 * Check if the API proxy server is running
 */
export const checkApiProxyServer = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_PROXY_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('API proxy server is not running:', error);
    return false;
  }
};
