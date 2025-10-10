/**
 * Tests for data module
 */

import { jest } from "@jest/globals";

// Mock the modules before importing the main module
jest.unstable_mockModule("fs", () => ({
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

jest.unstable_mockModule("console", () => ({
  log: jest.fn(),
  warn: jest.fn(),
}));

describe("Data Module", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("isValidUrl", () => {
    test("should return true for valid HTTP URLs", async () => {
      const { isValidUrl } = await import("../../src/data.js");
      expect(isValidUrl("http://example.com")).toBe(true);
      expect(isValidUrl("http://example.com/data.json")).toBe(true);
    });

    test("should return true for valid HTTPS URLs", async () => {
      const { isValidUrl } = await import("../../src/data.js");
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("https://api.example.com/data.json")).toBe(true);
    });

    test("should return false for invalid URLs", async () => {
      const { isValidUrl } = await import("../../src/data.js");
      expect(isValidUrl("ftp://example.com")).toBe(false);
      expect(isValidUrl("file:///path/to/file")).toBe(false);
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
      expect(isValidUrl(123)).toBe(false);
    });

    test("should handle malformed URLs", async () => {
      const { isValidUrl } = await import("../../src/data.js");
      expect(isValidUrl("http://")).toBe(false);
      expect(isValidUrl("https://")).toBe(false);
      expect(isValidUrl("http://[invalid")).toBe(false);
    });
  });

  describe("loadData", () => {
    describe("remote URL loading", () => {
      test("should load valid JSON from remote URL", async () => {
        const mockData = {
          common: { title: "Test Site" },
          pages: { home: { content: "Welcome" } },
        };

        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: {
            get: jest.fn().mockReturnValue("application/json"),
          },
          json: jest.fn().mockResolvedValue(mockData),
        });

        const { loadData } = await import("../../src/data.js");
        const result = await loadData("https://api.example.com/data.json");

        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.example.com/data.json",
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "Minty/1.0.0",
            },
            timeout: 10000,
          }
        );
      });

      test("should handle HTTP error responses", async () => {
        global.fetch.mockResolvedValue({
          ok: false,
          status: 404,
          statusText: "Not Found",
        });

        const { loadData } = await import("../../src/data.js");
        await expect(
          loadData("https://api.example.com/data.json")
        ).rejects.toThrow(
          "Failed to fetch remote JSON from https://api.example.com/data.json: HTTP 404: Not Found"
        );
      });

      test("should handle network errors", async () => {
        global.fetch.mockRejectedValue(new Error("Network error"));

        const { loadData } = await import("../../src/data.js");
        await expect(
          loadData("https://api.example.com/data.json")
        ).rejects.toThrow(
          "Failed to fetch remote JSON from https://api.example.com/data.json: Network error"
        );
      });

      test("should handle timeout errors", async () => {
        const timeoutError = new Error("Timeout");
        timeoutError.name = "AbortError";
        global.fetch.mockRejectedValue(timeoutError);

        const { loadData } = await import("../../src/data.js");
        await expect(
          loadData("https://api.example.com/data.json")
        ).rejects.toThrow(
          "Request timeout: Unable to fetch JSON from https://api.example.com/data.json (10s timeout)"
        );
      });

      test("should warn about incorrect content type", async () => {
        const mockData = { common: { title: "Test" } };

        // Spy on console.warn directly
        const consoleSpy = jest
          .spyOn(console, "warn")
          .mockImplementation(() => {});

        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: {
            get: jest.fn().mockReturnValue("text/html"),
          },
          json: jest.fn().mockResolvedValue(mockData),
        });

        const { loadData } = await import("../../src/data.js");
        await loadData("https://api.example.com/data.json");

        expect(consoleSpy).toHaveBeenCalledWith(
          `⚠️  Warning: Content-Type is 'text/html', expected 'application/json'`
        );

        consoleSpy.mockRestore();
      });

      test("should handle missing content type", async () => {
        const mockData = { common: { title: "Test" } };

        // Spy on console.warn directly
        const consoleSpy = jest
          .spyOn(console, "warn")
          .mockImplementation(() => {});

        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: {
            get: jest.fn().mockReturnValue(null),
          },
          json: jest.fn().mockResolvedValue(mockData),
        });

        const { loadData } = await import("../../src/data.js");
        await loadData("https://api.example.com/data.json");

        expect(consoleSpy).toHaveBeenCalledWith(
          `⚠️  Warning: Content-Type is 'null', expected 'application/json'`
        );

        consoleSpy.mockRestore();
      });

      test("should handle JSON parsing errors", async () => {
        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: {
            get: jest.fn().mockReturnValue("application/json"),
          },
          json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
        });

        const { loadData } = await import("../../src/data.js");
        await expect(
          loadData("https://api.example.com/data.json")
        ).rejects.toThrow(
          "Failed to fetch remote JSON from https://api.example.com/data.json: Invalid JSON"
        );
      });
    });

    describe("local file loading", () => {
      test("should load valid JSON from local file", async () => {
        const mockData = {
          common: { title: "Test Site" },
          pages: { home: { content: "Welcome" } },
        };
        const mockFs = await import("fs");

        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

        const { loadData } = await import("../../src/data.js");
        const result = await loadData("./data.json");

        expect(result).toEqual(mockData);
        expect(mockFs.existsSync).toHaveBeenCalledWith("./data.json");
        expect(mockFs.readFileSync).toHaveBeenCalledWith(
          "./data.json",
          "utf-8"
        );
      });

      test("should throw error for missing file", async () => {
        const mockFs = await import("fs");
        mockFs.existsSync.mockReturnValue(false);

        const { loadData } = await import("../../src/data.js");
        await expect(loadData("./missing.json")).rejects.toThrow(
          "JSON data file not found at ./missing.json\nPlease ensure the jsonPath in .mintyrc points to a valid JSON file."
        );
      });

      test("should handle JSON syntax errors", async () => {
        const mockFs = await import("fs");
        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockReturnValue("{ invalid json }");

        const { loadData } = await import("../../src/data.js");
        await expect(loadData("./invalid.json")).rejects.toThrow(
          "Invalid JSON in local file:"
        );
      });

      test("should handle file read errors", async () => {
        const mockFs = await import("fs");
        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockImplementation(() => {
          throw new Error("Permission denied");
        });

        const { loadData } = await import("../../src/data.js");
        await expect(loadData("./data.json")).rejects.toThrow(
          "Permission denied"
        );
      });
    });

    describe("data validation", () => {
      test("should reject data without common key", async () => {
        const mockData = { pages: { home: { content: "Welcome" } } };
        const mockFs = await import("fs");

        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

        const { loadData } = await import("../../src/data.js");
        await expect(loadData("./data.json")).rejects.toThrow(
          'JSON data must contain a "common" key with shared data for all pages.\nSource: Local file: ./data.json'
        );
      });

      test("should reject data with invalid common key type", async () => {
        const mockData = { common: "not an object" };
        const mockFs = await import("fs");

        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

        const { loadData } = await import("../../src/data.js");
        await expect(loadData("./data.json")).rejects.toThrow(
          'JSON data must contain a "common" key with shared data for all pages.'
        );
      });

      test("should reject remote data without common key", async () => {
        const mockData = { pages: { home: { content: "Welcome" } } };

        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: {
            get: jest.fn().mockReturnValue("application/json"),
          },
          json: jest.fn().mockResolvedValue(mockData),
        });

        const { loadData } = await import("../../src/data.js");
        await expect(
          loadData("https://api.example.com/data.json")
        ).rejects.toThrow(
          'JSON data must contain a "common" key with shared data for all pages.\nSource: Remote URL: https://api.example.com/data.json'
        );
      });
    });
  });
});
