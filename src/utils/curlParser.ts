/**
 * cURL Parser Utility
 * Parses cURL commands into API request objects
 */

import { ApiRequest, KeyValuePair } from '../types/apiTypes';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parse a cURL command into an ApiRequest object
 * @param curlCommand The cURL command to parse
 * @returns An ApiRequest object
 */
export const parseCurlCommand = (curlCommand: string): ApiRequest | null => {
  try {
    // Remove 'curl' from the beginning if present
    let command = curlCommand.trim();
    if (command.toLowerCase().startsWith('curl ')) {
      command = command.substring(5).trim();
    }

    // Initialize request object
    const request: ApiRequest = {
      id: uuidv4(),
      name: 'Imported from cURL',
      url: '',
      method: 'GET', // Default method
      headers: [],
      params: [],
      body: '',
      tests: []
    };

    // Parse URL
    const urlMatch = command.match(/['"]([^'"]+)['"]/);
    if (urlMatch) {
      request.url = urlMatch[1];
      
      // Extract query parameters from URL
      const urlObj = new URL(request.url);
      urlObj.searchParams.forEach((value, key) => {
        request.params.push({ key, value });
      });
      
      // Remove query parameters from URL for cleaner display
      request.url = request.url.split('?')[0];
    } else {
      const urlMatch2 = command.match(/\s([^-][^\s]+)/);
      if (urlMatch2) {
        request.url = urlMatch2[1];
      }
    }

    // Parse method
    if (command.includes('-X') || command.includes('--request')) {
      const methodMatch = command.match(/(?:-X|--request)\s+([^\s]+)/);
      if (methodMatch) {
        request.method = methodMatch[1].toUpperCase();
      }
    }

    // Parse headers
    const headerMatches = command.matchAll(/(?:-H|--header)\s+['"]([^:]+):\s*([^'"]+)['"]/g);
    for (const match of headerMatches) {
      request.headers.push({
        key: match[1].trim(),
        value: match[2].trim()
      });
    }

    // Parse data/body
    const dataMatch = command.match(/(?:--data|-d)\s+['"](.+)['"]/);
    if (dataMatch) {
      request.body = dataMatch[1];
      
      // If method is not specified but data is present, assume POST
      if (request.method === 'GET') {
        request.method = 'POST';
      }
      
      // Try to parse as JSON for better formatting
      try {
        const jsonBody = JSON.parse(request.body);
        request.body = JSON.stringify(jsonBody, null, 2);
      } catch (e) {
        // Not valid JSON, keep as is
      }
    }

    // Set a more descriptive name based on the URL
    try {
      const urlObj = new URL(request.url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        request.name = `${request.method} ${pathParts[pathParts.length - 1]}`;
      }
    } catch (e) {
      // URL parsing failed, keep default name
    }

    return request;
  } catch (error) {
    console.error('Error parsing cURL command:', error);
    return null;
  }
};

/**
 * Convert an ApiRequest object to a cURL command
 * @param request The ApiRequest object to convert
 * @returns A cURL command string
 */
export const convertToCurl = (request: ApiRequest): string => {
  let curl = `curl -X ${request.method}`;
  
  // Add URL with query parameters
  let url = request.url;
  if (request.params.length > 0) {
    const urlObj = new URL(request.url);
    request.params.forEach(param => {
      if (param.enabled !== false) {
        urlObj.searchParams.append(param.key, param.value);
      }
    });
    url = urlObj.toString();
  }
  curl += ` "${url}"`;
  
  // Add headers
  request.headers.forEach(header => {
    if (header.enabled !== false) {
      curl += ` -H "${header.key}: ${header.value}"`;
    }
  });
  
  // Add body if present
  if (request.body) {
    curl += ` -d '${request.body}'`;
  }
  
  return curl;
};

export default {
  parseCurlCommand,
  convertToCurl
};
