/**
 * Main build script for Minty
 * Orchestrates the entire static site generation process
 */

import { loadConfig } from "./config.js";
import { loadData } from "./data.js";
import { findTemplates } from "./templates.js";
import { renderTemplate } from "./renderer.js";
import { clearDist, copyStaticFiles, writeRenderedFile } from "./files.js";
import { join } from "path";

/**
 * Executes the complete build process
 * @returns {Object} Build result with success status and statistics
 */
export function build() {
  console.log("\n🌿 Minty - Static Site Generator\n");

  try {
    // Step 1: Load configuration
    console.log("📋 Loading configuration...");
    const config = loadConfig();
    console.log(`✓ Configuration loaded`);
    console.log(`  - Root: ${config.rootDir}`);
    console.log(`  - Dist: ${config.distDir}`);
    console.log(`  - Data: ${config.jsonPath}\n`);

    // Step 2: Load JSON data
    console.log("📦 Loading data...");
    const data = loadData(config.jsonPath);
    const pageKeys = Object.keys(data).filter((key) => key !== "common");
    console.log(`✓ Data loaded (${pageKeys.length} pages + common data)\n`);

    // Step 3: Clear dist directory
    console.log("🗑️  Clearing dist directory...");
    clearDist(config.distDir);
    console.log("");

    // Step 4: Copy static files
    console.log("📁 Copying static files...");
    copyStaticFiles(config.rootDir, config.distDir);
    console.log("");

    // Step 5: Find all templates
    console.log("🔍 Finding templates...");
    const templates = findTemplates(config.rootDir);
    console.log(`✓ Found ${templates.length} template(s)\n`);

    // Step 6: Render templates
    console.log("🎨 Rendering templates...");
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const template of templates) {
      // Check if this template uses wildcard pattern (e.g., "page*")
      const wildcardKey = `${template.keyName}*`;
      const isWildcard =
        data[wildcardKey] && typeof data[wildcardKey] === "object";

      if (isWildcard) {
        // Wildcard mode: generate multiple pages from one template
        const subKeys = Object.keys(data[wildcardKey]);
        console.log(
          `  📄 Wildcard template "${template.keyName}" → generating ${subKeys.length} pages...`
        );

        for (const subKey of subKeys) {
          const result = renderTemplate(
            template.fullPath,
            template.keyName,
            data,
            subKey,
            config.rootDir
          );

          if (result.success) {
            // Generate filename: page.casa1.html, page.casa2.html, etc.
            const outputFileName = `${template.keyName}.${subKey}.html`;
            const outputPath = join(template.outputDir, outputFileName);
            writeRenderedFile(config.distDir, outputPath, result.html);
            successCount++;
          } else {
            console.error(`  ✗ ${result.error}`);
            errors.push(result.error);
            errorCount++;
          }
        }
      } else {
        // Regular mode: single page generation
        const result = renderTemplate(
          template.fullPath,
          template.keyName,
          data,
          null,
          config.rootDir
        );

        if (result.success) {
          // Write the rendered HTML to dist
          const outputPath = join(template.outputDir, template.outputName);
          writeRenderedFile(config.distDir, outputPath, result.html);
          successCount++;
        } else {
          // Log error and skip file generation
          console.error(`✗ ${result.error}`);
          errors.push(result.error);
          errorCount++;
        }
      }
    }

    console.log("");

    // Step 7: Summary
    console.log("📊 Build Summary:");
    console.log(`  - Templates rendered: ${successCount}`);
    if (errorCount > 0) {
      console.log(`  - Templates skipped: ${errorCount}`);
    }
    console.log("");

    if (errorCount === 0) {
      console.log("✅ Build completed successfully!\n");
      return { success: true, rendered: successCount, skipped: errorCount };
    } else {
      console.log("⚠️  Build completed with errors.\n");
      return {
        success: false,
        rendered: successCount,
        skipped: errorCount,
        errors,
      };
    }
  } catch (error) {
    console.error(`\n❌ Build failed: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}
