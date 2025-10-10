/**
 * Tests for renderer module
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

jest.unstable_mockModule("../../src/partials.js", () => ({
  processPartials: jest.fn(),
}));

jest.unstable_mockModule("path", () => ({
  dirname: jest.fn(),
}));

describe("Renderer Module", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("checkWildcard", () => {
    test("should detect wildcard patterns", async () => {
      const { checkWildcard } = await import("../../src/renderer.js");

      const data = {
        "products*": {
          apple: { name: "Apple", price: 1 },
          banana: { name: "Banana", price: 2 },
        },
      };

      const result = checkWildcard("products", data);

      expect(result.isWildcard).toBe(true);
      expect(result.wildcardKey).toBe("products*");
      expect(result.subKeys).toEqual(["apple", "banana"]);
    });

    test("should return false for non-wildcard patterns", async () => {
      const { checkWildcard } = await import("../../src/renderer.js");

      const data = {
        products: { name: "Regular Product" },
      };

      const result = checkWildcard("products", data);

      expect(result.isWildcard).toBe(false);
    });

    test("should return false when wildcard key is not an object", async () => {
      const { checkWildcard } = await import("../../src/renderer.js");

      const data = {
        "products*": "not an object",
      };

      const result = checkWildcard("products", data);

      expect(result.isWildcard).toBe(false);
    });
  });

  describe("renderTemplate", () => {
    test("should render template with regular data", async () => {
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const templateContent = "<h1>{{title}}</h1>";
      const compiledTemplate = jest.fn().mockReturnValue("<h1>Test Title</h1>");

      mockFs.readFileSync.mockReturnValue(templateContent);
      mockHandlebars.default.compile.mockReturnValue(compiledTemplate);

      const data = {
        common: { siteName: "My Site" },
        home: { title: "Test Title" },
      };

      const { renderTemplate } = await import("../../src/renderer.js");
      const result = renderTemplate("/templates/home.html", "home", data);

      expect(result.success).toBe(true);
      expect(result.html).toBe("<h1>Test Title</h1>");
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        "/templates/home.html",
        "utf-8"
      );
      expect(compiledTemplate).toHaveBeenCalledWith({
        siteName: "My Site",
        title: "Test Title",
      });
    });

    test("should render template with wildcard data", async () => {
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const templateContent = "<h1>{{name}}</h1>";
      const compiledTemplate = jest.fn().mockReturnValue("<h1>Apple</h1>");

      mockFs.readFileSync.mockReturnValue(templateContent);
      mockHandlebars.default.compile.mockReturnValue(compiledTemplate);

      const data = {
        common: { siteName: "Store" },
        "products*": {
          apple: { name: "Apple", price: 1 },
        },
      };

      const { renderTemplate } = await import("../../src/renderer.js");
      const result = renderTemplate(
        "/templates/product.html",
        "products",
        data,
        "apple"
      );

      expect(result.success).toBe(true);
      expect(result.html).toBe("<h1>Apple</h1>");
      expect(compiledTemplate).toHaveBeenCalledWith({
        siteName: "Store",
        name: "Apple",
        price: 1,
      });
    });

    test("should process partials when rootDir is provided", async () => {
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");
      const mockPartials = await import("../../src/partials.js");

      const templateContent = "<h1>{{title}}</h1>";
      const processedContent = "<header>Site</header><h1>{{title}}</h1>";
      const compiledTemplate = jest
        .fn()
        .mockReturnValue("<header>Site</header><h1>Home</h1>");

      mockFs.readFileSync.mockReturnValue(templateContent);
      mockPartials.processPartials.mockReturnValue(processedContent);
      mockHandlebars.default.compile.mockReturnValue(compiledTemplate);

      const data = {
        common: { siteName: "Site" },
        home: { title: "Home" },
      };

      const { renderTemplate } = await import("../../src/renderer.js");
      const result = renderTemplate(
        "/templates/home.html",
        "home",
        data,
        null,
        "/templates",
        ["html"]
      );

      expect(result.success).toBe(true);
      expect(mockPartials.processPartials).toHaveBeenCalledWith(
        templateContent,
        "/templates",
        ["html"],
        data,
        "home"
      );
    });

    test("should handle missing template data", async () => {
      const mockFs = await import("fs");

      mockFs.readFileSync.mockReturnValue("<h1>{{title}}</h1>");

      const data = {
        common: { siteName: "Site" },
        // missing 'about' key
      };

      const { renderTemplate } = await import("../../src/renderer.js");
      const result = renderTemplate("/templates/about.html", "about", data);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Missing data for template "about". No matching key found in JSON data file.'
      );
    });

    test("should handle missing wildcard data", async () => {
      const mockFs = await import("fs");

      mockFs.readFileSync.mockReturnValue("<h1>{{name}}</h1>");

      const data = {
        common: { siteName: "Store" },
        "products*": {
          apple: { name: "Apple" },
          // missing 'banana' subkey
        },
      };

      const { renderTemplate } = await import("../../src/renderer.js");
      const result = renderTemplate(
        "/templates/product.html",
        "products",
        data,
        "banana"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Missing data for wildcard template "products" with sub-key "banana".'
      );
    });

    test("should handle file read errors", async () => {
      const mockFs = await import("fs");

      mockFs.readFileSync.mockImplementation(() => {
        throw new Error("File not found");
      });

      const data = {
        common: { siteName: "Site" },
        home: { title: "Home" },
      };

      const { renderTemplate } = await import("../../src/renderer.js");
      const result = renderTemplate("/templates/missing.html", "home", data);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Failed to render template "home": File not found'
      );
    });

    test("should handle template compilation errors", async () => {
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      mockFs.readFileSync.mockReturnValue("{{invalid syntax}}");
      mockHandlebars.default.compile.mockImplementation(() => {
        throw new Error("Invalid template syntax");
      });

      const data = {
        common: { siteName: "Site" },
        home: { title: "Home" },
      };

      const { renderTemplate } = await import("../../src/renderer.js");
      const result = renderTemplate("/templates/invalid.html", "home", data);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Failed to render template "home": Invalid template syntax'
      );
    });

    test("should handle template rendering errors", async () => {
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const compiledTemplate = jest.fn().mockImplementation(() => {
        throw new Error("Runtime error");
      });

      mockFs.readFileSync.mockReturnValue("<h1>{{title}}</h1>");
      mockHandlebars.default.compile.mockReturnValue(compiledTemplate);

      const data = {
        common: { siteName: "Site" },
        home: { title: "Home" },
      };

      const { renderTemplate } = await import("../../src/renderer.js");
      const result = renderTemplate("/templates/home.html", "home", data);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Failed to render template "home": Runtime error'
      );
    });

    test("should merge common and page data correctly", async () => {
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");

      const compiledTemplate = jest.fn().mockReturnValue("rendered");

      mockFs.readFileSync.mockReturnValue("<h1>{{title}}</h1>");
      mockHandlebars.default.compile.mockReturnValue(compiledTemplate);

      const data = {
        common: {
          siteName: "Site",
          theme: "dark",
          title: "Common Title", // This should be overridden
        },
        home: {
          title: "Home Title", // This should override common
          content: "Home content",
        },
      };

      const { renderTemplate } = await import("../../src/renderer.js");
      renderTemplate("/templates/home.html", "home", data);

      expect(compiledTemplate).toHaveBeenCalledWith({
        siteName: "Site",
        theme: "dark",
        title: "Home Title", // Page data takes precedence
        content: "Home content",
      });
    });

    test("should use default extensions for partials", async () => {
      const mockFs = await import("fs");
      const mockHandlebars = await import("handlebars");
      const mockPartials = await import("../../src/partials.js");

      mockFs.readFileSync.mockReturnValue("<h1>{{title}}</h1>");
      mockPartials.processPartials.mockReturnValue("<h1>{{title}}</h1>");
      mockHandlebars.default.compile.mockReturnValue(
        jest.fn().mockReturnValue("rendered")
      );

      const data = {
        common: { siteName: "Site" },
        home: { title: "Home" },
      };

      const { renderTemplate } = await import("../../src/renderer.js");
      renderTemplate("/templates/home.html", "home", data, null, "/templates");

      expect(mockPartials.processPartials).toHaveBeenCalledWith(
        "<h1>{{title}}</h1>",
        "/templates",
        ["html"], // default extensions
        data,
        "home"
      );
    });
  });
});
