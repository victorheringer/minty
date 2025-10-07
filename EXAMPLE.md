# Minty - Quick Start Example

This file demonstrates how to set up and use Minty in a parent project.

## Parent Project Structure

```
/my-website
├─ .mintyrc
├─ data.json
├─ /minty (this repository as submodule)
├─ /site
│   ├─ index.template.html
│   ├─ about.template.html
│   └─ /assets
│       └─ style.css
└─ /dist (generated)
```

## Step 1: Create .mintyrc

In the parent directory (`/my-website`), create `.mintyrc`:

```json
{
  "jsonPath": "data.json",
  "rootDir": "site",
  "distDir": "dist"
}
```

## Step 2: Create data.json

In the parent directory (`/my-website`), create `data.json`:

```json
{
  "common": {
    "siteTitle": "My Awesome Site",
    "footerText": "© 2025 Victor Heringer",
    "year": "2025"
  },
  "index": {
    "title": "Welcome",
    "heading": "Welcome to My Site",
    "content": "This is the homepage content."
  },
  "about": {
    "title": "About",
    "heading": "About Us",
    "content": "We build cool stuff with Minty!"
  }
}
```

## Step 3: Create Templates

### site/index.template.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{title}} - {{siteTitle}}</title>
    <link rel="stylesheet" href="/assets/style.css" />
  </head>
  <body>
    <h1>{{heading}}</h1>
    <p>{{content}}</p>
    <footer>{{footerText}}</footer>
  </body>
</html>
```

### site/about.template.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{title}} - {{siteTitle}}</title>
    <link rel="stylesheet" href="/assets/style.css" />
  </head>
  <body>
    <h1>{{heading}}</h1>
    <p>{{content}}</p>
    <footer>{{footerText}}</footer>
  </body>
</html>
```

### site/assets/style.css

```css
body {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
```

## Step 4: Build Your Site

```bash
cd minty
yarn minty build
```

## Output

The `dist` folder will contain:

- `index.html` (rendered from index.template.html)
- `about.html` (rendered from about.template.html)
- `assets/style.css` (copied as-is)

## Commands

- `yarn minty build` - Generate the static site
- `yarn minty readme` - Generate/update README.md
- `yarn minty help` - Show help information
