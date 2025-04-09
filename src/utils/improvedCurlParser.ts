/**
 * Improved cURL Parser Utility
 * Parses cURL commands into API request objects
 * Based on the Python implementation for better compatibility
 */

import { ApiRequest, KeyValuePair } from '../types/apiTypes';
import { v4 as uuidv4 } from 'uuid';

// Cache for parsed cURL commands to improve performance
const curlCache = new Map<string, ApiRequest>();

/**
 * Split a string by spaces, respecting quotes
 * Similar to Python's shlex.split
 */
function shellSplit(str: string): string[] {
  const result: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
      if (current) {
        result.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) {
    result.push(current);
  }

  return result;
}

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

    // Handle the case where the input is just a URL
    if (isSimpleUrl(curlCommand.trim())) {
      const request: ApiRequest = {
        id: uuidv4(),
        name: 'GET ' + getUrlLastSegment(curlCommand.trim()),
        url: curlCommand.trim(),
        method: 'GET',
        headers: [],
        params: [],
        body: '',
        tests: []
      };
      
      // Cache the result
      curlCache.set(curlCommand, { ...request });
      return request;
    }

    // Normalize the command - handle line continuations and normalize whitespace
    let normalizedCommand = curlCommand
      .replace(/\\\r?\n/g, ' ') // Replace line continuations with spaces
      .replace(/\r?\n/g, ' ')   // Replace newlines with spaces
      .trim();

    // Split the command into tokens, respecting quotes
    const tokens = shellSplit(normalizedCommand);
    
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

    // Parse the tokens
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      // Skip 'curl' token
      if (token.toLowerCase() === 'curl') {
        continue;
      }
      
      // Handle method
      if (token === '--request' || token === '-X') {
        if (i + 1 < tokens.length) {
          request.method = tokens[++i].toUpperCase();
        }
        continue;
      }
      
      // Handle URL (any token that starts with http or https)
      if (token.startsWith('http://') || token.startsWith('https://') || token.startsWith('www.')) {
        request.url = token.replace(/^['"]|['"]$/g, ''); // Remove quotes if present
        
        // Extract query parameters if present
        try {
          const urlObj = new URL(request.url);
          urlObj.searchParams.forEach((value, key) => {
            request.params.push({ key, value, enabled: true });
          });
          
          // Remove query parameters from URL for cleaner display
          if (request.params.length > 0) {
            request.url = request.url.split('?')[0];
          }
        } catch (e) {
          // URL parsing failed, keep URL as is
        }
        
        continue;
      }
      
      // Handle headers
      if (token === '--header' || token === '-H') {
        if (i + 1 < tokens.length) {
          const headerStr = tokens[++i].replace(/^['"]|['"]$/g, ''); // Remove quotes
          const colonIndex = headerStr.indexOf(':');
          
          if (colonIndex > 0) {
            const key = headerStr.substring(0, colonIndex).trim();
            const value = headerStr.substring(colonIndex + 1).trim();
            request.headers.push({ key, value, enabled: true });
          }
        }
        continue;
      }
      
      // Handle data
      if (token === '--data' || token === '--data-raw' || token === '--data-binary' || token === '-d') {
        if (i + 1 < tokens.length) {
          let data = tokens[++i].replace(/^['"]|['"]$/g, ''); // Remove quotes
          
          // Try to parse as JSON
          try {
            const jsonData = JSON.parse(data);
            request.body = JSON.stringify(jsonData, null, 2); // Pretty print
          } catch (e) {
            // Not valid JSON, keep as is
            request.body = data;
          }
          
          // If method is not specified explicitly but data is present, assume POST
          if (request.method === 'GET') {
            request.method = 'POST';
          }
        }
        continue;
      }
      
      // Handle data with equals sign (--data=value)
      if (token.startsWith('--data=') || token.startsWith('--data-raw=') || token.startsWith('-d=')) {
        const data = token.substring(token.indexOf('=') + 1).replace(/^['"]|['"]$/g, '');
        
        // Try to parse as JSON
        try {
          const jsonData = JSON.parse(data);
          request.body = JSON.stringify(jsonData, null, 2); // Pretty print
        } catch (e) {
          // Not valid JSON, keep as is
          request.body = data;
        }
        
        // If method is not specified explicitly but data is present, assume POST
        if (request.method === 'GET') {
          request.method = 'POST';
        }
        
        continue;
      }
      
      // Handle form data
      if (token === '--form' || token === '-F') {
        if (i + 1 < tokens.length) {
          const formStr = tokens[++i].replace(/^['"]|['"]$/g, ''); // Remove quotes
          const equalsIndex = formStr.indexOf('=');
          
          if (equalsIndex > 0) {
            // If we don't have a form data object yet, create one
            if (!request.body) {
              request.body = '{}';
            }
            
            try {
              const formData = JSON.parse(request.body);
              const key = formStr.substring(0, equalsIndex).trim();
              const value = formStr.substring(equalsIndex + 1).trim();
              
              formData[key] = value;
              request.body = JSON.stringify(formData, null, 2);
            } catch (e) {
              // JSON parsing failed, keep body as is
            }
          }
        }
        continue;
      }
      
      // Handle location (follows redirects)
      if (token === '--location' || token === '-L') {
        // Just skip, doesn't affect the request object
        continue;
      }
    }
    
    // Set a more descriptive name based on the URL and method
    if (request.url) {
      request.name = `${request.method} ${getUrlLastSegment(request.url)}`;
    }
    
    // Add a basic test for successful response
    request.tests.push({
      name: 'Status code is 2xx',
      script: 'pm.test("Status code is 2xx", function() { pm.response.to.be.success; });'
    });
    
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
 * Check if a string is a simple URL (just a URL without any cURL parameters)
 */
function isSimpleUrl(str: string): boolean {
  // Check if it's a valid URL format
  try {
    new URL(str);
    return true;
  } catch (e) {
    // If it doesn't have a protocol, try adding https://
    if (!str.startsWith('http://') && !str.startsWith('https://')) {
      try {
        new URL('https://' + str);
        return true;
      } catch (e2) {
        return false;
      }
    }
    return false;
  }
}

/**
 * Get the last segment of a URL for naming purposes
 */
function getUrlLastSegment(url: string): string {
  try {
    let urlStr = url;
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'https://' + urlStr;
    }
    
    const urlObj = new URL(urlStr);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length > 0) {
      return pathParts[pathParts.length - 1];
    } else {
      return urlObj.hostname;
    }
  } catch (e) {
    // If URL parsing fails, just return the last part of the string
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }
}

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
    // Check if body is JSON
    try {
      JSON.parse(request.body);
      // If it's JSON, use double quotes for the body
      curl += ` -d "${request.body.replace(/"/g, '\\"')}"`;
    } catch (e) {
      // Not JSON, use single quotes
      curl += ` -d '${request.body}'`;
    }
  }
  
  return curl;
};

export default {
  parseCurlCommand,
  convertToCurl
};
