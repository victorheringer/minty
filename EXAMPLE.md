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
│   ├─ product.template.html
│   ├─ header.partial.html
│   ├─ footer.partial.html
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
    "year": "2025",
    "navLinks": [
      { "url": "/", "label": "Home" },
      { "url": "/about.html", "label": "About" }
    ]
  },
  "header_": {
    "brand": "My Brand Logo"
  },
  "footer_": {
    "footerText": "© 2025 Victor Heringer"
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

**Features shown:**

- `common` data shared across all pages
- `header_` and `footer_` data for partials (note the underscore)
- `product*` wildcard pattern for multiple product pages

## Step 3: Create Templates

### site/header.partial.html

```html
<header>
  <h1>{{brand}}</h1>
  <nav>
    {{#each navLinks}}
    <a href="{{url}}">{{label}}</a>
    {{/each}}
  </nav>
</header>
```

### site/footer.partial.html

```html
<footer>
  <p>{{footerText}}</p>
  <p>Year: {{year}}</p>
</footer>
```

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
    <!-- @header.partial.html -->

    <main>
      <h1>{{heading}}</h1>
      <p>{{content}}</p>
    </main>

    @footer.partial.html
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
    <!-- @header.partial.html -->

    <main>
      <h1>{{heading}}</h1>
      <p>{{content}}</p>
    </main>

    <!-- @footer.partial.html -->
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

- `index.html` (with header and footer partials included)
- `about.html` (with header and footer partials included)
- `product.laptop.html` (generated from product.template.html with laptop data)
- `product.phone.html` (generated from product.template.html with phone data)
- `assets/style.css` (copied as-is)

## Features Demonstrated

### 1. Partial Templates

- `header.partial.html` and `footer.partial.html` are reusable components
- Imported using `<!-- @filename.partial.html -->` or `@filename.partial.html`
- Each partial can have its own data (`header_`, `footer_`)

### 2. Data Merging

- `common` data is available to all templates and partials
- `header_` data is merged when rendering the header partial
- `footer_` data is merged when rendering the footer partial
- Page data (`index`, `about`) takes priority over partial and common data

### 3. Wildcard Pattern

- `product*` generates multiple product pages from one template
- Each sub-key becomes a separate HTML file

## Commands

- `yarn minty build` - Generate the static site
- `yarn minty help` - Show help information
