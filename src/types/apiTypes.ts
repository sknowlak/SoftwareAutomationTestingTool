/**
 * API Types
 * Type definitions for API testing module
 */

export interface KeyValuePair {
  key: string;
  value: string;
  description?: string;
  enabled?: boolean;
}

export interface ApiTest {
  name: string;
  script: string;
  enabled?: boolean;
}

export interface RequestSettings {
  useCorsMode?: boolean;
  followRedirects?: boolean;
  verifySsl?: boolean;
}

export interface ApiRequest {
  id: string;
  name: string;
  description?: string;
  url: string;
  method: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  tests: ApiTest[];
  preRequestScript?: string;
  postResponseScript?: string;
  folderId?: string;
  settings?: RequestSettings;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
  testResults?: {
    name: string;
    passed: boolean;
    error?: string;
  }[];
}

export interface ApiFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface ApiCollection {
  id: string;
  name: string;
  description?: string;
  requests: ApiRequest[];
  folders?: ApiFolder[];
}

export interface ApiEnvironmentVariable {
  key: string;
  value: string;
  description?: string;
  enabled?: boolean;
}

export interface ApiEnvironment {
  id: string;
  name: string;
  description?: string;
  variables: ApiEnvironmentVariable[];
}

export interface ApiHistory {
  id: string;
  requestId: string;
  collectionId: string;
  request: ApiRequest;
  response: ApiResponse;
  timestamp: Date;
}

export interface ApiWorkspace {
  id: string;
  name: string;
  description?: string;
  collections: string[]; // Collection IDs
  environments: string[]; // Environment IDs
}

export interface ApiTestResult {
  id: string;
  name: string;
  collectionId: string;
  environmentId?: string;
  timestamp: Date;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  results: {
    requestId: string;
    requestName: string;
    success: boolean;
    statusCode: number;
    duration: number;
    testResults: {
      name: string;
      passed: boolean;
      error?: string;
    }[];
  }[];
}
