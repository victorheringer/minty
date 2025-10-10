import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import {
  setupConsoleMocks,
  getLoggedMessages,
  resetConsoleMocks,
  restoreConsoleMocks,
} from "../mocks/console.mock.js";
import {
  setupProcessMocks,
  setArgv,
  resetProcessMocks,
  restoreProcessMocks,
} from "../mocks/process.mock.js";

describe("Minty CLI", () => {
  beforeEach(() => {
    setupConsoleMocks();
    setupProcessMocks();
    resetConsoleMocks();
    resetProcessMocks();
  });

  afterEach(() => {
    jest.resetModules();
    resetConsoleMocks();
    resetProcessMocks();
  });

  afterAll(() => {
    restoreConsoleMocks();
    restoreProcessMocks();
  });

  test("should show help when no command provided", async () => {
    setArgv([]);

    await jest.unstable_mockModule("../../src/build.js", () => ({
      build: jest.fn().mockResolvedValue({ success: true }),
    }));

    await import("../../bin/minty.js");

    const { log } = getLoggedMessages();
    expect(
      log.some((message) =>
        message.includes("Minty - Universal Template Engine")
      )
    ).toBe(true);
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  test("should execute build command", async () => {
    setArgv(["build"]);

    const mockBuild = jest.fn().mockResolvedValue({ success: true });
    await jest.unstable_mockModule("../../src/build.js", () => ({
      build: mockBuild,
    }));

    await import("../../bin/minty.js");

    expect(mockBuild).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  test("should handle build failure", async () => {
    setArgv(["build"]);

    const mockBuild = jest.fn().mockResolvedValue({ success: false });
    await jest.unstable_mockModule("../../src/build.js", () => ({
      build: mockBuild,
    }));

    await import("../../bin/minty.js");

    expect(mockBuild).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  test("should show detailed help for help command", async () => {
    setArgv(["help"]);

    await jest.unstable_mockModule("../../src/build.js", () => ({
      build: jest.fn(),
    }));

    await import("../../bin/minty.js");

    const { log } = getLoggedMessages();
    expect(log.some((message) => message.includes("Configuration:"))).toBe(
      true
    );
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  test("should show detailed help for --help flag", async () => {
    setArgv(["--help"]);

    await jest.unstable_mockModule("../../src/build.js", () => ({
      build: jest.fn(),
    }));

    await import("../../bin/minty.js");

    const { log } = getLoggedMessages();
    expect(log.some((message) => message.includes("Configuration:"))).toBe(
      true
    );
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  test("should handle unknown command", async () => {
    setArgv(["unknown"]);

    await jest.unstable_mockModule("../../src/build.js", () => ({
      build: jest.fn(),
    }));

    await import("../../bin/minty.js");

    const { error, log } = getLoggedMessages();
    expect(error.some((message) => message.includes("Unknown command"))).toBe(
      true
    );
    expect(log.some((message) => message.includes("minty help"))).toBe(true);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
