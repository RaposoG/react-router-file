# Vite React File Router

[![npm version](https://badge.fury.io/js/react-router-file.svg)](https://badge.fury.io/js/react-router-file)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A file-system-based router for React + Vite that extends the powerful `react-router-dom` to provide a Next.js-like development experience.

Just create files in your `src/pages` directory and let the magic happen!

## The Problem It Solves

In a standard React + Vite application, setting up routes with `react-router-dom` is a manual process. For every new page, you need to import the component and add a new `<Route>` entry. This project automates that, letting you focus on building pages, not configuring routes.

## Features

* **Zero Configuration:** Just create a page and it becomes a route.
* **Dynamic Routes:** Supports `[param]` syntax for dynamic segments.
* **Catch-all Routes:** Supports `[...slug]` syntax for catch-all routes.
* **Index Routes:** `index.tsx` files are automatically mapped to the root of a directory.
* **Next.js-like API:** Includes a convenient `<Link>` component and `useRouter` hook.
* **Lazy Loading:** Pages are automatically lazy-loaded for better performance.

## Installation

```bash
npm install react-router-file
```
```bash
pnpm add react-router-file
```
```bash
yarn add react-router-file
```
```bash
bun add react-router-file
```

You also need to have `react`, `react-dom`, and `react-router-dom` installed as they are peer dependencies.

```bash
npm install react react-dom react-router-dom
```

## Getting Started

**1. Configure Scripts in `package.json`**

Add the `generate-routes` command to your `package.json` to handle route generation.

```json
{
  "scripts": {
    "dev": "npx generate-routes --watch & vite",
    "build": "npx generate-routes && vite build"
  }
}
```
* `generate-routes --watch`: Watches the `src/pages` directory for changes and automatically regenerates routes during development. The `&` runs it in parallel with the Vite dev server.

**2. Create Your Pages**

Create a `src/pages` directory and add your page components. The file structure defines your URL structure.

* `src/pages/index.tsx`         → `/`
* `src/pages/about.tsx`         → `/about`
* `src/pages/posts/index.tsx`   → `/posts`
* `src/pages/posts/[id].tsx`    → `/posts/:id`
* `src/pages/docs/[...slug].tsx`→ `/docs/*`


**3. Integrate the Generated Routes**

The generator will create a `src/router.tsx` file. Import the `AppRoutes` component into your application's entry point (`src/main.tsx`).

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router'; // Import the generated routes!
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
```

**4. Navigate with `<Link>` and `useRouter`**

Use the provided convenience hooks and components to navigate through your application.

**Important:** The runtime exports are available under the `/runtime` subpath.

```tsx
// Example: src/pages/posts/[id].tsx
import { Link, useRouter } from 'react-router-file/runtime';

export default function PostPage() {
  const router = useRouter();
  const { id } = router.params; // Get the 'id' from the URL /posts/:id

  return (
    <div>
      <h1>Post ID: {id}</h1>
      <Link href="/">Back to Home</Link>
      <button onClick={() => router.push('/about')}>
        Go to About Page
      </button>
    </div>
  );
}
```

## Contributing

This is an open-source project, and contributions are highly welcome! We want to create the best routing experience for the React + Vite community.

* **Open an Issue:** If you find a bug, have a question, or a feature request, please feel free to [open an issue](https://github.com/your-username/react-router-file/issues).
* **Fork and Pull Request:** If you'd like to contribute code:
    1.  **Fork** this repository.
    2.  Create a new feature branch (`git checkout -b feature/my-awesome-feature`).
    3.  Make your changes and commit them (`git commit -m 'Add my awesome feature'`).
    4.  Push your changes to the branch (`git push origin feature/my-awesome-feature`).
    5.  Open a **Pull Request**.

We appreciate your help in making this project better!

## License

This project is licensed under the [MIT License](LICENSE).