/**
 * Template rendering engine for Minty
 * Uses Handlebars to render templates with data and partial support
 */

import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { processPartials } from "./partials.js";
import { dirname } from "path";

// Register custom Handlebars helpers
Handlebars.registerHelper("range", function (n) {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(i);
  }
  return result;
});

/**
 * Checks if a template should use wildcard generation (multiple pages)
 * @param {string} keyName - The key name from the template
 * @param {Object} data - Full data object
 * @returns {Object} Result with isWildcard flag and wildcardKey if applicable
 */
export function checkWildcard(keyName, data) {
  const wildcardKey = `${keyName}*`;

  if (data[wildcardKey] && typeof data[wildcardKey] === "object") {
    return {
      isWildcard: true,
      wildcardKey: wildcardKey,
      subKeys: Object.keys(data[wildcardKey]),
    };
  }

  return { isWildcard: false };
}

/**
 * Renders a template with its specific data merged with common data
 * @param {string} templatePath - Path to the template file
 * @param {string} keyName - The key name to look up in the data object
 * @param {Object} data - Full data object containing common and page-specific data
 * @param {string} subKey - Optional sub-key for wildcard templates
 * @param {string} rootDir - Root directory for finding partials
 * @param {Array<string>} extensions - Array of file extensions for partials
 * @returns {Object} Result object with success status, html, or error message
 */
export function renderTemplate(
  templatePath,
  keyName,
  data,
  subKey = null,
  rootDir = null,
  extensions = ["html"]
) {
  try {
    let pageData;
    let pageKey;

    // If subKey is provided, this is a wildcard render
    if (subKey) {
      const wildcardKey = `${keyName}*`;
      if (!data[wildcardKey] || !data[wildcardKey][subKey]) {
        return {
          success: false,
          error: `Missing data for wildcard template "${keyName}" with sub-key "${subKey}".`,
        };
      }
      pageData = data[wildcardKey][subKey];
      pageKey = keyName; // Use base key for partial data lookup
    } else {
      // Regular single-page render
      if (!data[keyName]) {
        return {
          success: false,
          error: `Missing data for template "${keyName}". No matching key found in JSON data file.`,
        };
      }
      pageData = data[keyName];
      pageKey = keyName;
    }

    // Read the template file
    let templateContent = readFileSync(templatePath, "utf-8");

    // Process partials if rootDir is provided
    if (rootDir) {
      templateContent = processPartials(
        templateContent,
        rootDir,
        extensions,
        data,
        pageKey
      );
    }

    // Compile the template with Handlebars
    const template = Handlebars.compile(templateContent);

    // Merge common data with page-specific data
    // Page-specific data takes precedence over common data
    const mergedData = {
      $database: data,
      ...data.common,
      ...pageData,
    };

    // Render the template
    const html = template(mergedData);

    return {
      success: true,
      html: html,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to render template "${keyName}": ${error.message}`,
    };
  }
}
