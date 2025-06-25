import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vol } from 'memfs';
import { generateRoutes } from './generator.js';
import { glob } from 'glob';
import fs from 'fs';

// Mocks
vi.mock('glob');
vi.mock('fs', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');
  return {
    ...memfs,
    default: {
      ...memfs.fs,
      mkdirSync: memfs.vol.mkdirSync.bind(memfs.vol),
    },
    mkdirSync: memfs.vol.mkdirSync.bind(memfs.vol),
  };
});

// Helper para silenciar o console durante os testes
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('generateRoutes() - Core Features', () => {
  const PAGES_DIR = '/project/src/pages';
  const OUTPUT_FILE = '/project/src/router.tsx';
  const mockedGlob = vi.mocked(glob);

  beforeEach(() => {
    vol.reset();
    mockedGlob.mockClear();
  });

  it('should generate routes for basic pages and sort them correctly', async () => {
    mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/index.tsx`,
      `${PAGES_DIR}/about.tsx`,
      `${PAGES_DIR}/contact.tsx`,
    ]);
    vol.fromJSON({
      'index.tsx': 'export default () => <div>Home</div>',
      'about.tsx': 'export default () => <div>About</div>',
      'contact.tsx': 'export default () => <div>Contact</div>',
    }, PAGES_DIR);

    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE, importSource: 'react-router-dom' });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');

    expect(generatedCode).toContain('<Route path="contact" element={<Page2 />} />');
    expect(generatedCode).toContain('<Route path="about" element={<Page1 />} />');
    expect(generatedCode).toContain('<Route index element={<Page0 />} />');
  });

  // --- TESTE CORRIGIDO ---
  it('should handle dynamic and catch-all routes, sorting catch-all last', async () => {
    mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/posts/[id].tsx`, // Page0
      `${PAGES_DIR}/docs/[...slug].tsx`, // Page1
      `${PAGES_DIR}/index.tsx`, // Page2
    ]);
    vol.fromJSON({
      'posts/[id].tsx': 'export default () => <div>Post</div>',
      'docs/[...slug].tsx': 'export default () => <div>Docs</div>',
      'index.tsx': 'export default () => <div>Home</div>',
    }, PAGES_DIR);

    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE, importSource: 'react-router-dom' });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    
    // Verifica a estrutura aninhada e a ordem correta dos nós
    const postsRouteRegex = /<Route path="posts">\s*<Route path=":id" element={<Page0 \/>} \/>\s*<\/Route>/s;
    const docsRouteRegex = /<Route path="docs">\s*<Route path="\*" element={<Page1 \/>} \/>\s*<\/Route>/s;

    expect(generatedCode).toMatch(postsRouteRegex);
    expect(generatedCode).toMatch(docsRouteRegex);

    // A verificação final e mais importante: a posição da rota de posts DEVE ser anterior à de docs
    const postsIndex = generatedCode.search(postsRouteRegex);
    const docsIndex = generatedCode.search(docsRouteRegex);
    
    expect(postsIndex).toBeGreaterThan(-1);
    expect(docsIndex).toBeGreaterThan(-1);
    expect(postsIndex).toBeLessThan(docsIndex);
  });

  it('should use the custom importSource when provided', async () => {
    mockedGlob.mockResolvedValue([`${PAGES_DIR}/home.tsx`]);
    vol.fromJSON({ 'home.tsx': 'export default () => <div />' }, PAGES_DIR);

    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE, importSource: 'react-router' });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    expect(generatedCode).toContain("from 'react-router'");
  });
});

describe('generateRoutes() - Layout Features', () => {
  const PAGES_DIR = '/project/src/pages';
  const OUTPUT_FILE = '/project/src/router.tsx';
  const mockedGlob = vi.mocked(glob);

  beforeEach(() => {
    vol.reset();
    mockedGlob.mockClear();
  });

  it('should create a root layout wrapping all pages', async () => {
    mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/layout.tsx`,
      `${PAGES_DIR}/index.tsx`,
      `${PAGES_DIR}/about.tsx`,
    ]);
    vol.fromJSON({
      'layout.tsx': 'export default () => <Outlet />',
      'index.tsx': 'export default () => <div>Home</div>',
      'about.tsx': 'export default () => <div>About</div>',
    }, PAGES_DIR);

    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE, importSource: 'react-router-dom' });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    
    const layoutWrapperRegex = /<Route path="\/" element={<Page0 \/>}>\s*<Route index element={<Page1 \/>} \/>\s*<Route path="about" element={<Page2 \/>} \/>\s*<\/Route>/s;
    expect(generatedCode).toMatch(layoutWrapperRegex);
  });

  it('should handle nested layouts correctly', async () => {
    mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/layout.tsx`,
      `${PAGES_DIR}/dashboard/layout.tsx`,
      `${PAGES_DIR}/dashboard/index.tsx`,
      `${PAGES_DIR}/dashboard/settings.tsx`,
    ]);
    vol.fromJSON({
      'layout.tsx': 'export default () => <Outlet />', // Page0
      'dashboard/layout.tsx': 'export default () => <Outlet />', // Page1
      'dashboard/index.tsx': 'export default () => <div>Dashboard Home</div>', // Page2
      'dashboard/settings.tsx': 'export default () => <div>Settings</div>', // Page3
    }, PAGES_DIR);

    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE, importSource: 'react-router-dom' });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    
    expect(generatedCode).toMatchSnapshot();
    const nestedLayoutRegex = /<Route path="dashboard" element={<Page1 \/>}>\s*<Route index element={<Page2 \/>} \/>\s*<Route path="settings" element={<Page3 \/>} \/>\s*<\/Route>/s;
    expect(generatedCode).toContain('<Route path="/" element={<Page0 />}>');
    expect(generatedCode).toMatch(nestedLayoutRegex);
  });

  it('should handle pages alongside a directory with a layout', async () => {
    mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/admin/layout.tsx`,
      `${PAGES_DIR}/admin/index.tsx`,
      `${PAGES_DIR}/admin/users.tsx`,
      `${PAGES_DIR}/index.tsx`,
    ]);
    vol.fromJSON({
      'admin/layout.tsx': 'export default () => <Outlet />', // Page0
      'admin/index.tsx': 'export default () => <div>Admin</div>', // Page1
      'admin/users.tsx': 'export default () => <div>Admin Users</div>', // Page2
      'index.tsx': 'export default () => <div>Home</div>', // Page3
    }, PAGES_DIR);
    
    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE, importSource: 'react-router-dom' });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');

    expect(generatedCode).toMatchSnapshot();
    expect(generatedCode).toContain('<Route index element={<Page3 />} />');
    const adminRegex = /<Route path="admin" element={<Page0 \/>}>\s*<Route index element={<Page1 \/>} \/>\s*<Route path="users" element={<Page2 \/>} \/>\s*<\/Route>/s;
    expect(generatedCode).toMatch(adminRegex);
  });
});