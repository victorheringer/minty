/**
 * Data loader for Minty
 * Reads and validates JSON data from local files or remote URLs
 */

import { readFileSync, existsSync } from "fs";

/**
 * Checks if a string is a valid HTTP/HTTPS URL
 * @param {string} str - String to check
 * @returns {boolean} True if the string is a valid URL
 */
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Fetches JSON data from a remote URL
 * @param {string} url - URL to fetch JSON from
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} If fetch fails or JSON is invalid
 */
async function fetchRemoteJson(url) {
  try {
    console.log(`🌐 Fetching remote JSON from: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Minty/1.0.0",
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(
        `⚠️  Warning: Content-Type is '${contentType}', expected 'application/json'`
      );
    }

    const data = await response.json();
    console.log(`✅ Remote JSON loaded successfully`);
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `Request timeout: Unable to fetch JSON from ${url} (10s timeout)`
      );
    }
    throw new Error(
      `Failed to fetch remote JSON from ${url}: ${error.message}`
    );
  }
}

/**
 * Loads JSON data from local file
 * @param {string} filePath - Path to local JSON file
 * @returns {Object} Parsed JSON data
 * @throws {Error} If file is missing or invalid
 */
function loadLocalJson(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(
      `JSON data file not found at ${filePath}\n` +
        "Please ensure the jsonPath in .mintyrc points to a valid JSON file."
    );
  }

  try {
    console.log(`📁 Loading local JSON from: ${filePath}`);
    const dataContent = readFileSync(filePath, "utf-8");
    const data = JSON.parse(dataContent);
    console.log(`✅ Local JSON loaded successfully`);
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in local file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Loads and validates JSON data from local file or remote URL
 * Automatically detects if jsonPath is a URL or file path
 * @param {string} jsonPath - Path to JSON file or URL to JSON endpoint
 * @returns {Promise<Object>} Parsed JSON data with common and page-specific content
 * @throws {Error} If JSON source is invalid, unreachable, or lacks the 'common' key
 */
export async function loadData(jsonPath) {
  let data;

  // Automatically detect if jsonPath is a URL or file path
  if (isValidUrl(jsonPath)) {
    data = await fetchRemoteJson(jsonPath);
  } else {
    data = loadLocalJson(jsonPath);
  }

  // Validate that 'common' key exists
  if (!data.common || typeof data.common !== "object") {
    throw new Error(
      'JSON data must contain a "common" key with shared data for all pages.\n' +
        `Source: ${
          isValidUrl(jsonPath) ? "Remote URL" : "Local file"
        }: ${jsonPath}`
    );
  }

  return data;
}
