/**
 * Partial template system for Minty
 * Handles rendering and substitution of partial templates
 */

import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { findPartials } from "./templates.js";

/**
 * Creates a map of partial names to their file paths for quick lookup
 * @param {string} rootDir - Root directory to search for partials
 * @param {Array<string>} extensions - Array of file extensions to search for
 * @returns {Map} Map of partial file names to file paths
 */
export function createPartialMap(rootDir, extensions = ["html"]) {
  const partials = findPartials(rootDir, extensions);
  const partialMap = new Map();

  partials.forEach((partial) => {
    partialMap.set(partial.fileName, partial.fullPath);
  });

  return partialMap;
}

/**
 * Renders a partial template with merged data
 * @param {string} partialPath - Path to the partial file
 * @param {Object} mergedData - Data object with common, partial, and page data merged
 * @returns {string} Rendered content
 */
export function renderPartial(partialPath, mergedData) {
  const partialContent = readFileSync(partialPath, "utf-8");
  const template = Handlebars.compile(partialContent);
  return template(mergedData);
}

/**
 * Processes template content and substitutes partial imports
 * @param {string} templateContent - Original template content
 * @param {string} rootDir - Root directory for finding partials
 * @param {Array<string>} extensions - Array of file extensions to search for
 * @param {Object} data - Full data object (common + page-specific)
 * @param {string} pageKey - Current page key for data merging
 * @returns {string} Template content with partials substituted
 */
export function processPartials(
  templateContent,
  rootDir,
  extensions,
  data,
  pageKey
) {
  const partialMap = createPartialMap(rootDir, extensions);
  let processedContent = templateContent;

  // Create regex patterns for all configured extensions
  // e.g., @filename.partial.html, @vars.partial.css, @config.partial.json
  const extensionPatterns = extensions.map(
    (ext) =>
      `([^.\\s]+\\.partial\\.${ext.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`
  );
  const partialRegex = new RegExp(
    `(?:<!--\\s*)?@(?:${extensionPatterns.join("|")})(?:\\s*-->)?`,
    "g"
  );

  let match;
  while ((match = partialRegex.exec(templateContent)) !== null) {
    const fullMatch = match[0]; // The complete match (with or without comment)

    // Find which capture group matched (which extension)
    let partialFileName = null;
    for (let i = 1; i < match.length; i++) {
      if (match[i]) {
        partialFileName = match[i];
        break;
      }
    }

    if (!partialFileName) continue;

    if (partialMap.has(partialFileName)) {
      const partialPath = partialMap.get(partialFileName);

      // Extract partial name for data lookup
      // e.g., "header.partial.html" → "header", "vars.partial.css" → "vars"
      const partialName = partialFileName.replace(/\.partial\.\w+$/, "");
      const partialDataKey = `${partialName}_`;

      // Merge data: common + partial-specific + page-specific
      // Page-specific data takes highest precedence
      const mergedData = {
        ...data.common,
        ...(data[partialDataKey] || {}),
        ...(data[pageKey] || {}),
      };

      try {
        const renderedPartial = renderPartial(partialPath, mergedData);

        // Replace the entire match (comment or direct import) with rendered content
        processedContent = processedContent.replace(fullMatch, renderedPartial);

        console.log(`  ✓ Included partial: ${partialFileName}`);
      } catch (error) {
        console.error(
          `  ✗ Error rendering partial ${partialFileName}: ${error.message}`
        );
        // Keep the original import as fallback
      }
    } else {
      console.error(`  ✗ Partial not found: ${partialFileName}`);
      // Keep the original import as fallback
    }
  }

  return processedContent;
}
