/**
 * File operations for Minty
 * Handles clearing dist, copying files, and writing rendered HTML
 */

import {
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
  statSync,
  copyFileSync,
  writeFileSync,
} from "fs";
import { join, dirname, relative } from "path";

/**
 * Clears the dist directory completely
 * @param {string} distDir - Path to the dist directory
 */
export function clearDist(distDir) {
  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
    console.log(`✓ Cleared ${distDir}`);
  }
  mkdirSync(distDir, { recursive: true });
}

/**
 * Recursively copies files from source to destination, excluding .template.html files
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {string} baseDir - Base directory for relative path calculation
 */
function copyFilesRecursive(srcDir, destDir, baseDir) {
  const files = readdirSync(srcDir);

  for (const file of files) {
    const srcPath = join(srcDir, file);
    const relativePath = relative(baseDir, srcPath);
    const destPath = join(destDir, relativePath);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyFilesRecursive(srcPath, destDir, baseDir);
    } else if (!file.endsWith(".template.html")) {
      // Copy all files except .template.html files
      const destFileDir = dirname(destPath);
      mkdirSync(destFileDir, { recursive: true });
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Copies all static files from rootDir to distDir
 * Excludes .template.html files as they will be rendered separately
 * @param {string} rootDir - Source root directory
 * @param {string} distDir - Destination dist directory
 */
export function copyStaticFiles(rootDir, distDir) {
  copyFilesRecursive(rootDir, distDir, rootDir);
  console.log("✓ Copied static files");
}

/**
 * Writes rendered HTML to the dist directory
 * @param {string} distDir - Destination dist directory
 * @param {string} outputPath - Relative output path (e.g., "index.html" or "about/page.html")
 * @param {string} html - Rendered HTML content
 */
export function writeRenderedFile(distDir, outputPath, html) {
  const fullPath = join(distDir, outputPath);
  const fileDir = dirname(fullPath);

  // Ensure the directory exists
  mkdirSync(fileDir, { recursive: true });

  // Write the HTML file
  writeFileSync(fullPath, html, "utf-8");
  console.log(`✓ Generated ${outputPath}`);
}
