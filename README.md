# react-router-file

[![npm version](https://badge.fury.io/js/react-router-file.svg)](https://badge.fury.io/js/react-router-file)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A zero-config file system router for React with Vite.**  
Automatically generates routes from your file structure, with code-splitting and Next.js-inspired dynamic routing.

> ⚡ We recommend using [`react-router`](https://reactrouter.com/en/main) for best performance and smallest bundle size.  
> 🔌 `react-router-dom` is also supported for traditional web applications.

---

## ✨ Features

- 🚀 **Zero Configuration** – Just add files and routes are auto-generated.
- 📁 **File-Based Routing** – Your folder structure becomes your route map.
- 🔄 **Dynamic Routes** – Supports `[param]` and catch-all `[...slug]` routes.
- 📦 **Code Splitting** – Each route is lazy-loaded automatically.
- ⚙️ **Vite Plugin** – Seamless integration with Vite's ecosystem.
- 🎨 **Next.js-like Syntax** – Familiar and efficient route definitions.

---

## 📦 Installation

### Recommended (react-router)
```bash
npm install react-router-file react-router
```

### For web apps (with react-router-dom)
```bash
npm install react-router-file react-router react-router-dom
```

---

## ⚙️ Setup

### 1. Configure the plugin in `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fileRouter from 'react-router-file';

export default defineConfig({
  plugins: [
    react(),
    fileRouter({
      pagesDir: 'src/pages',          // Optional (default: src/pages)
      outputFile: 'src/router.tsx',   // Optional (default: src/router.tsx)
      importSource: 'react-router'    // Recommended for performance
    })
  ]
});
```

---

### 2. Set up your entry point

#### With `react-router` (Recommended)

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router'; // From react-router
import { AppRoutes } from './router'; // Auto-generated

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
```

#### Or with `react-router-dom` (Browser projects)

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

---

## 📂 File-Based Routing

Your file structure defines your routing:

```
src/pages/
├── index.tsx         → /
├── about.tsx         → /about
└── posts/
    ├── index.tsx     → /posts
    ├── [id].tsx      → /posts/:id
    └── [...slug].tsx → /posts/*
```

---

## 🧭 Navigation

Use the standard `Link` component from `react-router` or `react-router-dom`.

```tsx
import { Link } from 'react-router'; // Or 'react-router-dom'

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/posts/example">Post</Link>
    </nav>
  );
}
```

---

## 📌 Accessing Route Info

Use standard React Router hooks like `useParams`, `useNavigate`, and `useLocation`.

```tsx
import { useParams, useNavigate } from 'react-router';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Post ID: {id}</h1>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
}
```

---

## 🔧 Plugin Options

```ts
fileRouter({
  pagesDir?: string;       // Where your route files are (default: src/pages)
  outputFile?: string;     // Where to generate router (default: src/router.tsx)
  importSource?: string;   // Module used for Route components. 'react-router' or 'react-router-dom'
});
```

---

## 💡 Tips

- You can generate multiple routers with different configurations for micro-frontends.
- Use catch-all routes (`[...slug].tsx`) for 404 pages or dynamic paths.
- The router component (`AppRoutes`) is auto-generated and ready to use.

---

## 📃 License

MIT © Gabriel Raposo
