/**
 * Template discovery for Minty
 * Recursively finds all template and partial files with configured extensions
 */

import { readdirSync, statSync } from "fs";
import { join, relative, parse } from "path";

/**
 * Recursively finds all template files with configured extensions
 * @param {string} dir - Directory to search
 * @param {string} baseDir - Base directory for calculating relative paths
 * @param {Array<string>} extensions - Array of file extensions to search for
 * @param {Array} fileList - Accumulator for found files
 * @returns {Array<Object>} Array of objects containing file info
 */
function findTemplatesRecursive(dir, baseDir, extensions, fileList = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findTemplatesRecursive(filePath, baseDir, extensions, fileList);
    } else {
      // Check if file matches any template pattern: name.template.{ext}
      for (const ext of extensions) {
        const templatePattern = `.template.${ext}`;
        if (file.endsWith(templatePattern)) {
          const relativePath = relative(baseDir, filePath);
          const parsedPath = parse(relativePath);

          // Extract the key name from the filename
          // e.g., "index.template.html" → "index", "style.template.css" → "style"
          const keyName = file.replace(templatePattern, "");

          fileList.push({
            fullPath: filePath,
            relativePath: relativePath,
            keyName: keyName,
            extension: ext,
            outputName: file.replace(".template", ""), // "index.template.html" → "index.html"
            outputDir: parsedPath.dir, // Subdirectory path (empty for root)
          });
          break; // Found a match, no need to check other extensions
        }
      }
    }
  }

  return fileList;
}

/**
 * Recursively finds all partial files with configured extensions
 * @param {string} dir - Directory to search
 * @param {string} baseDir - Base directory for calculating relative paths
 * @param {Array<string>} extensions - Array of file extensions to search for
 * @param {Array} fileList - Accumulator for found files
 * @returns {Array<Object>} Array of objects containing partial info
 */
function findPartialsRecursive(dir, baseDir, extensions, fileList = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findPartialsRecursive(filePath, baseDir, extensions, fileList);
    } else {
      // Check if file matches any partial pattern: name.partial.{ext}
      for (const ext of extensions) {
        const partialPattern = `.partial.${ext}`;
        if (file.endsWith(partialPattern)) {
          const relativePath = relative(baseDir, filePath);
          const parsedPath = parse(relativePath);

          // Extract the partial name from the filename
          // e.g., "header.partial.html" → "header", "vars.partial.css" → "vars"
          const partialName = file.replace(partialPattern, "");

          fileList.push({
            fullPath: filePath,
            relativePath: relativePath,
            partialName: partialName,
            fileName: file, // "header.partial.html"
            extension: ext,
            outputDir: parsedPath.dir, // Subdirectory path (empty for root)
          });
          break; // Found a match, no need to check other extensions
        }
      }
    }
  }

  return fileList;
}

/**
 * Finds all template files in the root directory
 * @param {string} rootDir - Root directory to search for templates
 * @param {Array<string>} extensions - Array of file extensions to search for
 * @returns {Array<Object>} Array of template file information objects
 */
export function findTemplates(rootDir, extensions = ["html"]) {
  return findTemplatesRecursive(rootDir, rootDir, extensions);
}

/**
 * Finds all partial files in the root directory
 * @param {string} rootDir - Root directory to search for partials
 * @param {Array<string>} extensions - Array of file extensions to search for
 * @returns {Array<Object>} Array of partial file information objects
 */
export function findPartials(rootDir, extensions = ["html"]) {
  return findPartialsRecursive(rootDir, rootDir, extensions);
}
