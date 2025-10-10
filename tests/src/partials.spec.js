/**
 * Tests for partials module
 */

import { jest } from "@jest/globals";

// Mock the modules before importing the main module
jest.unstable_mockModule("fs", () => ({
  readFileSync: jest.fn(),
}));

jest.unstable_mockModule("handlebars", () => ({
  default: {
    compile: jest.fn(),
  },
}));

jest.unstable_mockModule("../../src/templates.js", () => ({
  findPartials: jest.fn(),
}));

describe("Partials Module", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("extractPartialFileName", () => {
    test("should return first truthy capture", async () => {
      const { extractPartialFileName } = await import("../../src/partials.js");

      expect(
        extractPartialFileName(["@match", undefined, "header.partial.html"])
      ).toBe("header.partial.html");
    });

    test("should return null when no captures present", async () => {
      const { extractPartialFileName } = await import("../../src/partials.js");

      expect(extractPartialFileName(["@match"])).toBeNull();
    });

    test("should return null for non-array input", async () => {
      const { extractPartialFileName } = await import("../../src/partials.js");

      expect(extractPartialFileName(null)).toBeNull();
      expect(extractPartialFileName(undefined)).toBeNull();
    });
  });

  describe("createPartialMap", () => {
    test("should create map from partials list", async () => {
      const mockTemplates = await import("../../sr../../src/templates.js");

      const partials = [
        {
          fileName: "header.partial.html",
          fullPath: "/path/header.partial.html",
        },
        {
          fileName: "footer.partial.html",
          fullPath: "/path/footer.partial.html",
        },
      ];

      mockTemplates.findPartials.mockReturnValue(partials);

      const { createPartialMap } = await import("../../src/partials.js");
      const result = createPartialMap("/templates", ["html"]);

      expect(result).toBeInstanceOf(Map);
      expect(result.get("header.partial.html")).toBe(
        "/path/header.partial.html"
      );
      expect(result.get("footer.partial.html")).toBe(
        "/path/footer.partial.html"
      );
      expect(mockTemplates.findPartials).toHaveBeenCalledWith("/templates", [
        "html",
      ]);
    });

    test("should use default html extension", async () => {
      const mockTemplates = await import("../../src/templates.js");
      mockTemplates.findPartials.mockReturnValue([]);

      const { createPartialMap } = await import("../../src/partials.js");
      createPartialMap("/templates");

      expect(mockTemplates.findPartials).toHaveBeenCalledWith("/templates", [
        "html",
      ]);
    });

    test("should handle empty partials list", async () => {
      const mockTemplates = await import("../../src/templates.js");
      mockTemplates.findPartials.mockReturnValue([]);

      const { createPartialMap } = await import("../../src/partials.js");
      const result = createPartialMap("/templates", ["html"]);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });

  describe("renderPartial", () => {
    test("should render partial with data", async () => {
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const partialContent = "<h1>{{title}}</h1>";
      const compiledTemplate = jest.fn().mockReturnValue("<h1>Test Title</h1>");

      mockFs.readFileSync.mockReturnValue(partialContent);
      mockHandlebars.default.compile.mockReturnValue(compiledTemplate);

      const data = { title: "Test Title" };

      const { renderPartial } = await import("../../src/partials.js");
      const result = renderPartial("/path/header.partial.html", data);

      expect(result).toBe("<h1>Test Title</h1>");
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        "/path/header.partial.html",
        "utf-8"
      );
      expect(compiledTemplate).toHaveBeenCalledWith(data);
    });

    test("should handle empty partial content", async () => {
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const compiledTemplate = jest.fn().mockReturnValue("");

      mockFs.readFileSync.mockReturnValue("");
      mockHandlebars.default.compile.mockReturnValue(compiledTemplate);

      const { renderPartial } = await import("../../src/partials.js");
      const result = renderPartial("/path/empty.partial.html", {});

      expect(result).toBe("");
    });
  });

  describe("processPartials", () => {
    test("should process simple partial imports", async () => {
      const mockTemplates = await import("../../src/templates.js");
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      // Mock console to avoid noise in tests
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const partials = [
        {
          fileName: "header.partial.html",
          fullPath: "/path/header.partial.html",
        },
      ];

      mockTemplates.findPartials.mockReturnValue(partials);
      mockFs.readFileSync.mockReturnValue("<h1>{{siteName}}</h1>");
      mockHandlebars.default.compile.mockReturnValue(
        jest.fn().mockReturnValue("<h1>My Site</h1>")
      );

      const templateContent = "Before @header.partial.html After";
      const data = {
        common: { siteName: "My Site" },
        home: { title: "Home" },
      };

      const { processPartials } = await import("../../src/partials.js");
      const result = processPartials(
        templateContent,
        "/templates",
        ["html"],
        data,
        "home"
      );

      expect(result).toBe("Before <h1>My Site</h1> After");

      consoleSpy.mockRestore();
    });

    test("should process multiple partials", async () => {
      const mockTemplates = await import("../../src/templates.js");
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const partials = [
        {
          fileName: "header.partial.html",
          fullPath: "/path/header.partial.html",
        },
        {
          fileName: "footer.partial.html",
          fullPath: "/path/footer.partial.html",
        },
      ];

      mockTemplates.findPartials.mockReturnValue(partials);
      mockFs.readFileSync
        .mockReturnValueOnce("<header>{{siteName}}</header>")
        .mockReturnValueOnce("<footer>{{year}}</footer>");

      const headerTemplate = jest.fn().mockReturnValue("<header>Site</header>");
      const footerTemplate = jest.fn().mockReturnValue("<footer>2024</footer>");

      mockHandlebars.default.compile
        .mockReturnValueOnce(headerTemplate)
        .mockReturnValueOnce(footerTemplate);

      const templateContent =
        "@header.partial.html\n<main>Content</main>\n@footer.partial.html";
      const data = {
        common: { siteName: "Site", year: "2024" },
        home: { title: "Home" },
      };

      const { processPartials } = await import("../../src/partials.js");
      const result = processPartials(
        templateContent,
        "/templates",
        ["html"],
        data,
        "home"
      );

      expect(result).toBe(
        "<header>Site</header>\n<main>Content</main>\n<footer>2024</footer>"
      );

      consoleSpy.mockRestore();
    });

    test("should handle partials with comments", async () => {
      const mockTemplates = await import("../../src/templates.js");
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const partials = [
        {
          fileName: "header.partial.html",
          fullPath: "/path/header.partial.html",
        },
      ];

      mockTemplates.findPartials.mockReturnValue(partials);
      mockFs.readFileSync.mockReturnValue("<h1>Header</h1>");
      mockHandlebars.default.compile.mockReturnValue(
        jest.fn().mockReturnValue("<h1>Header</h1>")
      );

      const templateContent = "Before <!-- @header.partial.html --> After";
      const data = { common: {}, home: {} };

      const { processPartials } = await import("../../src/partials.js");
      const result = processPartials(
        templateContent,
        "/templates",
        ["html"],
        data,
        "home"
      );

      expect(result).toBe("Before <h1>Header</h1> After");

      consoleSpy.mockRestore();
    });

    test("should handle missing partials gracefully", async () => {
      const mockTemplates = await import("../../src/templates.js");

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockTemplates.findPartials.mockReturnValue([]); // No partials found

      const templateContent = "Before @missing.partial.html After";
      const data = { common: {}, home: {} };

      const { processPartials } = await import("../../src/partials.js");
      const result = processPartials(
        templateContent,
        "/templates",
        ["html"],
        data,
        "home"
      );

      expect(result).toBe(templateContent); // Should remain unchanged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "  ✗ Partial not found: missing.partial.html"
      );

      consoleErrorSpy.mockRestore();
    });

    test("should handle partial rendering errors", async () => {
      const mockTemplates = await import("../../src/templates.js");
      const mockFs = await import("fs");

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const partials = [
        {
          fileName: "error.partial.html",
          fullPath: "/path/error.partial.html",
        },
      ];

      mockTemplates.findPartials.mockReturnValue(partials);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error("File read error");
      });

      const templateContent = "Before @error.partial.html After";
      const data = { common: {}, home: {} };

      const { processPartials } = await import("../../src/partials.js");
      const result = processPartials(
        templateContent,
        "/templates",
        ["html"],
        data,
        "home"
      );

      expect(result).toBe(templateContent); // Should remain unchanged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error rendering partial error.partial.html")
      );

      consoleErrorSpy.mockRestore();
    });

    test("should merge data correctly for partials", async () => {
      const mockTemplates = await import("../../src/templates.js");
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const partials = [
        {
          fileName: "header.partial.html",
          fullPath: "/path/header.partial.html",
        },
      ];

      const compiledTemplate = jest.fn().mockReturnValue("<h1>Rendered</h1>");

      mockTemplates.findPartials.mockReturnValue(partials);
      mockFs.readFileSync.mockReturnValue("<h1>{{title}}</h1>");
      mockHandlebars.default.compile.mockReturnValue(compiledTemplate);

      const templateContent = "@header.partial.html";
      const data = {
        common: { siteName: "Site", theme: "dark" },
        header_: { title: "Header Title" }, // Partial-specific data
        home: { title: "Home Title" }, // Page-specific data (should take precedence)
      };

      const { processPartials } = await import("../../src/partials.js");
      processPartials(templateContent, "/templates", ["html"], data, "home");

      // Check that merged data was passed correctly (page data takes precedence)
      expect(compiledTemplate).toHaveBeenCalledWith({
        siteName: "Site",
        theme: "dark",
        title: "Home Title", // Page data should override partial data
      });

      consoleSpy.mockRestore();
    });

    test("should handle multiple extensions", async () => {
      const mockTemplates = await import("../../src/templates.js");
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const partials = [
        {
          fileName: "styles.partial.css",
          fullPath: "/path/styles.partial.css",
        },
        {
          fileName: "header.partial.html",
          fullPath: "/path/header.partial.html",
        },
      ];

      mockTemplates.findPartials.mockReturnValue(partials);
      mockFs.readFileSync
        .mockReturnValueOnce(".header { color: {{color}}; }")
        .mockReturnValueOnce("<h1>{{title}}</h1>");

      const cssTemplate = jest.fn().mockReturnValue(".header { color: red; }");
      const htmlTemplate = jest.fn().mockReturnValue("<h1>Title</h1>");

      mockHandlebars.default.compile
        .mockReturnValueOnce(cssTemplate)
        .mockReturnValueOnce(htmlTemplate);

      const templateContent = "@styles.partial.css\n@header.partial.html";
      const data = {
        common: { color: "red", title: "Title" },
        home: {},
      };

      const { processPartials } = await import("../../src/partials.js");
      const result = processPartials(
        templateContent,
        "/templates",
        ["css", "html"],
        data,
        "home"
      );

      expect(result).toBe(".header { color: red; }\n<h1>Title</h1>");

      consoleSpy.mockRestore();
    });

    test("should handle template without partials", async () => {
      const mockTemplates = await import("../../src/templates.js");

      mockTemplates.findPartials.mockReturnValue([]);

      const templateContent = "<h1>No partials here</h1>";
      const data = { common: {}, home: {} };

      const { processPartials } = await import("../../src/partials.js");
      const result = processPartials(
        templateContent,
        "/templates",
        ["html"],
        data,
        "home"
      );

      expect(result).toBe(templateContent);
    });

    test("should handle regex edge cases", async () => {
      const mockTemplates = await import("../../src/templates.js");

      // Empty partials list - no matches should be found
      const partials = [];

      mockTemplates.findPartials.mockReturnValue(partials);

      // Test content that won't match the regex properly
      const templateContent = "@invalid_pattern @test.html @.partial";
      const data = { common: {}, home: {} };

      const { processPartials } = await import("../../src/partials.js");
      const result = processPartials(
        templateContent,
        "/templates",
        ["html"],
        data,
        "home"
      );

      // Should remain unchanged as no valid partials were found
      expect(result).toBe("@invalid_pattern @test.html @.partial");
    });

    test("should handle partials without partial-specific data", async () => {
      const mockTemplates = await import("../../src/templates.js");
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const partials = [
        {
          fileName: "header.partial.html",
          fullPath: "/path/header.partial.html",
        },
      ];

      const compiledTemplate = jest.fn().mockReturnValue("<h1>Title</h1>");

      mockTemplates.findPartials.mockReturnValue(partials);
      mockFs.readFileSync.mockReturnValue("<h1>{{title}}</h1>");
      mockHandlebars.default.compile.mockReturnValue(compiledTemplate);

      const templateContent = "@header.partial.html";
      const data = {
        common: { title: "Common Title" },
        // No header_ data (should trigger ||{} fallback)
        home: { title: "Home Title" },
      };

      const { processPartials } = await import("../../src/partials.js");
      processPartials(templateContent, "/templates", ["html"], data, "home");

      // Check that merged data was passed correctly without partial-specific data
      expect(compiledTemplate).toHaveBeenCalledWith({
        title: "Home Title", // Page data should take precedence
      });

      consoleSpy.mockRestore();
    });

    test("should skip matches when no capture groups are produced", async () => {
      const mockTemplates = await import("../../src/templates.js");

      mockTemplates.findPartials.mockReturnValue([]);

      const templateContent = "@";
      const data = { common: {}, home: {} };

      const { processPartials } = await import("../../src/partials.js");
      const result = processPartials(
        templateContent,
        "/templates",
        [],
        data,
        "home"
      );

      expect(result).toBe("@");
    });

    test("should fallback to empty object when page data missing", async () => {
      const mockTemplates = await import("../../src/templates.js");
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const partials = [
        {
          fileName: "header.partial.html",
          fullPath: "/path/header.partial.html",
        },
      ];

      const compiledTemplate = jest.fn().mockReturnValue("<h1>Header</h1>");

      mockTemplates.findPartials.mockReturnValue(partials);
      mockFs.readFileSync.mockReturnValue("<h1>{{site}}</h1>");
      mockHandlebars.default.compile.mockReturnValue(compiledTemplate);

      const templateContent = "@header.partial.html";
      const data = {
        common: { site: "Site" },
        header_: { fromPartial: true },
        // Page key intentionally missing
      };

      const { processPartials } = await import("../../src/partials.js");
      processPartials(templateContent, "/templates", ["html"], data, "home");

      expect(compiledTemplate).toHaveBeenCalledWith({
        site: "Site",
        fromPartial: true,
      });
    });
  });
});
