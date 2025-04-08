/**
 * cURL Parser Utility
 * Parses cURL commands into API request objects
 */

import { ApiRequest, KeyValuePair } from '../types/apiTypes';
import { v4 as uuidv4 } from 'uuid';

// Cache for parsed cURL commands to improve performance
const curlCache = new Map<string, ApiRequest>();

/**
 * Parse a cURL command into an ApiRequest object
 * @param curlCommand The cURL command to parse
 * @returns An ApiRequest object
 */
export const parseCurlCommand = (curlCommand: string): ApiRequest | null => {
  try {
    // Check cache first
    const cachedResult = curlCache.get(curlCommand);
    if (cachedResult) {
      // Return a new object with a new ID to avoid reference issues
      return { ...cachedResult, id: uuidv4() };
    }

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

    // Parse URL - optimized regex
    let urlFound = false;
    // First try to find URL in quotes
    const quotedUrlMatch = /['"](https?:\/\/[^'"]+)['"]/.exec(command);
    if (quotedUrlMatch) {
      request.url = quotedUrlMatch[1];
      urlFound = true;
    }
    
    // If no URL found in quotes, look for unquoted URL
    if (!urlFound) {
      const unquotedUrlMatch = /\s(https?:\/\/[^\s]+)/.exec(command);
      if (unquotedUrlMatch) {
        request.url = unquotedUrlMatch[1];
        urlFound = true;
      }
    }
    
    // Last resort - try to find any URL-like string
    if (!urlFound) {
      const urlLikeMatch = /\s([^-][^\s]+\.[^\s]+)/.exec(command);
      if (urlLikeMatch) {
        request.url = urlLikeMatch[1];
        // Add http if missing
        if (!request.url.startsWith('http')) {
          request.url = 'https://' + request.url;
        }
      }
    }

    // Extract query parameters from URL if present
    if (request.url && request.url.includes('?')) {
      try {
        const urlObj = new URL(request.url);
        urlObj.searchParams.forEach((value, key) => {
          request.params.push({ key, value });
        });
        
        // Remove query parameters from URL for cleaner display
        request.url = request.url.split('?')[0];
      } catch (e) {
        // URL parsing failed, keep URL as is
      }
    }

    // Parse method - optimized regex
    const methodMatch = /(?:-X|--request)\s+([A-Za-z]+)/.exec(command);
    if (methodMatch) {
      request.method = methodMatch[1].toUpperCase();
    }

    // Parse headers - optimized to use a more efficient regex
    const headerRegex = /-H\s+['"]([^:]+):\s*([^'"]+)['"]|--header\s+['"]([^:]+):\s*([^'"]+)['"]/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(command)) !== null) {
      const key = headerMatch[1] || headerMatch[3];
      const value = headerMatch[2] || headerMatch[4];
      if (key && value) {
        request.headers.push({
          key: key.trim(),
          value: value.trim()
        });
      }
    }

    // Parse data/body - optimized regex
    const dataMatch = /(?:--data|-d)\s+['"](.+?)['"](?:\s|$)/.exec(command);
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
    if (request.url) {
      try {
        // Extract the last part of the path for the name
        const pathParts = request.url.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart.length > 0) {
          request.name = `${request.method} ${lastPart}`;
        } else {
          // If the URL ends with a slash, use the second-to-last part
          const secondLastPart = pathParts[pathParts.length - 2];
          if (secondLastPart && secondLastPart.length > 0) {
            request.name = `${request.method} ${secondLastPart}`;
          }
        }
      } catch (e) {
        // URL parsing failed, keep default name
      }
    }

    // Cache the result for future use (limit cache size to 100 entries)
    if (curlCache.size >= 100) {
      // Remove the oldest entry
      const firstKey = curlCache.keys().next().value;
      curlCache.delete(firstKey);
    }
    curlCache.set(curlCommand, { ...request });

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
    try {
      const urlObj = new URL(request.url);
      request.params.forEach(param => {
        if (param.enabled !== false) {
          urlObj.searchParams.append(param.key, param.value);
        }
      });
      url = urlObj.toString();
    } catch (e) {
      // URL parsing failed, keep URL as is
      console.error('Error building URL with params:', e);
    }
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
