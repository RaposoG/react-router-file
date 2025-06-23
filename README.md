# vite-react-file-router

[![npm version](https://badge.fury.io/js/vite-react-file-router.svg)](https://badge.fury.io/js/vite-react-file-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero-config file system router for Vite + React applications that brings Next.js-like routing experience. Create files in your `src/pages` directory and get automatic route generation with code splitting!

## Features

* 🚀 **Zero Configuration** - Just add pages and routes are created automatically
* 📁 **File System Based** - Your file structure becomes your routing structure
* 🔄 **Dynamic Routes** - Support for `[param]` and catch-all `[...slug]` routes
* 🎯 **Index Routes** - Automatically maps `index.tsx` files to directory roots
* ⚡ **Automatic Code Splitting** - Every page is lazy-loaded for optimal performance
* 🔌 **Vite Plugin** - Seamless integration with Vite's development server
* 🎨 **Next.js-like API** - Familiar `<Link>` component and `useRouter` hook

## Installation

```bash
npm install vite-react-file-router react-router-dom
```

## Setup

1. **Add the Plugin to Your Vite Config**

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fileRouter from 'vite-react-file-router';

export default defineConfig({
  plugins: [
    react(),
    fileRouter({
      // Optional: customize the pages directory
      pagesDir: 'src/pages',
      // Optional: customize the output file location
      outputFile: 'src/router.tsx'
    })
  ]
});
```

2. **Set Up Your Router**

```tsx
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

## File-Based Routing

Create pages in your `src/pages` directory and they'll automatically become routes:

```
src/pages/
├── index.tsx         → /
├── about.tsx         → /about
├── posts/
│   ├── index.tsx     → /posts
│   ├── [id].tsx      → /posts/:id
│   └── [...slug].tsx → /posts/*
└── settings.tsx      → /settings
```

## Usage Examples

### Basic Page Component

```tsx
// src/pages/about.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to our site!</p>
    </div>
  );
}
```

### Dynamic Route with Parameters

```tsx
// src/pages/posts/[id].tsx
import { useRouter } from 'vite-react-file-router/runtime';

export default function PostPage() {
  const router = useRouter();
  const { id } = router.params;

  return (
    <article>
      <h1>Post {id}</h1>
    </article>
  );
}
```

### Navigation

```tsx
// Using the Link component
import { Link } from 'vite-react-file-router/runtime';

<Link href="/about">About Us</Link>

// Using the router hook
import { useRouter } from 'vite-react-file-router/runtime';

const router = useRouter();
router.push('/posts/123');     // Navigate to a new page
router.replace('/login');      // Replace current history entry
router.back();                // Go back one page

// Access route information
console.log(router.pathname); // Current path
console.log(router.params);   // Route parameters
console.log(router.query);    // URL search params
```

## Plugin Options

```ts
interface PluginOptions {
  // Directory where your page components are located
  pagesDir?: string;          // default: 'src/pages'
  
  // Where to generate the router file
  outputFile?: string;        // default: 'src/router.tsx'
}
```

## How It Works

The plugin:
1. Watches your pages directory for changes
2. Automatically generates routes based on file structure
3. Creates a router configuration with code splitting
4. Integrates seamlessly with Vite's dev server and build process

## API Reference

### `<Link>`
A wrapper around react-router-dom's Link component with a more intuitive API:

```tsx
import { Link } from 'vite-react-file-router/runtime';

<Link 
  href="/about"           // Path to navigate to
  replace={false}        // Optional: replace current history entry
  state={{ from: '/' }} // Optional: pass state to the new route
  className="nav-link"   // Optional: any props accepted by <a> tag
>
  About Us
</Link>
```

### `useRouter()`
A hook that provides routing utilities and route information:

```ts
const router = useRouter();

// Properties
router.pathname: string;           // Current path
router.params: Record<string, string>; // Route parameters
router.query: URLSearchParams;     // URL search parameters

// Methods
router.push(path: string): void;   // Navigate to a new page
router.replace(path: string): void; // Replace current history entry
router.back(): void;               // Go back one page
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
