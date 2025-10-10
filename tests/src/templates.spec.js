/**
 * Tests for templates module
 */

import { jest } from "@jest/globals";

// Mock the modules using the real path module for simpler testing
jest.unstable_mockModule("fs", () => ({
  readdirSync: jest.fn(),
  statSync: jest.fn(),
}));

const realPath = await import("path");
jest.unstable_mockModule("path", () => realPath);

describe("Templates Module", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("findTemplates", () => {
    test("should find template files with correct pattern", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockImplementation((dir) => {
        if (dir === "/templates") {
          return ["index.template.html", "style.template.css", "readme.txt"];
        }
        return [];
      });

      mockFs.statSync.mockImplementation((path) => ({
        isDirectory: () => false,
      }));

      const { findTemplates } = await import("../../src/templates.js");
      const result = findTemplates("/templates", ["html", "css"]);

      expect(result).toHaveLength(2);
      expect(result[0].keyName).toBe("index");
      expect(result[0].extension).toBe("html");
      expect(result[0].outputName).toBe("index.html");
      expect(result[1].keyName).toBe("style");
      expect(result[1].extension).toBe("css");
    });

    test("should handle empty directory", async () => {
      const mockFs = await import("fs");
      mockFs.readdirSync.mockReturnValue([]);

      const { findTemplates } = await import("../../src/templates.js");
      const result = findTemplates("/empty", ["html"]);

      expect(result).toEqual([]);
    });

    test("should handle nested directories", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockImplementation((dir) => {
        if (dir === "/templates") return ["subdir", "deep.template.html"];
        if (dir === "/templates/subdir") return ["nested.template.html"];
        return [];
      });

      mockFs.statSync.mockImplementation((path) => ({
        isDirectory: () => path.includes("subdir") && !path.includes("."),
      }));

      const { findTemplates } = await import("../../src/templates.js");
      const result = findTemplates("/templates", ["html"]);

      expect(result).toHaveLength(1);
      expect(result[0].keyName).toBe("deep");
    });

    test("should filter by extensions", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockReturnValue([
        "file1.template.html",
        "file2.template.css",
        "file3.template.js",
      ]);

      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
      });

      const { findTemplates } = await import("../../src/templates.js");
      const result = findTemplates("/templates", ["html"]);

      expect(result).toHaveLength(1);
      expect(result[0].keyName).toBe("file1");
    });

    test("should ignore non-template files", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockReturnValue([
        "regular.html",
        "template.template.html",
      ]);

      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
      });

      const { findTemplates } = await import("../../src/templates.js");
      const result = findTemplates("/templates", ["html"]);

      expect(result).toHaveLength(1);
      expect(result[0].keyName).toBe("template");
    });

    test("should use default html extension", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockReturnValue(["test.template.html"]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false });

      const { findTemplates } = await import("../../src/templates.js");
      const result = findTemplates("/templates");

      expect(result).toHaveLength(1);
      expect(result[0].extension).toBe("html");
    });
  });

  describe("findPartials", () => {
    test("should find partial files with correct pattern", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockImplementation((dir) => {
        if (dir === "/partials") {
          return ["header.partial.html", "footer.partial.html"];
        }
        return [];
      });

      mockFs.statSync.mockImplementation((path) => ({
        isDirectory: () => false,
      }));

      const { findPartials } = await import("../../src/templates.js");
      const result = findPartials("/partials", ["html", "css"]);

      expect(result).toHaveLength(2);
      expect(result[0].partialName).toBe("header");
      expect(result[0].extension).toBe("html");
      expect(result[0].fileName).toBe("header.partial.html");
      expect(result[1].partialName).toBe("footer");
    });

    test("should handle empty directory", async () => {
      const mockFs = await import("fs");
      mockFs.readdirSync.mockReturnValue([]);

      const { findPartials } = await import("../../src/templates.js");
      const result = findPartials("/empty", ["html"]);

      expect(result).toEqual([]);
    });

    test("should handle nested directories", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockImplementation((dir) => {
        if (dir === "/partials") return ["subdir", "button.partial.html"];
        if (dir === "/partials/subdir") return ["nested.partial.html"];
        return [];
      });

      mockFs.statSync.mockImplementation((path) => ({
        isDirectory: () => path.includes("subdir") && !path.includes("."),
      }));

      const { findPartials } = await import("../../src/templates.js");
      const result = findPartials("/partials", ["html"]);

      expect(result).toHaveLength(1);
      expect(result[0].partialName).toBe("button");
    });

    test("should filter by extensions", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockReturnValue([
        "comp1.partial.html",
        "comp2.partial.css",
        "comp3.partial.js",
      ]);

      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
      });

      const { findPartials } = await import("../../src/templates.js");
      const result = findPartials("/partials", ["html"]);

      expect(result).toHaveLength(1);
      expect(result[0].partialName).toBe("comp1");
    });

    test("should ignore non-partial files", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockReturnValue([
        "regular.html",
        "partial.partial.html",
      ]);

      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
      });

      const { findPartials } = await import("../../src/templates.js");
      const result = findPartials("/partials", ["html"]);

      expect(result).toHaveLength(1);
      expect(result[0].partialName).toBe("partial");
    });

    test("should use default html extension", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockReturnValue(["test.partial.html"]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false });

      const { findPartials } = await import("../../src/templates.js");
      const result = findPartials("/partials");

      expect(result).toHaveLength(1);
      expect(result[0].extension).toBe("html");
    });
  });

  describe("error handling", () => {
    test("should handle readdir errors for templates", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });

      const { findTemplates } = await import("../../src/templates.js");

      expect(() => findTemplates("/protected")).toThrow("Permission denied");
    });

    test("should handle stat errors for templates", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockReturnValue(["file.template.html"]);
      mockFs.statSync.mockImplementation(() => {
        throw new Error("Stat failed");
      });

      const { findTemplates } = await import("../../src/templates.js");

      expect(() => findTemplates("/templates")).toThrow("Stat failed");
    });

    test("should handle readdir errors for partials", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });

      const { findPartials } = await import("../../src/templates.js");

      expect(() => findPartials("/protected")).toThrow("Permission denied");
    });

    test("should handle stat errors for partials", async () => {
      const mockFs = await import("fs");

      mockFs.readdirSync.mockReturnValue(["file.partial.html"]);
      mockFs.statSync.mockImplementation(() => {
        throw new Error("Stat failed");
      });

      const { findPartials } = await import("../../src/templates.js");

      expect(() => findPartials("/partials")).toThrow("Stat failed");
    });
  });
});
