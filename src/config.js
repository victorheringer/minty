/**
 * Configuration loader for Minty
 * Reads and validates the .mintyrc configuration file with fallback to defaults
 */

import { readFile } from "fs/promises";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { access } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default configuration
export const defaultConfig = Object.freeze({
  templates: "templates",
  output: "build",
  data: "data.json",
  extensions: [".html", ".css", ".js", ".md", ".txt", ".xml", ".json"],
});

/**
 * Loads and validates the .mintyrc configuration file
 * Falls back to default configuration if file is not found
 * @returns {Object} Configuration object with templates, output, data, and extensions
 */
export async function loadConfig() {
  let currentDir = resolve(__dirname, "..");
  let configFound = false;
  let config = {};

  // Search for .mintyrc in current and parent directories
  while (currentDir !== resolve(currentDir, "..")) {
    const configPath = join(currentDir, ".mintyrc");

    try {
      await access(configPath);
      const configContent = await readFile(configPath, "utf8");
      config = JSON.parse(configContent);
      configFound = true;
      break;
    } catch (error) {
      // Continue searching in parent directory
      currentDir = resolve(currentDir, "..");
    }
  }

  // If no config found, use defaults
  if (!configFound) {
    return { ...defaultConfig };
  }

  // Merge with defaults and validate
  const finalConfig = { ...defaultConfig };

  // Validate and set templates directory
  if (typeof config.templates === "string" && config.templates.trim()) {
    finalConfig.templates = config.templates.trim();
  }

  // Validate and set output directory
  if (typeof config.output === "string" && config.output.trim()) {
    finalConfig.output = config.output.trim();
  }

  // Validate and set data file
  if (typeof config.data === "string" && config.data.trim()) {
    finalConfig.data = config.data.trim();
  }

  // Validate and set extensions
  if (Array.isArray(config.extensions) && config.extensions.length > 0) {
    const validExtensions = config.extensions.filter(
      (ext) => typeof ext === "string" && ext.trim().length > 0
    );

    if (validExtensions.length > 0) {
      finalConfig.extensions = validExtensions.map((ext) =>
        ext.startsWith(".") ? ext : `.${ext}`
      );
    }
  }

  return finalConfig;
}
