#!/usr/bin/env node

/**
 * Minty CLI Entry Point
 * Handles command-line arguments and invokes the build process
 */

import { build } from "../src/build.js";

const args = process.argv.slice(2);
const command = args[0];

// Show help if no command provided
if (!command) {
  console.log(`
🌿 Minty - Universal Template Engine

Usage:
  minty build          Generate files from templates and data
  minty help           Show this help message

Examples:
  yarn minty build
`);
  process.exit(0);
}

// Execute the requested command
switch (command) {
  case "build":
    const result = await build();
    process.exit(result.success ? 0 : 1);
    break;

  case "help":
  case "--help":
  case "-h":
    console.log(`
🌿 Minty - Universal Template Engine

Usage:
  minty build          Generate files from templates and data
  minty help           Show this help message

Configuration:
  Create a .mintyrc file in the parent directory with:
  {
    "jsonPath": "data.json",
    "rootDir": "site",
    "distDir": "dist",
    "extensions": ["html", "css", "txt", "json"]
  }

For more information, see README.md
`);
    process.exit(0);
    break;

  default:
    console.error(`\n❌ Unknown command: ${command}`);
    console.log('Run "minty help" for usage information.\n');
    process.exit(1);
}
