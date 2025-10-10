import { beforeEach, describe, expect, jest, test } from "@jest/globals";

describe("Build Module", () => {
  let mockConfig;
  let mockData;
  let mockTemplates;
  let mockFiles;
  let mockRenderer;
  let mockPath;
  let consoleSpy;
  let consoleErrorSpy;

  beforeEach(async () => {
    jest.unstable_mockModule("../../src/config.js", () => ({
      loadConfig: jest.fn(),
    }));

    jest.unstable_mockModule("../../src/data.js", () => ({
      loadData: jest.fn(),
    }));

    jest.unstable_mockModule("../../src/templates.js", () => ({
      findTemplates: jest.fn(),
    }));

    jest.unstable_mockModule("../../src/renderer.js", () => ({
      renderTemplate: jest.fn(),
    }));

    jest.unstable_mockModule("../../src/files.js", () => ({
      clearDist: jest.fn(),
      copyStaticFiles: jest.fn(),
      writeRenderedFile: jest.fn(),
    }));

    jest.unstable_mockModule("path", () => ({
      join: jest.fn((...args) => args.join("/")),
    }));

    mockConfig = await import("../../src/config.js");
    mockData = await import("../../src/data.js");
    mockTemplates = await import("../../src/templates.js");
    mockFiles = await import("../../src/files.js");
    mockRenderer = await import("../../src/renderer.js");
    mockPath = await import("path");

    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(Date, "now").mockReturnValue(1000);
  });

  describe("build", () => {
    test("should execute complete build process successfully", async () => {
      const { build } = await import("../../src/build.js");

      // Mock configuration
      mockConfig.loadConfig.mockReturnValue({
        rootDir: "/src",
        distDir: "/dist",
        jsonPath: "/data.json",
        extensions: ["html"],
      });

      // Mock data
      mockData.loadData.mockResolvedValue({
        common: { siteName: "Test Site" },
        home: { title: "Home Page" },
        about: { title: "About Page" },
      });

      // Mock templates
      mockTemplates.findTemplates.mockReturnValue([
        {
          fileName: "index.template.html",
          fullPath: "/src/index.template.html",
          keyName: "home",
          outputDir: "",
          outputName: "index.html",
          extension: "html",
        },
        {
          fileName: "about.template.html",
          fullPath: "/src/about.template.html",
          keyName: "about",
          outputDir: "",
          outputName: "about.html",
          extension: "html",
        },
      ]);

      // Mock renderer
      mockRenderer.renderTemplate.mockReturnValue({
        success: true,
        html: "<html><body>Rendered content</body></html>",
      });

      const result = await build();

      expect(mockConfig.loadConfig).toHaveBeenCalled();
      expect(mockData.loadData).toHaveBeenCalledWith("/data.json");
      expect(mockFiles.clearDist).toHaveBeenCalledWith("/dist");
      expect(mockFiles.copyStaticFiles).toHaveBeenCalledWith("/src", "/dist");
      expect(mockTemplates.findTemplates).toHaveBeenCalledWith("/src", [
        "html",
      ]);
      expect(mockRenderer.renderTemplate).toHaveBeenCalledTimes(2);
      expect(mockFiles.writeRenderedFile).toHaveBeenCalledTimes(2);

      expect(result).toEqual({
        success: true,
        rendered: 2,
        skipped: 0,
        buildTimeMs: 0, // Date.now() mocked to return 1000 for both calls
        wildcardGenerated: 0,
      });
    });

    test("should handle wildcard templates", async () => {
      const { build } = await import("../../src/build.js");

      mockConfig.loadConfig.mockReturnValue({
        rootDir: "/src",
        distDir: "/dist",
        jsonPath: "/data.json",
        extensions: ["html"],
      });

      mockData.loadData.mockResolvedValue({
        common: { siteName: "Test Site" },
        "page*": {
          house1: { title: "House 1" },
          house2: { title: "House 2" },
        },
      });

      mockTemplates.findTemplates.mockReturnValue([
        {
          fileName: "page.template.html",
          fullPath: "/src/page.template.html",
          keyName: "page",
          outputDir: "",
          outputName: "page.html",
          extension: "html",
        },
      ]);

      mockRenderer.renderTemplate.mockReturnValue({
        success: true,
        html: "<html><body>House content</body></html>",
      });

      const result = await build();

      expect(mockRenderer.renderTemplate).toHaveBeenCalledTimes(2);
      expect(mockRenderer.renderTemplate).toHaveBeenCalledWith(
        "/src/page.template.html",
        "page",
        expect.any(Object),
        "house1",
        "/src",
        ["html"]
      );
      expect(mockRenderer.renderTemplate).toHaveBeenCalledWith(
        "/src/page.template.html",
        "page",
        expect.any(Object),
        "house2",
        "/src",
        ["html"]
      );

      expect(mockFiles.writeRenderedFile).toHaveBeenCalledWith(
        "/dist",
        "/page.house1.html",
        "<html><body>House content</body></html>"
      );
      expect(mockFiles.writeRenderedFile).toHaveBeenCalledWith(
        "/dist",
        "/page.house2.html",
        "<html><body>House content</body></html>"
      );

      expect(result).toEqual({
        success: true,
        rendered: 2,
        skipped: 0,
        buildTimeMs: 0,
        wildcardGenerated: 2,
      });
    });

    test("should handle template rendering errors", async () => {
      const { build } = await import("../../src/build.js");

      mockConfig.loadConfig.mockReturnValue({
        rootDir: "/src",
        distDir: "/dist",
        jsonPath: "/data.json",
        extensions: ["html"],
      });

      mockData.loadData.mockResolvedValue({
        common: { siteName: "Test Site" },
        home: { title: "Home Page" },
      });

      mockTemplates.findTemplates.mockReturnValue([
        {
          fileName: "index.template.html",
          fullPath: "/src/index.template.html",
          keyName: "home",
          outputDir: "",
          outputName: "index.html",
          extension: "html",
        },
        {
          fileName: "broken.template.html",
          fullPath: "/src/broken.template.html",
          keyName: "broken",
          outputDir: "",
          outputName: "broken.html",
          extension: "html",
        },
      ]);

      mockRenderer.renderTemplate
        .mockReturnValueOnce({
          success: true,
          html: "<html><body>Good content</body></html>",
        })
        .mockReturnValueOnce({
          success: false,
          error: "Template syntax error",
        });

      const result = await build();

      expect(mockFiles.writeRenderedFile).toHaveBeenCalledTimes(1);
      expect(mockFiles.writeRenderedFile).toHaveBeenCalledWith(
        "/dist",
        "/index.html",
        "<html><body>Good content</body></html>"
      );

      expect(result).toEqual({
        success: false,
        rendered: 1,
        skipped: 1,
        errors: ["Template syntax error"],
        buildTimeMs: 0,
        wildcardGenerated: 0,
      });
    });

    test("should handle build process errors", async () => {
      const { build } = await import("../../src/build.js");

      mockConfig.loadConfig.mockImplementation(() => {
        throw new Error("Configuration file not found");
      });

      const result = await build();

      expect(result).toEqual({
        success: false,
        error: "Configuration file not found",
      });
    });

    test("should handle wildcard rendering errors", async () => {
      const { build } = await import("../../src/build.js");

      mockConfig.loadConfig.mockReturnValue({
        rootDir: "/src",
        distDir: "/dist",
        jsonPath: "/data.json",
        extensions: ["html"],
      });

      mockData.loadData.mockResolvedValue({
        common: { siteName: "Test Site" },
        "page*": {
          house1: { title: "House 1" },
          house2: { title: "House 2" },
        },
      });

      mockTemplates.findTemplates.mockReturnValue([
        {
          fileName: "page.template.html",
          fullPath: "/src/page.template.html",
          keyName: "page",
          outputDir: "",
          outputName: "page.html",
          extension: "html",
        },
      ]);

      mockRenderer.renderTemplate
        .mockReturnValueOnce({
          success: true,
          html: "<html><body>House 1 content</body></html>",
        })
        .mockReturnValueOnce({
          success: false,
          error: "Failed to render house2",
        });

      const result = await build();

      expect(mockFiles.writeRenderedFile).toHaveBeenCalledTimes(1);
      expect(mockFiles.writeRenderedFile).toHaveBeenCalledWith(
        "/dist",
        "/page.house1.html",
        "<html><body>House 1 content</body></html>"
      );

      expect(result).toEqual({
        success: false,
        rendered: 1,
        skipped: 1,
        errors: ["Failed to render house2"],
        buildTimeMs: 0,
        wildcardGenerated: 1,
      });
    });

    test("should handle empty templates array", async () => {
      const { build } = await import("../../src/build.js");

      mockConfig.loadConfig.mockReturnValue({
        rootDir: "/src",
        distDir: "/dist",
        jsonPath: "/data.json",
        extensions: ["html"],
      });

      mockData.loadData.mockResolvedValue({
        common: { siteName: "Test Site" },
      });

      mockTemplates.findTemplates.mockReturnValue([]);

      const result = await build();

      expect(mockRenderer.renderTemplate).not.toHaveBeenCalled();
      expect(mockFiles.writeRenderedFile).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        rendered: 0,
        skipped: 0,
        buildTimeMs: 0,
        wildcardGenerated: 0,
      });
    });

    afterEach(() => {
      if (consoleSpy) {
        consoleSpy.mockRestore();
      }
      if (consoleErrorSpy) {
        consoleErrorSpy.mockRestore();
      }

      // Clear all mocks
      if (mockConfig && mockConfig.loadConfig) {
        mockConfig.loadConfig.mockClear();
      }
      if (mockData && mockData.loadData) {
        mockData.loadData.mockClear();
      }
      if (mockTemplates && mockTemplates.findTemplates) {
        mockTemplates.findTemplates.mockClear();
      }
      if (mockRenderer && mockRenderer.renderTemplate) {
        mockRenderer.renderTemplate.mockClear();
      }
      if (mockFiles) {
        if (mockFiles.clearDist) mockFiles.clearDist.mockClear();
        if (mockFiles.copyStaticFiles) mockFiles.copyStaticFiles.mockClear();
        if (mockFiles.writeRenderedFile)
          mockFiles.writeRenderedFile.mockClear();
      }

      jest.restoreAllMocks();
    });
  });
});
