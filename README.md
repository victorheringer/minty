# Minty 🌿

A lightweight, modular static site generator built with Node.js and Handlebars.js.

## Overview

Minty is a simple yet powerful tool that generates static HTML websites from Handlebars templates and JSON data. It's designed to be used as a Git submodule, making it easy to integrate into any web project.

**Key Features:**

- 🎨 Uses Handlebars.js for flexible templating
- 📦 Simple JSON-based content management
- ⭐ **Wildcard pattern** for generating multiple pages from one template
- 🗂️ Maintains folder structure in output
- 🔄 Automatic static file copying
- 🚀 Fast and lightweight
- 📝 Shared data across all pages

## Installation

Add Minty as a submodule to your project:

```bash
git submodule add git@github.com:victorheringer/minty.git
cd minty
yarn install
```

## Configuration

Create a `.mintyrc` file in the **parent directory** of the Minty folder:

```json
{
  "jsonPath": "data.json",
  "rootDir": "site",
  "distDir": "dist"
}
```

### Configuration Fields

- **jsonPath**: Path to the JSON file containing your page data (relative to the parent directory)
- **rootDir**: Directory containing your `.template.html` files and static assets (relative to the parent directory)
- **distDir**: Output directory for generated files (relative to the parent directory)

## Project Structure

```plaintext
/your-project
├─ .mintyrc           ← Configuration file
├─ data.json          ← Content data
├─ /minty             ← This tool (as submodule)
├─ /site              ← Your source files
│   ├─ index.template.html
│   ├─ about.template.html
│   ├─ /assets
│   │   ├─ style.css
│   │   └─ script.js
│   └─ /images
└─ /dist              ← Generated output (created automatically)
    ├─ index.html
    ├─ about.html
    ├─ /assets
    └─ /images
```

## Data Structure

Your JSON file should contain:

1. A **`common`** key with data shared across all pages
2. Individual keys for each template file
3. **Optional**: Wildcard keys (ending with `*`) for generating multiple pages from a single template

### Example `data.json`

```json
{
  "common": {
    "siteTitle": "My Awesome Site",
    "footerText": "© 2025 Victor Heringer",
    "navLinks": [
      { "url": "/", "label": "Home" },
      { "url": "/about.html", "label": "About" }
    ]
  },
  "index": {
    "title": "Welcome Home",
    "heading": "Welcome to my site",
    "content": "This is the homepage content."
  },
  "about": {
    "title": "About Us",
    "heading": "About Our Company",
    "content": "We build amazing things."
  }
}
```

### Wildcard Pattern for Multiple Pages

You can generate **multiple pages from a single template** using the wildcard pattern (`*`). Add an asterisk to the end of a key name, and each sub-key will generate a separate HTML file.

**Example with `product*`:**

```json
{
  "common": {
    "siteTitle": "My Store",
    "footerText": "© 2025 My Store"
  },
  "product*": {
    "laptop": {
      "title": "Gaming Laptop",
      "description": "High-performance laptop for gaming",
      "price": "$1,299"
    },
    "phone": {
      "title": "Smartphone Pro",
      "description": "Latest smartphone with amazing camera",
      "price": "$899"
    },
    "tablet": {
      "title": "Tablet Ultra",
      "description": "Large screen tablet for productivity",
      "price": "$599"
    }
  }
}
```

**Template:** `product.template.html`

**Output:**

- `product.laptop.html` (using data from "laptop" + common)
- `product.phone.html` (using data from "phone" + common)
- `product.tablet.html` (using data from "tablet" + common)

This feature is perfect for:

- Product catalogs
- Blog posts
- Team member profiles
- Portfolio items
- Any scenario where you need many similar pages

## Template Syntax

Templates use standard Handlebars.js syntax. Data from `common` is merged with page-specific data (page data takes precedence).

### Example `index.template.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{title}} - {{siteTitle}}</title>
    <link rel="stylesheet" href="/assets/style.css" />
  </head>
  <body>
    <header>
      <h1>{{siteTitle}}</h1>
      <nav>
        {{#each navLinks}}
        <a href="{{url}}">{{label}}</a>
        {{/each}}
      </nav>
    </header>

    <main>
      <h2>{{heading}}</h2>
      <p>{{content}}</p>
    </main>

    <footer>
      <p>{{footerText}}</p>
    </footer>

    <script src="/assets/script.js"></script>
  </body>
</html>
```

### Handlebars Helpers

Minty supports all standard Handlebars helpers:

- **`{{variable}}`** - Output a variable
- **`{{#if condition}}`** - Conditional rendering
- **`{{#each array}}`** - Loop through arrays
- **`{{#unless condition}}`** - Negative conditional
- **`{{{raw}}}`** - Unescaped HTML output

## Usage

### Build Your Site

From the parent directory of the Minty folder:

```bash
cd minty
yarn minty build
```

Or add a script to your parent project's `package.json`:

```json
{
  "scripts": {
    "build": "cd minty && yarn minty build"
  }
}
```

Then run:

```bash
yarn build
```

### What Happens During Build

1. ✅ Loads configuration from `.mintyrc`
2. ✅ Loads data from your JSON file
3. ✅ Clears the dist directory
4. ✅ Copies all static files (CSS, JS, images, etc.)
5. ✅ Renders each `.template.html` file with its corresponding data
6. ✅ Generates final `.html` files in the dist directory

## Error Handling

Minty provides clear error messages:

- **Missing template data**: If a `.template.html` file has no corresponding key in the JSON, it will be skipped with an error message
- **Missing configuration**: If `.mintyrc` is not found, the build stops with instructions
- **Invalid JSON**: Syntax errors in JSON files are caught and reported
- **Missing common data**: If the `common` key is missing from the JSON, the build fails

## Template Naming Convention

- Template files **must** end with `.template.html`
- The key in JSON must match the template filename (without `.template.html`)
- Output files will have `.template` removed

### Single Page Templates

**Examples:**

- `index.template.html` → requires `"index"` key → outputs `index.html`
- `about.template.html` → requires `"about"` key → outputs `about.html`
- `blog/post.template.html` → requires `"post"` key → outputs `blog/post.html`

### Wildcard Templates (Multiple Pages)

**Examples:**

- `product.template.html` + `"product*"` key → outputs `product.laptop.html`, `product.phone.html`, etc.
- `profile.template.html` + `"profile*"` key → outputs `profile.john.html`, `profile.jane.html`, etc.
- `article.template.html` + `"article*"` key → outputs `article.intro.html`, `article.tutorial.html`, etc.

The wildcard pattern uses the **asterisk (`*`)** at the end of the JSON key to indicate multiple page generation.

## Requirements

- Node.js >= 18.0.0 (LTS)
- Yarn package manager

## License

MIT

---

Built with 🌿 by Victor Heringer
