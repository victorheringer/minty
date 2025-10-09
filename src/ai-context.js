/**
 * AI Context Generator for Minty
 * Automatically generates and updates the AI-optimized project context
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generates or updates the AI context file
 * @param {Object} buildStats - Statistics from the build process
 * @param {Object} config - Current configuration
 */
export function updateAIContext(buildStats = {}, config = {}) {
  const projectRoot = join(__dirname, "..");
  const contextPath = join(projectRoot, ".minty-ai-context.json");

  // Load existing context or create base structure
  let context = getBaseContext();

  if (existsSync(contextPath)) {
    try {
      const existing = JSON.parse(readFileSync(contextPath, "utf-8"));
      // Merge with existing, keeping dynamic data
      context = {
        ...existing,
        meta: {
          ...existing.meta,
          lastUpdate: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.log("Creating new AI context file...");
    }
  }

  // Update with current build information
  if (buildStats.templatesFound) {
    context.metrics = {
      ...context.metrics,
      templatesFound: buildStats.templatesFound,
      templatesRendered: buildStats.templatesRendered,
      partialsUsed: buildStats.partialsUsed,
      extensionsActive: config.extensions || ["html"],
      lastBuildTime: new Date().toISOString(),
      wildcardUsage: buildStats.wildcardTemplates || 0,
    };
  }

  // Write updated context
  writeFileSync(contextPath, JSON.stringify(context, null, 2), "utf-8");
  console.log("✓ Updated AI context file");
}

/**
 * Gets the base AI context structure
 * @returns {Object} Base context structure
 */
function getBaseContext() {
  return {
    meta: {
      project: "minty",
      type: "universal-template-engine",
      description:
        "Lightweight, modular template engine that processes any file type using Handlebars.js and JSON data",
      version: "1.0.0",
      lastUpdate: new Date().toISOString(),
      aiContextVersion: "1.0.0",
    },
    architecture: {
      core: {
        config: {
          file: "src/config.js",
          purpose:
            "Load and validate .mintyrc configuration file from parent directory",
          dependencies: [],
          "key-functions": ["loadConfig"],
          "configuration-fields": [
            "jsonPath",
            "rootDir",
            "distDir",
            "extensions",
          ],
        },
        data: {
          file: "src/data.js",
          purpose:
            "Load and validate JSON data file containing template content",
          dependencies: ["config"],
          "key-functions": ["loadData"],
          validates: ["common-key-exists", "json-syntax"],
        },
        templates: {
          file: "src/templates.js",
          purpose:
            "Discover template and partial files with configured extensions",
          dependencies: ["config"],
          "key-functions": ["findTemplates", "findPartials"],
          patterns: ["*.template.{ext}", "*.partial.{ext}"],
        },
        renderer: {
          file: "src/renderer.js",
          purpose: "Compile Handlebars templates and merge with data",
          dependencies: ["templates", "data", "partials"],
          "key-functions": ["renderTemplate", "checkWildcard"],
          "template-engine": "handlebars",
        },
        partials: {
          file: "src/partials.js",
          purpose: "Process and substitute partial template includes",
          dependencies: ["templates"],
          "key-functions": [
            "processPartials",
            "renderPartial",
            "createPartialMap",
          ],
          "import-patterns": [
            "@filename.partial.ext",
            "<!-- @filename.partial.ext -->",
          ],
        },
        files: {
          file: "src/files.js",
          purpose: "Handle file operations - clear, copy, write",
          dependencies: ["config"],
          "key-functions": [
            "clearDist",
            "copyStaticFiles",
            "writeRenderedFile",
          ],
        },
        build: {
          file: "src/build.js",
          purpose: "Orchestrate the complete build process",
          dependencies: [
            "config",
            "data",
            "templates",
            "renderer",
            "partials",
            "files",
          ],
          "key-functions": ["build"],
        },
      },
    },
    patterns: {
      wildcards: {
        description:
          "Generate multiple files from single template using asterisk pattern",
        trigger: "JSON key ends with asterisk (*)",
        example: "product* → product.laptop.html, product.phone.html",
        "filename-pattern": "{templateName}.{subKey}.{extension}",
        "works-with": ["all-extensions", "partials"],
      },
      partials: {
        description: "Include reusable template components",
        trigger: "@filename.partial.ext in template content",
        "import-formats": [
          "@filename.partial.ext",
          "<!-- @filename.partial.ext -->",
        ],
        "data-source": "filename_ key in JSON",
        "data-merge": "template-data > partial-data > common-data",
        "works-with": ["all-extensions", "wildcards"],
      },
      extensions: {
        description: "Process any file type as templates",
        trigger: "extensions field in .mintyrc",
        examples: ["html", "css", "json", "md", "txt", "js"],
        patterns: ["name.template.{ext}", "name.partial.{ext}"],
      },
    },
    "ai-context": {
      purpose:
        "Optimized project representation for AI understanding and evolution",
      activation: ["file-presence", "explicit-request"],
      keywords: [
        "consulte o contexto IA",
        "use o mapa neural",
        "verifique a arquitetura",
      ],
      benefits: [
        "rapid-understanding",
        "dependency-mapping",
        "pattern-recognition",
      ],
    },
  };
}

/**
 * Generates a fresh AI context file for Minty itself
 */
export function generateAIContext() {
  updateAIContext();
  console.log("🧠 AI context file generated successfully!");
}
