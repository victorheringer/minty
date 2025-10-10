import { describe, test, expect } from "@jest/globals";

describe("Index Module", () => {
  test("should export build function", async () => {
    const { build } = await import("../../src/index.js");
    expect(typeof build).toBe("function");
  });

  test("should export loadConfig function", async () => {
    const { loadConfig } = await import("../../src/index.js");
    expect(typeof loadConfig).toBe("function");
  });

  test("should export loadData function", async () => {
    const { loadData } = await import("../../src/index.js");
    expect(typeof loadData).toBe("function");
  });

  test("should export findTemplates function", async () => {
    const { findTemplates } = await import("../../src/index.js");
    expect(typeof findTemplates).toBe("function");
  });

  test("should export renderTemplate function", async () => {
    const { renderTemplate } = await import("../../src/index.js");
    expect(typeof renderTemplate).toBe("function");
  });

  test("should export all expected functions from correct modules", async () => {
    const indexModule = await import("../../src/index.js");
    const buildModule = await import("../../src/build.js");
    const configModule = await import("../../src/config.js");
    const dataModule = await import("../../src/data.js");
    const templatesModule = await import("../../src/templates.js");
    const rendererModule = await import("../../src/renderer.js");

    expect(indexModule.build).toBe(buildModule.build);
    expect(indexModule.loadConfig).toBe(configModule.loadConfig);
    expect(indexModule.loadData).toBe(dataModule.loadData);
    expect(indexModule.findTemplates).toBe(templatesModule.findTemplates);
    expect(indexModule.renderTemplate).toBe(rendererModule.renderTemplate);
  });

  test("should have correct module structure", async () => {
    const exported = await import("../../src/index.js");

    expect(exported).toHaveProperty("build");
    expect(exported).toHaveProperty("loadConfig");
    expect(exported).toHaveProperty("loadData");
    expect(exported).toHaveProperty("findTemplates");
    expect(exported).toHaveProperty("renderTemplate");

    const exportedKeys = Object.keys(exported);
    expect(exportedKeys).toContain("build");
    expect(exportedKeys).toContain("loadConfig");
    expect(exportedKeys).toContain("loadData");
    expect(exportedKeys).toContain("findTemplates");
    expect(exportedKeys).toContain("renderTemplate");
  });
});
