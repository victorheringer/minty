#!/usr/bin/env node

/**
 * Minty CLI Entry Point
 * Handles command-line arguments and invokes the build process
 */

import { build } from "../src/build.js";
import { generateAIContext } from "../src/ai-context.js";

const args = process.argv.slice(2);
const command = args[0];

// Show help if no command provided
if (!command) {
  console.log(`
🌿 Minty - Static Site Generator

Usage:
  minty build          Generate static site from templates and data
  minty ai-context     Generate AI-optimized project context
  minty help           Show this help message

Examples:
  yarn minty build
  yarn minty ai-context
`);
  process.exit(0);
}

// Execute the requested command
switch (command) {
  case "build":
    const result = await build();
    process.exit(result.success ? 0 : 1);
    break;

  case "ai-context":
    console.log("\n🤖 Generating AI Context...\n");
    try {
      await generateAIContext();
      console.log("✅ AI Context generated successfully!\n");
      process.exit(0);
    } catch (error) {
      console.error(`❌ Failed to generate AI Context: ${error.message}\n`);
      process.exit(1);
    }
    break;

  case "help":
  case "--help":
  case "-h":
    console.log(`
🌿 Minty - Static Site Generator

Usage:
  minty build          Generate static site from templates and data
  minty ai-context     Generate AI-optimized project context
  minty help           Show this help message

Configuration:
  Create a .mintyrc file in the parent directory with:
  {
    "jsonPath": "data.json",
    "rootDir": "site",
    "distDir": "dist",
    "extensions": ["html", "css", "txt", "json"]
  }

AI Context:
  The ai-context command generates .minty-ai-context.json
  This file provides AI assistants with optimized project understanding
  for better code assistance and collaboration.

For more information, see README.md
`);
    process.exit(0);
    break;

  default:
    console.error(`\n❌ Unknown command: ${command}`);
    console.log('Run "minty help" for usage information.\n');
    process.exit(1);
}
