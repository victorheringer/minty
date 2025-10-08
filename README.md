# Minty 🌿

A lightweight, modular universal template engine built with Node.js and Handlebars.js.

## Overview

Minty is a simple yet powerful tool that generates static files from Handlebars templates and JSON data. It can process any file type - HTML, CSS, JSON, Markdown, configuration files, and more. It's designed to be used as a Git submodule, making it easy to integrate into any project.

**Key Features:**

- 🎨 Uses Handlebars.js for flexible templating
- 📦 Simple JSON-based content management
- 🌐 **Universal file support** - HTML, CSS, JSON, Markdown, and any extension
- ⭐ **Wildcard pattern** for generating multiple files from one template
- 🧩 **Partial templates** for reusable components
- 🗂️ Maintains folder structure in output
- 🔄 Automatic static file copying
- 🚀 Fast and lightweight
- 📝 Shared data across all templates

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
  "distDir": "dist",
  "extensions": "html,css,txt,json"
}
```

### Configuration Fields

- **jsonPath**: Path to the JSON file containing your template data (relative to the parent directory)
- **rootDir**: Directory containing your template files and static assets (relative to the parent directory)
- **distDir**: Output directory for generated files (relative to the parent directory)
- **extensions** _(optional)_: Comma-separated list of file extensions to process (default: `"html"`)

### Supported File Types

Minty can process **any file type** as templates! Simply specify the extensions you want to use:

- **HTML**: `"html"` for web pages and websites
- **CSS**: `"css"` for dynamic stylesheets with variables
- **JavaScript**: `"js"` for dynamic scripts and configurations
- **Text**: `"txt,md"` for documentation and text files
- **Data**: `"json,xml,yaml"` for configuration files
- **Mixed**: `"html,css,js,json"` for complete projects

**Examples:**

- `style.template.css` → `style.css`
- `config.template.json` → `config.json`
- `README.template.md` → `README.md`
- `script.template.js` → `script.js`

## Project Structure

```plaintext
/your-project
├─ .mintyrc           ← Configuration file
├─ data.json          ← Content data
├─ /minty             ← This tool (as submodule)
├─ /site              ← Your source files
│   ├─ index.template.html
│   ├─ about.template.html
│   ├─ style.template.css
│   ├─ config.template.json
│   ├─ header.partial.html
│   ├─ vars.partial.css
│   ├─ /assets
│   │   ├─ style.css
│   │   └─ script.js
│   └─ /images
└─ /dist              ← Generated output (created automatically)
    ├─ index.html
    ├─ about.html
    ├─ style.css
    ├─ config.json
    ├─ /assets
    └─ /images
