# react-router-file

[![npm version](https://badge.fury.io/js/react-router-file.svg)](https://badge.fury.io/js/react-router-file)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero-config file system router for Vite + React that brings a Next.js-like routing experience. Automatically generates routes with code-splitting from your file structure.

## Features

* 🚀 **Zero Configuration** - Just add pages and routes are created automatically.
* 📁 **File System Based** - Your file structure becomes your routing structure.
* 🔄 **Dynamic Routes** - Support for `[param]` and catch-all `[...slug]` routes.
* 🎯 **Index Routes** - Automatically maps `index.tsx` files to directory roots.
* ⚡ **Automatic Code Splitting** - Every page is lazy-loaded for optimal performance.
* 🔌 **Vite Plugin** - Seamless integration with Vite's development server.
* 🌐 **Environment Agnostic** - Works for web apps (`react-router-dom`) and desktop/native (`react-router`).
* 🎨 **Next.js-like API** - Familiar `<Link>` component and `useRouter` hook.

## Installation

The library requires `react` and `react-router` as core peer dependencies. For web projects, you will also need `react-router-dom`.

```bash
# For standard web projects
npm install react-router-file react-router react-router-dom
```

## Setup

The setup depends on your target environment.

### For Web Applications (Default)

This is the standard setup for websites and web apps.

1. **Configure Vite Plugin (vite.config.ts)**

No special options are needed. The plugin defaults to using react-router-dom.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fileRouter from 'react-router-file';

export default defineConfig({
  plugins: [
    react(),
    fileRouter(
        pagesDir?: string; // OPTIONAL: Exemple src/app
        outputFile?: string; 
        importSource?: string;
    ) // Defaults are perfect for web
  ]
});
```

2. **Set Up Router (src/main.tsx)**

Use the `<BrowserRouter>` from react-router-dom.

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
```

### For Other Environments (e.g., Tauri, React Native)

For non-browser environments, tell the plugin to use the core react-router package and set up a `<MemoryRouter>`.

1. **Configure Vite Plugin (vite.config.ts)**

Use the `importSource` option to specify react-router.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fileRouter from 'react-router-file';

export default defineConfig({
  plugins: [
    react(),
    fileRouter({
      importSource: 'react-router'
    })
  ]
});
```

2. **Set Up Router (src/main.tsx)**

Use the `<MemoryRouter>` to provide the routing context.

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MemoryRouter>
      <AppRoutes />
    </MemoryRouter>
  </React.StrictMode>
);
```

## File-Based Routing

Create pages in your configured `pagesDir` (default: src/pages) and they'll automatically become routes:

```
src/pages/
├── index.tsx         → /
├── about.tsx         → /about
└── posts/
    ├── index.tsx     → /posts
    ├── [id].tsx      → /posts/:id
    └── [...slug].tsx → /posts/*
```

## Usage

### `<Link>` Component

To navigate between pages, use the `<Link>` component.

```typescript
import { Link } from 'react-router-file/runtime';

function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About Us</Link>
      <Link href="/posts/a-great-post">View Post</Link>
    </nav>
  );
}
```

### `useRouter()` Hook

To access route information and navigation methods, use the `useRouter` hook.

```typescript
// src/pages/posts/[id].tsx
import { useRouter } from 'react-router-file/runtime';

export default function PostPage() {
  const router = useRouter();
  const { id } = router.params;

  return (
    <article>
      <h1>Post ID: {id}</h1>
      <button onClick={() => router.back()}>Go Back</button>
    </article>
  );
}
```

## API Reference

### Plugin Options

```typescript
// vite.config.ts
fileRouter({
  // Directory where page components are located.
  // Default: 'src/pages'
  pagesDir?: string; 
  
  // Path where the generated router file will be saved.
  // Default: 'src/router.tsx'
  outputFile?: string; 

  // The package to import <Routes> and <Route> from.
  // Use 'react-router' for non-browser environments.
  // Default: 'react-router-dom'
  importSource?: string;
})
```

### `<Link>`

A wrapper around the router's Link component. It accepts all standard anchor tag attributes.

```typescript
import { Link } from 'react-router-file/runtime';

<Link 
  href="/about"          // Path to navigate to
  replace={false}        // Optional: replace current history entry
  state={{ from: '/' }}  // Optional: pass state to the new route
  className="nav-link"
>
  About Us
</Link>
```

### `useRouter()`

A hook that provides routing utilities and information.

```typescript
const router = useRouter();

// Properties
router.pathname: string;           // Current path, e.g., "/posts/123"
router.params: Record<string, any>; // Route params, e.g., { id: "123" }
router.query: URLSearchParams;      // URL search params object

// Methods
router.push(path: string): void;    // Navigate to a new page
router.replace(path: string): void; // Replace current history entry
router.back(): void;                // Go back one page
