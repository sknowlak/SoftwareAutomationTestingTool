/**
 * Swagger/OpenAPI Parser Utility
 * Converts Swagger/OpenAPI specifications into API collections
 */

import { ApiCollection, ApiRequest, KeyValuePair } from '../types/apiTypes';
import { v4 as uuidv4 } from 'uuid';

interface SwaggerParameter {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  schema?: any;
  type?: string;
}

interface SwaggerPath {
  [method: string]: {
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: SwaggerParameter[];
    requestBody?: {
      content?: {
        [contentType: string]: {
          schema?: any;
          example?: any;
        };
      };
    };
    responses?: {
      [code: string]: {
        description?: string;
        content?: {
          [contentType: string]: {
            schema?: any;
            example?: any;
          };
        };
      };
    };
  };
}

interface SwaggerSpec {
  swagger?: string;
  openapi?: string;
  info?: {
    title?: string;
    description?: string;
    version?: string;
  };
  host?: string;
  basePath?: string;
  servers?: {
    url: string;
    description?: string;
  }[];
  paths?: {
    [path: string]: SwaggerPath;
  };
}

/**
 * Parse a Swagger/OpenAPI specification into an ApiCollection
 * @param spec The Swagger/OpenAPI specification (JSON or YAML)
 * @returns An ApiCollection object
 */
export const parseSwaggerSpec = (specString: string): ApiCollection | null => {
  try {
    // Parse the specification
    let spec: SwaggerSpec;
    try {
      spec = JSON.parse(specString);
    } catch (e) {
      // If JSON parsing fails, it might be YAML
      console.error('Failed to parse Swagger spec as JSON:', e);
      return null;
    }

    // Create a new collection
    const collection: ApiCollection = {
      id: uuidv4(),
      name: spec.info?.title || 'Imported API',
      description: spec.info?.description || `Imported from ${spec.swagger || spec.openapi} specification`,
      requests: []
    };

    // Determine base URL
    let baseUrl = '';
    if (spec.servers && spec.servers.length > 0) {
      // OpenAPI 3.0
      baseUrl = spec.servers[0].url;
    } else if (spec.host && spec.basePath) {
      // Swagger 2.0
      const scheme = 'https'; // Default to https
      baseUrl = `${scheme}://${spec.host}${spec.basePath}`;
    }

    // Process paths
    if (spec.paths) {
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(pathItem)) {
          if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
            const request: ApiRequest = {
              id: uuidv4(),
              name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
              url: `${baseUrl}${path}`,
              method: method.toUpperCase(),
              headers: [
                { key: 'Content-Type', value: 'application/json' }
              ],
              params: [],
              body: '',
              tests: []
            };

            // Process parameters
            if (operation.parameters) {
              for (const param of operation.parameters) {
                if (param.in === 'query') {
                  request.params.push({
                    key: param.name,
                    value: '',
                    description: param.description
                  });
                } else if (param.in === 'header') {
                  request.headers.push({
                    key: param.name,
                    value: '',
                    description: param.description
                  });
                }
              }
            }

            // Process request body
            if (operation.requestBody && operation.requestBody.content) {
              const contentType = Object.keys(operation.requestBody.content)[0];
              const content = operation.requestBody.content[contentType];
              
              if (content.example) {
                request.body = JSON.stringify(content.example, null, 2);
              } else if (content.schema) {
                // Generate a sample body based on the schema
                request.body = JSON.stringify(generateSampleFromSchema(content.schema), null, 2);
              }
            }

            // Add basic test for successful response
            request.tests.push({
              name: 'Status code is 2xx',
              script: 'pm.test("Status code is 2xx", function() { pm.response.to.be.success; });'
            });

            collection.requests.push(request);
          }
        }
      }
    }

    return collection;
  } catch (error) {
    console.error('Error parsing Swagger specification:', error);
    return null;
  }
};

/**
 * Generate a sample object from a JSON Schema
 * @param schema The JSON Schema
 * @returns A sample object based on the schema
 */
const generateSampleFromSchema = (schema: any): any => {
  if (!schema) return {};

  if (schema.example) {
    return schema.example;
  }

  if (schema.type === 'object' || schema.properties) {
    const result: any = {};
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        result[key] = generateSampleFromSchema(prop);
      }
    }
    return result;
  }

  if (schema.type === 'array' || schema.items) {
    return [generateSampleFromSchema(schema.items)];
  }

  // Handle primitive types
  switch (schema.type) {
    case 'string':
      return schema.enum ? schema.enum[0] : 'string';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'null':
      return null;
    default:
      return {};
  }
};

export default {
  parseSwaggerSpec
};
