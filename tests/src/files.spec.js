import { beforeEach, describe, expect, jest, test } from "@jest/globals";

describe("Files Module", () => {
  let mockFs;
  let mockPath;
  let consoleSpy;

  beforeEach(async () => {
    jest.unstable_mockModule("fs", () => ({
      existsSync: jest.fn(),
      mkdirSync: jest.fn(),
      rmSync: jest.fn(),
      readdirSync: jest.fn(),
      statSync: jest.fn(),
      copyFileSync: jest.fn(),
      writeFileSync: jest.fn(),
    }));

    jest.unstable_mockModule("path", () => ({
      join: jest.fn((...args) => args.join("/")),
      dirname: jest.fn((filePath) =>
        filePath.split("/").slice(0, -1).join("/")
      ),
      relative: jest.fn((from, to) => to.replace(from + "/", "")),
    }));

    mockFs = await import("fs");
    mockPath = await import("path");
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("clearDist", () => {
    test("should remove existing dist directory and recreate it", async () => {
      const { clearDist } = await import("../../src/files.js");

      mockFs.existsSync.mockReturnValue(true);
      mockFs.rmSync.mockImplementation(() => {});
      mockFs.mkdirSync.mockImplementation(() => {});

      clearDist("build");

      expect(mockFs.existsSync).toHaveBeenCalledWith("build");
      expect(mockFs.rmSync).toHaveBeenCalledWith("build", {
        recursive: true,
        force: true,
      });
      expect(mockFs.mkdirSync).toHaveBeenCalledWith("build", {
        recursive: true,
      });
    });

    test("should handle non-existent dist directory", async () => {
      const { clearDist } = await import("../../src/files.js");

      mockFs.existsSync.mockReturnValue(false);
      mockFs.rmSync.mockImplementation(() => {}); // rmSync is always called due to force: true
      mockFs.mkdirSync.mockImplementation(() => {});

      clearDist("build");

      expect(mockFs.existsSync).toHaveBeenCalledWith("build");
      expect(mockFs.rmSync).toHaveBeenCalledWith("build", {
        recursive: true,
        force: true,
      }); // Called due to force flag
      expect(mockFs.mkdirSync).toHaveBeenCalledWith("build", {
        recursive: true,
      });
    });
  });

  describe("copyStaticFiles", () => {
    test("should copy static files to dist directory", async () => {
      const { copyStaticFiles } = await import("../../src/files.js");

      mockFs.readdirSync
        .mockReturnValueOnce([
          "index.html",
          "style.css",
          "image.png",
          "template.template.html",
        ])
        .mockReturnValue([]); // No subdirectories

      mockFs.statSync
        .mockReturnValueOnce({ isDirectory: () => false }) // index.html
        .mockReturnValueOnce({ isDirectory: () => false }) // style.css
        .mockReturnValueOnce({ isDirectory: () => false }) // image.png
        .mockReturnValueOnce({ isDirectory: () => false }); // template.template.html

      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.copyFileSync.mockImplementation(() => {});

      copyStaticFiles("src", "build");

      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        "src/index.html",
        "build/index.html"
      );
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        "src/style.css",
        "build/style.css"
      );
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        "src/image.png",
        "build/image.png"
      );
      expect(mockFs.copyFileSync).not.toHaveBeenCalledWith(
        "src/template.template.html",
        "build/template.template.html"
      );
    });

    test("should handle nested directory structure with recursion", async () => {
      const { copyStaticFiles } = await import("../../src/files.js");

      mockFs.readdirSync
        .mockReturnValueOnce(["assets", "index.html"]) // Root level
        .mockReturnValueOnce(["style.css"]); // assets folder contents

      mockFs.statSync
        .mockReturnValueOnce({ isDirectory: () => true }) // assets directory
        .mockReturnValueOnce({ isDirectory: () => false }) // index.html file
        .mockReturnValueOnce({ isDirectory: () => false }); // style.css file

      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.copyFileSync.mockImplementation(() => {});

      copyStaticFiles("src", "build");

      // Should copy both the root file and the file in the subdirectory
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        "src/index.html",
        "build/index.html"
      );
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        "src/assets/style.css",
        "build/assets/style.css"
      );
      expect(mockFs.mkdirSync).toHaveBeenCalledWith("build/assets", {
        recursive: true,
      });
    });

    test("should exclude template files", async () => {
      const { copyStaticFiles } = await import("../../src/files.js");

      mockFs.readdirSync.mockReturnValueOnce([
        "index.template.html",
        "about.template.html",
        "style.css",
      ]);

      mockFs.statSync
        .mockReturnValueOnce({ isDirectory: () => false }) // index.template.html
        .mockReturnValueOnce({ isDirectory: () => false }) // about.template.html
        .mockReturnValueOnce({ isDirectory: () => false }); // style.css

      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.copyFileSync.mockImplementation(() => {});

      copyStaticFiles("src", "build");

      expect(mockFs.copyFileSync).not.toHaveBeenCalledWith(
        "src/index.template.html",
        "build/index.template.html"
      );
      expect(mockFs.copyFileSync).not.toHaveBeenCalledWith(
        "src/about.template.html",
        "build/about.template.html"
      );
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        "src/style.css",
        "build/style.css"
      );
    });

    test("should handle empty directory", async () => {
      const { copyStaticFiles } = await import("../../src/files.js");

      // Reset any previous mock state
      mockFs.copyFileSync.mockClear();
      mockFs.readdirSync.mockReturnValueOnce([]);

      copyStaticFiles("src", "build");

      expect(mockFs.copyFileSync).not.toHaveBeenCalled();
    });
  });

  describe("writeRenderedFile", () => {
    test("should write rendered HTML to file", async () => {
      const { writeRenderedFile } = await import("../../src/files.js");

      const content = "<html><body>Hello World</body></html>";

      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});

      writeRenderedFile("build", "index.html", content);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith("build", {
        recursive: true,
      });
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "build/index.html",
        content,
        "utf-8"
      );
    });

    test("should create nested directories", async () => {
      const { writeRenderedFile } = await import("../../src/files.js");

      const content = "<html><body>About Page</body></html>";

      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});

      writeRenderedFile("build", "about/index.html", content);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith("build/about", {
        recursive: true,
      });
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "build/about/index.html",
        content,
        "utf-8"
      );
    });

    test("should handle deeply nested paths", async () => {
      const { writeRenderedFile } = await import("../../src/files.js");

      const content = "<html><body>Deep Page</body></html>";

      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});

      writeRenderedFile("build", "level1/level2/level3/page.html", content);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        "build/level1/level2/level3",
        { recursive: true }
      );
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "build/level1/level2/level3/page.html",
        content,
        "utf-8"
      );
    });

    test("should handle empty content", async () => {
      const { writeRenderedFile } = await import("../../src/files.js");

      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});

      writeRenderedFile("build", "empty.html", "");

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "build/empty.html",
        "",
        "utf-8"
      );
    });

    test("should handle special characters in content", async () => {
      const { writeRenderedFile } = await import("../../src/files.js");

      const content =
        "<!DOCTYPE html>\n<html>\n<body>\n<p>Special chars: àáâãäåæçèéêë</p>\n<p>Symbols: ★☆♠♣♦♥</p>\n</body>\n</html>";

      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});

      writeRenderedFile("build", "special.html", content);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "build/special.html",
        content,
        "utf-8"
      );
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });
  });
});
