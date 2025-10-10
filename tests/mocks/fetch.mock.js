/**
 * Mock implementation for fetch API
 * Used to simulate HTTP requests in tests
 */

// Mock responses for different URLs
export const mockResponses = {
  'https://api.example.com/data.json': {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ name: 'remote', data: ['a', 'b', 'c'] })
  },
  'https://api.example.com/invalid.json': {
    ok: false,
    status: 404,
    json: () => Promise.reject(new Error('Not Found'))
  },
  'https://api.example.com/malformed.json': {
    ok: true,
    status: 200,
    json: () => Promise.reject(new Error('Unexpected token in JSON'))
  }
};

// Main fetch mock
export const fetch = jest.fn();

// Helper to setup fetch mocks
export function setupFetchMocks() {
  fetch.mockImplementation((url) => {
    const urlStr = url.toString();
    
    if (mockResponses[urlStr]) {
      return Promise.resolve(mockResponses[urlStr]);
    }
    
    // Default to 404 for unknown URLs
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.reject(new Error('Not Found'))
    });
  });
}

// Reset fetch mock
export function resetFetchMocks() {
  fetch.mockReset();
}

// Make fetch available globally for tests
global.fetch = fetch;