/**
 * Template rendering engine for Minty
 * Uses Handlebars to render templates with data
 */

import { readFileSync } from "fs";
import Handlebars from "handlebars";

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
 * @returns {Object} Result object with success status, html, or error message
 */
export function renderTemplate(templatePath, keyName, data, subKey = null) {
  try {
    let pageData;

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
    } else {
      // Regular single-page render
      if (!data[keyName]) {
        return {
          success: false,
          error: `Missing data for template "${keyName}". No matching key found in JSON data file.`,
        };
      }
      pageData = data[keyName];
    }

    // Read the template file
    const templateContent = readFileSync(templatePath, "utf-8");

    // Compile the template with Handlebars
    const template = Handlebars.compile(templateContent);

    // Merge common data with page-specific data
    // Page-specific data takes precedence over common data
    const mergedData = {
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
