import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Test Cases API
export const getTestCases = () => api.get('/test-cases')
export const getTestCase = (id: number) => api.get(`/test-cases/${id}`)
export const createTestCase = (data: any) => api.post('/test-cases', data)
export const updateTestCase = (id: number, data: any) => api.put(`/test-cases/${id}`, data)
export const deleteTestCase = (id: number) => api.delete(`/test-cases/${id}`)

// Test Runs API
export const getTestRuns = () => api.get('/test-runs')
export const getTestRun = (id: number) => api.get(`/test-runs/${id}`)
export const startTestRun = (data: any) => api.post('/test-runs/start', data)

// Recorder API
export const startRecording = (data: FormData) => api.post('/recordings/start', data, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})
export const stopRecording = (data: FormData) => api.post('/recordings/stop', data, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

// Test Generator API
export const generateTest = (data: FormData) => api.post('/test-generator/generate', data, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

export default api
