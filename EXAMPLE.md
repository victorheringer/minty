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
  },
  "product*": {
    "laptop": {
      "title": "Gaming Laptop",
      "description": "High-performance laptop for gaming enthusiasts",
      "price": "$1,299",
      "image": "/assets/laptop.jpg"
    },
    "phone": {
      "title": "Smartphone Pro",
      "description": "Latest smartphone with an amazing camera",
      "price": "$899",
      "image": "/assets/phone.jpg"
    }
  }
}
```

**Note:** The `product*` key with asterisk will generate multiple pages from a single template!

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

### site/product.template.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{title}} - {{siteTitle}}</title>
    <link rel="stylesheet" href="/assets/style.css" />
  </head>
  <body>
    <h1>{{title}}</h1>
    <img src="{{image}}" alt="{{title}}" />
    <p>{{description}}</p>
    <p class="price">{{price}}</p>
    <footer>{{footerText}}</footer>
  </body>
</html>
```

**This template will generate:**

- `product.laptop.html`
- `product.phone.html`

### site/assets/style.css

```css
body {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.price {
  font-size: 24px;
  color: green;
  font-weight: bold;
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
- `product.laptop.html` (generated from product.template.html with laptop data)
- `product.phone.html` (generated from product.template.html with phone data)
- `assets/style.css` (copied as-is)

## Wildcard Pattern Explained

When you use the wildcard pattern (`product*`), Minty:

1. Detects the asterisk in the JSON key
2. Finds the matching template (`product.template.html`)
3. Loops through each sub-key (`laptop`, `phone`)
4. Generates a separate HTML file for each: `product.{subkey}.html`
5. Each page gets its own data merged with `common` data

This is perfect for creating multiple similar pages without duplicating templates!

## Commands

- `yarn minty build` - Generate the static site
- `yarn minty help` - Show help information
