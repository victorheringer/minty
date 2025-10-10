/**
 * Jest configuration for native ESM modules
 */

export default {
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: ["src/**/*.js", "bin/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testMatch: ["**/tests/**/*.spec.js"],
  transform: {},
  testTimeout: 10000,
  moduleFileExtensions: ["js", "mjs"],
  transformIgnorePatterns: ["node_modules/(?!(.*\\.mjs$))"],
};