```

## Data Structure

Your JSON file should contain:

1. A **`common`** key with data shared across all templates
2. Individual keys for each template file
3. **Optional**: Wildcard keys (ending with `*`) for generating multiple files from a single template

### Example `data.json`

```json
{
  "common": {
    "projectTitle": "My Awesome Project",
    "version": "1.0.0",
    "author": "Victor Heringer"
  },
  "index": {
    "title": "Welcome Home",
    "heading": "Welcome to my project",
    "content": "This is the homepage content."
  },
  "about": {
    "title": "About Us",
    "heading": "About Our Project",
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
    "projectTitle": "My Store",
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

- Product catalogs and e-commerce
- Documentation systems
- Configuration files for different environments
- Multi-language content
- Blog posts and articles
- Team member profiles
- Portfolio items
- Any scenario where you need many similar files

## Partial Templates

Minty supports **partial templates** for reusable components. This allows you to break your templates into smaller, manageable pieces that can be shared across multiple templates of any file type.

### Creating Partials

**Partial files** must follow the naming convention: `{name}.partial.{extension}`

**Examples:**

`header.partial.html`

```html
<header>
  <h1>{{brand}}</h1>
  <nav>
    {{#each navLinks}}
    <li><a href="{{url}}">{{label}}</a></li>
    {{/each}}
  </nav>
</header>
```

`vars.partial.css`

```css
:root {
  --primary: {{primaryColor}};
  --secondary: {{secondaryColor}};
  --font-family: {{fontFamily}};
}
```

### Using Partials in Templates

Include partials in your templates using either format:

- **With comment:** `<!-- @header.partial.html -->`
- **Direct import:** `@header.partial.html`

**Examples:**

`index.template.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{title}} - {{projectTitle}}</title>
    <style>
      @vars.partial.css;
    </style>
  </head>
  <body>
    <!-- @header.partial.html -->

    <main>
      <h2>{{heading}}</h2>
      <p>{{content}}</p>
    </main>

    @footer.partial.html
  </body>
</html>
```

`style.template.css`

```css
@vars.partial.css body {
  font-family: var(--font-family);
  color: var(--primary);
}
```

### Partial Data in JSON

Partial data uses the **underscore suffix** (`_`) in JSON keys:

```json
{
  "common": {
    "projectTitle": "My Project",
    "navLinks": [
      { "url": "/", "label": "Home" },
      { "url": "/about.html", "label": "About" }
    ]
  },
  "header_": {
    "brand": "My Brand Logo"
  },
  "footer_": {
    "copyrightYear": "2025",
    "company": "My Company"
  },
  "vars_": {
    "primaryColor": "#007acc",
    "secondaryColor": "#333",
    "fontFamily": "Arial, sans-serif"
  },
  "index": {
    "title": "Welcome",
    "heading": "Welcome to my project",
    "content": "This is the homepage."
  }
}
```

### Data Merging Priority

For each partial, data is merged in this order (highest priority last):

1. **Common data** (`common`)
2. **Partial-specific data** (`header_`, `footer_`, `vars_`, etc.)
3. **Template-specific data** (`index`, `about`, etc.)

This means template data can override partial data, and partial data can override common data.

## Template Syntax

Templates use standard Handlebars.js syntax. Data from `common` is merged with template-specific data (template data takes precedence).

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

### Multi-Extension Examples

**Dynamic CSS** (`style.template.css`):

```css
:root {
  --primary-color: {{primaryColor}};
  --font-size: {{baseFontSize}};
}

body {
  font-family: {{fontFamily}};
  color: var(--primary-color);
}
```

**Configuration File** (`config.template.json`):

```json
{
  "appName": "{{appName}}",
  "version": "{{version}}",
  "apiUrl": "{{apiUrl}}",
  "features": {
    {{#each features}}
    "{{name}}": {{enabled}}{{#unless @last}},{{/unless}}
    {{/each}}
  }
}
```

**Documentation** (`README.template.md`):

```markdown
# {{projectName}}

Version: {{version}}

## Description

{{description}}

## Installation

{{installInstructions}}
```

## Usage

### Build Your Project

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
4. ✅ Copies all static files (images, fonts, etc.)
5. ✅ Renders each template file (`.template.{ext}`) with its corresponding data
6. ✅ Processes partial includes for all file types
7. ✅ Generates final files with configured extensions in the dist directory

## Error Handling

Minty provides clear error messages:

- **Missing template data**: If a template file has no corresponding key in the JSON, it will be skipped with an error message
- **Missing configuration**: If `.mintyrc` is not found, the build stops with instructions
- **Invalid JSON**: Syntax errors in JSON files are caught and reported
- **Missing common data**: If the `common` key is missing from the JSON, the build fails
- **Invalid extensions**: If extensions field is invalid, configuration loading fails

## Template Naming Convention

- Template files **must** follow the pattern: `{name}.template.{extension}`
- The key in JSON must match the template filename (without `.template.{extension}`)
- Partial files **must** follow the pattern: `{name}.partial.{extension}`
- Output files will have `.template` removed

### Single Page Templates

**Examples:**

- `index.template.html` → requires `"index"` key → outputs `index.html`
- `about.template.html` → requires `"about"` key → outputs `about.html`
- `style.template.css` → requires `"style"` key → outputs `style.css`
- `config.template.json` → requires `"config"` key → outputs `config.json`
- `blog/post.template.md` → requires `"post"` key → outputs `blog/post.md`

### Wildcard Templates (Multiple Pages)

**Examples:**

- `product.template.html` + `"product*"` key → outputs `product.laptop.html`, `product.phone.html`, etc.
- `profile.template.html` + `"profile*"` key → outputs `profile.john.html`, `profile.jane.html`, etc.
- `theme.template.css` + `"theme*"` key → outputs `theme.dark.css`, `theme.light.css`, etc.
- `config.template.json` + `"config*"` key → outputs `config.dev.json`, `config.prod.json`, etc.

### Partial Templates

**Examples:**

- `header.partial.html` → included via `@header.partial.html`
- `footer.partial.html` → included via `@footer.partial.html`
- `vars.partial.css` → included via `@vars.partial.css`
- `common.partial.json` → included via `@common.partial.json`

The wildcard pattern uses the **asterisk (`*`)** at the end of the JSON key to indicate multiple page generation.

## Requirements

- Node.js >= 18.0.0 (LTS)
- Yarn package manager

## License

MIT

---

Built with 🌿 by Victor Heringer
