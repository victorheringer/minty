/**
 * Template rendering engine for Minty
 * Uses Handlebars to render templates with data
 */

import { readFileSync } from "fs";
import Handlebars from "handlebars";

/**
 * Renders a template with its specific data merged with common data
 * @param {string} templatePath - Path to the template file
 * @param {string} keyName - The key name to look up in the data object
 * @param {Object} data - Full data object containing common and page-specific data
 * @returns {Object} Result object with success status, html, or error message
 */
export function renderTemplate(templatePath, keyName, data) {
  try {
    // Check if the key exists in the data
    if (!data[keyName]) {
      return {
        success: false,
        error: `Missing data for template "${keyName}". No matching key found in JSON data file.`,
      };
    }

    // Read the template file
    const templateContent = readFileSync(templatePath, "utf-8");

    // Compile the template with Handlebars
    const template = Handlebars.compile(templateContent);

    // Merge common data with page-specific data
    // Page-specific data takes precedence over common data
    const mergedData = {
      ...data.common,
      ...data[keyName],
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
