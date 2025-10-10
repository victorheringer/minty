import { beforeEach, describe, expect, jest, test } from "@jest/globals";

describe("Config Module", () => {
  let mockFs;
  let mockPath;
  let mockUrl;

  beforeEach(async () => {
    jest.unstable_mockModule("fs/promises", () => ({
      readFile: jest.fn(),
      access: jest.fn(),
    }));

    jest.unstable_mockModule("path", () => ({
      join: jest.fn((...args) => args.join("/")),
      dirname: jest.fn((filePath) =>
        filePath.split("/").slice(0, -1).join("/")
      ),
      resolve: jest.fn((...args) => {
        if (args.length === 1) return args[0];
        if (args[1] === "..") return args[0].split("/").slice(0, -1).join("/");
        return args.join("/");
      }),
    }));

    jest.unstable_mockModule("url", () => ({
      fileURLToPath: jest.fn(() => "/mock/src/config.js"),
    }));

    mockFs = await import("fs/promises");
    mockPath = await import("path");
    mockUrl = await import("url");
  });

  describe("defaultConfig", () => {
    test("should export frozen default configuration", async () => {
      const { defaultConfig } = await import("../../src/config.js");

      expect(defaultConfig).toEqual({
        templates: "templates",
        output: "build",
        data: "data.json",
        extensions: [".html", ".css", ".js", ".md", ".txt", ".xml", ".json"],
      });

      // Should be frozen
      expect(Object.isFrozen(defaultConfig)).toBe(true);
    });
  });

  describe("loadConfig", () => {
    test("should load config from .mintyrc file", async () => {
      const { loadConfig } = await import("../../src/config.js");

      const configContent = JSON.stringify({
        templates: "custom-templates",
        output: "dist",
        data: "custom-data.json",
        extensions: [".html", ".css"],
      });

      mockFs.access.mockResolvedValueOnce(); // First access succeeds
      mockFs.readFile.mockResolvedValueOnce(configContent);

      const config = await loadConfig();

      expect(config).toEqual({
        templates: "custom-templates",
        output: "dist",
        data: "custom-data.json",
        extensions: [".html", ".css"],
      });
    });

    test("should use default config when .mintyrc not found", async () => {
      const { loadConfig } = await import("../../src/config.js");

      // Mock directory traversal to simulate reaching root
      mockPath.resolve
        .mockReturnValueOnce("/mock") // Initial currentDir
        .mockReturnValueOnce("/") // Parent directory
        .mockReturnValueOnce("/mock") // currentDir again
        .mockReturnValueOnce("/"); // Parent again (root reached)

      mockFs.access.mockRejectedValue(new Error("File not found"));

      const config = await loadConfig();

      expect(config).toEqual({
        templates: "templates",
        output: "build",
        data: "data.json",
        extensions: [".html", ".css", ".js", ".md", ".txt", ".xml", ".json"],
      });
    });

    test("should merge partial config with defaults", async () => {
      const { loadConfig } = await import("../../src/config.js");

      const configContent = JSON.stringify({
        templates: "src",
        // output and data missing - should use defaults
      });

      mockFs.access.mockResolvedValueOnce();
      mockFs.readFile.mockResolvedValueOnce(configContent);

      const config = await loadConfig();

      expect(config).toEqual({
        templates: "src",
        output: "build", // default
        data: "data.json", // default
        extensions: [".html", ".css", ".js", ".md", ".txt", ".xml", ".json"], // default
      });
    });

    test("should validate and clean extension formats", async () => {
      const { loadConfig } = await import("../../src/config.js");

      const configContent = JSON.stringify({
        extensions: ["html", ".css", "js", ".md", "", "   "], // Mixed formats and empty
      });

      mockFs.access.mockResolvedValueOnce();
      mockFs.readFile.mockResolvedValueOnce(configContent);

      const config = await loadConfig();

      expect(config.extensions).toEqual([".html", ".css", ".js", ".md"]);
    });

    test("should ignore invalid values and use defaults", async () => {
      const { loadConfig } = await import("../../src/config.js");

      const configContent = JSON.stringify({
        templates: "", // Empty string should use default
        output: "   ", // Whitespace only should use default
        data: 123, // Non-string should use default
        extensions: "not-an-array", // Non-array should use default
      });

      mockFs.access.mockResolvedValueOnce();
      mockFs.readFile.mockResolvedValueOnce(configContent);

      const config = await loadConfig();

      expect(config).toEqual({
        templates: "templates", // default
        output: "build", // default
        data: "data.json", // default
        extensions: [".html", ".css", ".js", ".md", ".txt", ".xml", ".json"], // default
      });
    });

    test("should handle invalid JSON gracefully", async () => {
      const { loadConfig } = await import("../../src/config.js");

      // Mock directory traversal to simulate reaching root after JSON error
      mockPath.resolve
        .mockReturnValueOnce("/mock") // Initial currentDir
        .mockReturnValueOnce("/") // Parent directory
        .mockReturnValueOnce("/mock") // currentDir again
        .mockReturnValueOnce("/"); // Parent again (root reached)

      mockFs.access.mockResolvedValueOnce();
      mockFs.readFile.mockResolvedValueOnce("invalid json");

      const config = await loadConfig();

      // Should fall back to defaults since JSON parsing failed
      expect(config).toEqual({
        templates: "templates",
        output: "build",
        data: "data.json",
        extensions: [".html", ".css", ".js", ".md", ".txt", ".xml", ".json"],
      });
    });

    test("should handle extensions with all invalid values", async () => {
      const { loadConfig } = await import("../../src/config.js");

      const configContent = JSON.stringify({
        extensions: [123, null, "", "   ", {}], // All invalid values
      });

      mockFs.access.mockResolvedValueOnce();
      mockFs.readFile.mockResolvedValueOnce(configContent);

      const config = await loadConfig();

      // Should use default extensions since no valid ones provided
      expect(config.extensions).toEqual([
        ".html",
        ".css",
        ".js",
        ".md",
        ".txt",
        ".xml",
        ".json",
      ]);
    });

    test("should trim whitespace from valid string values", async () => {
      const { loadConfig } = await import("../../src/config.js");

      const configContent = JSON.stringify({
        templates: "  src  ",
        output: "  dist  ",
        data: "  custom.json  ",
      });

      mockFs.access.mockResolvedValueOnce();
      mockFs.readFile.mockResolvedValueOnce(configContent);

      const config = await loadConfig();

      expect(config).toEqual({
        templates: "src",
        output: "dist",
        data: "custom.json",
        extensions: [".html", ".css", ".js", ".md", ".txt", ".xml", ".json"],
      });
    });

    test("should handle empty extensions array", async () => {
      const { loadConfig } = await import("../../src/config.js");

      const configContent = JSON.stringify({
        extensions: [], // Empty array should use default
      });

      mockFs.access.mockResolvedValueOnce();
      mockFs.readFile.mockResolvedValueOnce(configContent);

      const config = await loadConfig();

      expect(config.extensions).toEqual([
        ".html",
        ".css",
        ".js",
        ".md",
        ".txt",
        ".xml",
        ".json",
      ]);
    });
  });
});
