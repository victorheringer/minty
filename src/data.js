/**
 * Data loader for Minty
 * Reads and validates the JSON data file containing page content
 */

import { readFileSync, existsSync } from "fs";

/**
 * Loads and validates the JSON data file
 * @param {string} jsonPath - Path to the JSON data file
 * @returns {Object} Parsed JSON data with common and page-specific content
 * @throws {Error} If JSON file is missing, invalid, or lacks the 'common' key
 */
export function loadData(jsonPath) {
  if (!existsSync(jsonPath)) {
    throw new Error(
      `JSON data file not found at ${jsonPath}\n` +
        "Please ensure the jsonPath in .mintyrc points to a valid JSON file."
    );
  }

  try {
    const dataContent = readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(dataContent);

    // Validate that 'common' key exists
    if (!data.common || typeof data.common !== "object") {
      throw new Error(
        'JSON data file must contain a "common" key with shared data for all pages.'
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in data file: ${error.message}`);
    }
    throw error;
  }
}
