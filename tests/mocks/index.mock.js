/**
 * Mock setup utilities
 * Centralized mock management for all tests
 */

// Simple global mock objects
export const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
  mkdir: jest.fn(),
  rm: jest.fn(),
  access: jest.fn(),
  copyFile: jest.fn(),
};

export const mockFetch = jest.fn();

export const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

export const mockProcess = {
  exit: jest.fn(),
  argv: ["node", "bin/minty.js"],
  cwd: jest.fn(() => "/mock/path"),
};

// Setup all mocks
export function setupAllMocks() {
  // Make fetch available globally
  global.fetch = mockFetch;

  // Setup console
  global.console = mockConsole;

  // Setup process
  global.process = {
    ...global.process,
    exit: mockProcess.exit,
    argv: mockProcess.argv,
    cwd: mockProcess.cwd,
  };
}

// Reset all mocks
export function resetAllMocks() {
  Object.values(mockFs).forEach((mock) => mock.mockReset());
  mockFetch.mockReset();
  Object.values(mockConsole).forEach((mock) => mock.mockReset());
  Object.values(mockProcess).forEach((mock) => mock.mockReset());
}
