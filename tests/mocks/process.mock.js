import { jest } from "@jest/globals";

/**
 * Mock implementation for process module
 * Used to simulate process.exit and command line arguments
 */

export const process = {
  exit: jest.fn(),
  argv: ["node", "bin/minty.js"],
  cwd: jest.fn(() => "/mock/path"),
};

let originalProcessRef = null;

// Setup process mocks
export function setupProcessMocks() {
  if (!originalProcessRef) {
    originalProcessRef = {
      exit: global.process.exit,
      argv: global.process.argv,
      cwd: global.process.cwd,
    };
  }

  global.process.exit = process.exit;
  global.process.argv = [...process.argv];
  global.process.cwd = process.cwd;

  resetProcessMocks();
}

// Set command line arguments for testing
export function setArgv(args) {
  process.argv = ["node", "bin/minty.js", ...args];
  global.process.argv = [...process.argv];
}

// Reset process mocks
export function resetProcessMocks() {
  process.exit.mockReset();
  process.cwd.mockReset();
  process.cwd.mockReturnValue("/mock/path");
  process.argv = ["node", "bin/minty.js"];
  if (global.process) {
    global.process.argv = [...process.argv];
  }
}

// Restore original process implementation
export function restoreProcessMocks() {
  resetProcessMocks();

  if (originalProcessRef) {
    global.process.exit = originalProcessRef.exit;
    global.process.argv = originalProcessRef.argv;
    global.process.cwd = originalProcessRef.cwd;
    originalProcessRef = null;
  }
}
