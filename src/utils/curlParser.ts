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

    // Normalize the command - remove extra whitespace and line breaks
    let command = curlCommand.trim().replace(/\s+/g, ' ');

    // Remove 'curl' from the beginning if present
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

    // Handle the case where the command is just a URL
    if (isSimpleUrl(command)) {
      request.url = command;
      request.name = 'GET ' + getUrlLastSegment(command);

      // Cache the result
      curlCache.set(curlCommand, { ...request });
      return request;
    }

    // Extract all parts of the command
    const parts = splitCommandIntoParts(command);

    // Process URL
    const url = extractUrl(parts);
    if (url) {
      request.url = url;

      // Extract query parameters from URL if present
      try {
        if (request.url.includes('?')) {
          const urlObj = new URL(request.url);
          urlObj.searchParams.forEach((value, key) => {
            request.params.push({ key, value });
          });

          // Remove query parameters from URL for cleaner display
          request.url = request.url.split('?')[0];
        }
      } catch (e) {
        // URL parsing failed, keep URL as is
        console.warn('Failed to parse URL query parameters:', e);
      }
    }

    // Process method
    const method = extractMethod(parts);
    if (method) {
      request.method = method;
    }

    // Process headers
    const headers = extractHeaders(parts);
    if (headers.length > 0) {
      request.headers = headers;
    }

    // Process data/body
    const body = extractBody(parts);
    if (body) {
      request.body = body;

      // If method is not specified explicitly but data is present, assume POST
      if (request.method === 'GET' && !method) {
        request.method = 'POST';
      }
    }

    // Process content type
    const contentType = extractContentType(request.headers);
    if (contentType) {
      // Format body based on content type
      formatBodyByContentType(request, contentType);
    } else if (request.body) {
      // Try to detect and format JSON body
      tryFormatJsonBody(request);
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
 * Split a cURL command into parts for easier processing
 */
function splitCommandIntoParts(command: string): string[] {
  const parts: string[] = [];
  let currentPart = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    // Handle quotes
    if ((char === '"' || char === "'") && (i === 0 || command[i-1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
      }
    }

    // Handle spaces (only split on spaces outside of quotes)
    if (char === ' ' && !inQuotes) {
      if (currentPart) {
        parts.push(currentPart);
        currentPart = '';
      }
    } else {
      currentPart += char;
    }
  }

  // Add the last part
  if (currentPart) {
    parts.push(currentPart);
  }

  return parts;
}

/**
 * Extract URL from command parts
 */
function extractUrl(parts: string[]): string | null {
  // First look for URL after -X METHOD or --request METHOD
  for (let i = 0; i < parts.length - 1; i++) {
    if ((parts[i] === '-X' || parts[i] === '--request') && i + 2 < parts.length) {
      const potentialUrl = parts[i + 2];
      if (isUrl(potentialUrl)) {
        return cleanUrl(potentialUrl);
      }
    }
  }

  // Then look for any URL in the parts
  for (const part of parts) {
    if (isUrl(part)) {
      return cleanUrl(part);
    }
  }

  // Last resort: look for anything that might be a URL
  for (const part of parts) {
    if (part.includes('.') && !part.startsWith('-')) {
      const url = cleanUrl(part);
      return url.startsWith('http') ? url : `https://${url}`;
    }
  }

  return null;
}

/**
 * Check if a string is a URL
 */
function isUrl(str: string): boolean {
  return str.startsWith('http://') ||
         str.startsWith('https://') ||
         str.startsWith('www.') ||
         /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/.test(str);
}

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
 * Clean a URL string (remove quotes, etc.)
 */
function cleanUrl(url: string): string {
  return url.replace(/^['"]|['"]$/g, '');
}

/**
 * Extract HTTP method from command parts
 */
function extractMethod(parts: string[]): string | null {
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  // Look for -X or --request followed by a method
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i] === '-X' || parts[i] === '--request') {
      const method = parts[i + 1].toUpperCase().replace(/['"]/g, '');
      if (validMethods.includes(method)) {
        return method;
      }
    }
  }

  // Check for shorthand methods like -XPOST
  for (const part of parts) {
    if (part.startsWith('-X') && part.length > 2) {
      const method = part.substring(2).toUpperCase();
      if (validMethods.includes(method)) {
        return method;
      }
    }
  }

  return null;
}

/**
 * Extract headers from command parts
 */
function extractHeaders(parts: string[]): KeyValuePair[] {
  const headers: KeyValuePair[] = [];

  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i] === '-H' || parts[i] === '--header') {
      const headerStr = parts[i + 1].replace(/^['"]|['"]$/g, '');
      const colonIndex = headerStr.indexOf(':');

      if (colonIndex > 0) {
        const key = headerStr.substring(0, colonIndex).trim();
        const value = headerStr.substring(colonIndex + 1).trim();
        headers.push({ key, value });
      }
    }
  }

  return headers;
}

/**
 * Extract body data from command parts
 */
function extractBody(parts: string[]): string | null {
  // Check for --data, -d, --data-binary, --data-raw, --data-ascii, --data-urlencode
  const dataFlags = ['--data', '-d', '--data-binary', '--data-raw', '--data-ascii', '--data-urlencode'];

  for (let i = 0; i < parts.length - 1; i++) {
    if (dataFlags.includes(parts[i])) {
      return parts[i + 1].replace(/^['"]|['"]$/g, '');
    }

    // Handle --data=value format
    for (const flag of dataFlags) {
      if (parts[i].startsWith(`${flag}=`)) {
        return parts[i].substring(flag.length + 1).replace(/^['"]|['"]$/g, '');
      }
    }
  }

  // Check for form data
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i] === '-F' || parts[i] === '--form') {
      const formData: Record<string, string> = {};

      // Collect all form fields
      for (let j = i; j < parts.length - 1; j += 2) {
        if (parts[j] === '-F' || parts[j] === '--form') {
          const formField = parts[j + 1].replace(/^['"]|['"]$/g, '');
          const equalsIndex = formField.indexOf('=');

          if (equalsIndex > 0) {
            const key = formField.substring(0, equalsIndex).trim();
            const value = formField.substring(equalsIndex + 1).trim();
            formData[key] = value;
          }
        }
      }

      // Convert to JSON
      return JSON.stringify(formData);
    }
  }

  return null;
}

/**
 * Extract content type from headers
 */
function extractContentType(headers: KeyValuePair[]): string | null {
  for (const header of headers) {
    if (header.key.toLowerCase() === 'content-type') {
      return header.value;
    }
  }
  return null;
}

/**
 * Format body based on content type
 */
function formatBodyByContentType(request: ApiRequest, contentType: string): void {
  if (contentType.includes('application/json')) {
    tryFormatJsonBody(request);
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    // Convert URL encoded form data to JSON for better display
    try {
      const formData: Record<string, string> = {};
      const params = new URLSearchParams(request.body);

      params.forEach((value, key) => {
        formData[key] = value;
      });

      request.body = JSON.stringify(formData, null, 2);
    } catch (e) {
      // Keep as is if parsing fails
    }
  }
}

/**
 * Try to format body as JSON
 */
function tryFormatJsonBody(request: ApiRequest): void {
  if (!request.body) return;

  try {
    // Check if it's already valid JSON
    const jsonBody = JSON.parse(request.body);
    request.body = JSON.stringify(jsonBody, null, 2);
  } catch (e) {
    // Try to handle escaped JSON
    try {
      // Replace escaped quotes
      const unescaped = request.body.replace(/\\"/g, '"');
      const jsonBody = JSON.parse(unescaped);
      request.body = JSON.stringify(jsonBody, null, 2);
    } catch (e2) {
      // Not valid JSON, keep as is
    }
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
