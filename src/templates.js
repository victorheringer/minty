/**
 * Template discovery for Minty
 * Recursively finds all .template.html files in the root directory
 */

import { readdirSync, statSync } from "fs";
import { join, relative, parse } from "path";

/**
 * Recursively finds all .template.html files in a directory
 * @param {string} dir - Directory to search
 * @param {string} baseDir - Base directory for calculating relative paths
 * @param {Array} fileList - Accumulator for found files
 * @returns {Array<Object>} Array of objects containing file info
 */
function findTemplatesRecursive(dir, baseDir, fileList = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findTemplatesRecursive(filePath, baseDir, fileList);
    } else if (file.endsWith(".template.html")) {
      const relativePath = relative(baseDir, filePath);
      const parsedPath = parse(relativePath);

      // Extract the key name from the filename
      // e.g., "index.template.html" → "index"
      const keyName = file.replace(".template.html", "");

      fileList.push({
        fullPath: filePath,
        relativePath: relativePath,
        keyName: keyName,
        outputName: file.replace(".template", ""), // "index.template.html" → "index.html"
        outputDir: parsedPath.dir, // Subdirectory path (empty for root)
      });
    }
  }

  return fileList;
}

/**
 * Finds all template files in the root directory
 * @param {string} rootDir - Root directory to search for templates
 * @returns {Array<Object>} Array of template file information objects
 */
export function findTemplates(rootDir) {
  return findTemplatesRecursive(rootDir, rootDir);
}
