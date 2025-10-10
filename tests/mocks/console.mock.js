import { jest } from "@jest/globals";

/**
 * Mock implementation for console module
 * Used to capture and test console output
 */

export const console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

let originalConsoleRef = null;

// Capture console output
export function setupConsoleMocks() {
  if (!originalConsoleRef) {
    originalConsoleRef = global.console;
  }

  global.console = {
    ...originalConsoleRef,
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  resetConsoleMocks();
}

// Get logged messages
export function getLoggedMessages() {
  return {
    log: console.log.mock.calls.map((call) => call.join(" ")),
    error: console.error.mock.calls.map((call) => call.join(" ")),
    warn: console.warn.mock.calls.map((call) => call.join(" ")),
    info: console.info.mock.calls.map((call) => call.join(" ")),
  };
}

// Reset console mocks
export function resetConsoleMocks() {
  Object.values(console).forEach((mock) => mock.mockReset());
}

// Restore original console implementation
export function restoreConsoleMocks() {
  resetConsoleMocks();

  if (originalConsoleRef) {
    global.console = originalConsoleRef;
    originalConsoleRef = null;
  }
}
