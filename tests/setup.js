/**
 * Jest setup file
 * Global test configuration and utilities
 */

// Global test utilities (without imports for now)
global.testUtils = {
  // Helper to create mock file structures
  createMockFileStructure: (structure) => {
    const mockFiles = {};
    for (const [path, content] of Object.entries(structure)) {
      mockFiles[path] = content;
    }
    return mockFiles;
  },

  // Helper to create mock config
  createMockConfig: (overrides = {}) => ({
    templates: "templates",
    output: "build",
    data: "data.json",
    extensions: [".html", ".css", ".js"],
    ...overrides,
  }),

  // Helper to create mock data
  createMockData: (overrides = {}) => ({
    site: {
      title: "Test Site",
      description: "A test website",
    },
    items: [
      { title: "Item 1", slug: "item-1" },
      { title: "Item 2", slug: "item-2" },
    ],
    ...overrides,
  }),
};

// Simple mock for jest if not available
if (typeof jest === "undefined") {
  global.jest = {
    fn: () => {
      const mock = function (...args) {
        mock.mock.calls.push(args);
        if (mock.mock.implementation) {
          return mock.mock.implementation(...args);
        }
        return mock.mock.results[mock.mock.calls.length - 1]?.value;
      };
      mock.mock = { calls: [], results: [] };
      mock.mockImplementation = (fn) => {
        mock.mock.implementation = fn;
        return mock;
      };
      mock.mockResolvedValue = (value) => {
        mock.mock.implementation = () => Promise.resolve(value);
        return mock;
      };
      mock.mockRejectedValue = (error) => {
        mock.mock.implementation = () => Promise.reject(error);
        return mock;
      };
      mock.mockReset = () => {
        mock.mock.calls = [];
        mock.mock.results = [];
        mock.mock.implementation = undefined;
      };
      return mock;
    },
  };
}
