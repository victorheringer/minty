/**
 * Configuration loader for Minty
 * Reads and validates the .mintyrc configuration file from the parent directory
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Loads and validates the .mintyrc configuration file
 * @returns {Object} Configuration object with jsonPath, rootDir, and distDir
 * @throws {Error} If configuration file is missing or invalid
 */
export function loadConfig() {
  // Look for .mintyrc in the parent directory of the project root
  const projectRoot = resolve(__dirname, "..");
  const parentDir = resolve(projectRoot, "..");
  const configPath = join(parentDir, ".mintyrc");

  if (!existsSync(configPath)) {
    throw new Error(
      `Configuration file not found at ${configPath}\n` +
        "Please create a .mintyrc file in the parent directory of the Minty project."
    );
  }

  try {
    const configContent = readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);

    // Validate required fields
    if (!config.jsonPath) {
      throw new Error(".mintyrc missing required field: jsonPath");
    }
    if (!config.rootDir) {
      throw new Error(".mintyrc missing required field: rootDir");
    }
    if (!config.distDir) {
      throw new Error(".mintyrc missing required field: distDir");
    }

    // Resolve paths relative to the parent directory
    return {
      jsonPath: resolve(parentDir, config.jsonPath),
      rootDir: resolve(parentDir, config.rootDir),
      distDir: resolve(parentDir, config.distDir),
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in .mintyrc: ${error.message}`);
    }
    throw error;
  }
}
