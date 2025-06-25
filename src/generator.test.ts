
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vol } from 'memfs';
import { generateRoutes } from './generator.js';
import { glob } from 'glob';
import fs from 'fs';


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

describe('generateRoutes() - Current Features', () => {
  const CWD = '/project';
  const PAGES_DIR = `${CWD}/src/pages`;
  const OUTPUT_FILE = `${CWD}/src/router.tsx`;
  const mockedGlob = vi.mocked(glob);

  beforeEach(() => {
    vol.reset();
    mockedGlob.mockClear();
    
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should generate routes for basic pages and sort them correctly', async () => {
    mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/index.tsx`,
      `${PAGES_DIR}/about.tsx`,
      `${PAGES_DIR}/contact.tsx`,
    ]);

    vol.fromJSON(
      {
        'index.tsx': 'export default () => <div>Home</div>',
        'about.tsx': 'export default () => <div>About</div>',
        'contact.tsx': 'export default () => <div>Contact</div>',
      },
      PAGES_DIR
    );

    await generateRoutes({
      pagesDir: PAGES_DIR,
      outputFile: OUTPUT_FILE,
      importSource: 'react-router-dom',
    });

    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    expect(generatedCode).toContain('<Route path="/contact" element={<Page2 />} />');
    expect(generatedCode).toContain('<Route path="/about" element={<Page1 />} />');
    expect(generatedCode).toContain('<Route path="/" element={<Page0 />} />');
    expect(generatedCode).toContain("from 'react-router-dom'");
  });

  it('should handle dynamic and catch-all routes, sorting catch-all last', async () => {
    mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/docs/[...slug].tsx`,
      `${PAGES_DIR}/posts/[id].tsx`,
      `${PAGES_DIR}/index.tsx`,
    ]);
    
    vol.fromJSON(
      {
        'index.tsx': 'export default () => <div>Home</div>',
        'posts/[id].tsx': 'export default () => <div>Post</div>',
        'docs/[...slug].tsx': 'export default () => <div>Docs</div>',
      },
      PAGES_DIR
    );

    await generateRoutes({
      pagesDir: PAGES_DIR,
      outputFile: OUTPUT_FILE,
      importSource: 'react-router-dom',
    });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');

    
    const orderCheck = generatedCode.indexOf('/posts/:id') < generatedCode.indexOf('/docs/*');
    expect(orderCheck).toBe(true);
    
    expect(generatedCode).toContain('<Route path="/posts/:id" element={<Page1 />} />');
    expect(generatedCode).toContain('<Route path="/docs/*" element={<Page0 />} />');
  });

  it('should use the custom importSource when provided', async () => {
    mockedGlob.mockResolvedValue([`${PAGES_DIR}/home.tsx`]);
    vol.fromJSON({ 'home.tsx': 'export default () => <div />' }, PAGES_DIR);

    await generateRoutes({
      pagesDir: PAGES_DIR,
      outputFile: OUTPUT_FILE,
      importSource: 'react-router',
    });

    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    expect(generatedCode).toContain("from 'react-router'");
    expect(generatedCode).not.toContain("from 'react-router-dom'");
  });
});

// Adicione este bloco ao final do arquivo src/generator.test.ts

describe('generateRoutes() - Layout Features', () => {
  const CWD = '/project';
  const PAGES_DIR = `${CWD}/src/pages`;
  const OUTPUT_FILE = `${CWD}/src/router.tsx`;
  const mockedGlob = vi.mocked(glob);

  beforeEach(() => {
    vol.reset();
    mockedGlob.mockClear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
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

    expect(generatedCode).toContain('<Route path="/" element={<Page0 />}>');
    expect(generatedCode).toContain('<Route index element={<Page1 />} />');
    expect(generatedCode).toContain('<Route path="about" element={<Page2 />} />');
    // Verifica se as rotas estão aninhadas dentro do layout
    const layoutWrapperRegex = /<Route path="\/" element={<Page0 \/>}>\s*<Route path="about" element={<Page2 \/>} \/>\s*<Route index element={<Page1 \/>} \/>\s*<\/Route>/;
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
      'layout.tsx': 'export default () => <Outlet />',
      'dashboard/layout.tsx': 'export default () => <Outlet />',
      'dashboard/index.tsx': 'export default () => <div>Dashboard Home</div>',
      'dashboard/settings.tsx': 'export default () => <div>Settings</div>',
    }, PAGES_DIR);

    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE, importSource: 'react-router-dom' });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');

    // Snapshot é ótimo para estruturas complexas
    expect(generatedCode).toMatchSnapshot();
    
    // Verificações explícitas
    expect(generatedCode).toContain('<Route path="/" element={<Page0 />}>'); // Root Layout
    expect(generatedCode).toContain('<Route element={<Page1 />}>'); // Dashboard Layout (sem path pois é filho)
    expect(generatedCode).toContain('<Route path="settings" element={<Page3 />} />');
    expect(generatedCode).toContain('<Route index element={<Page2 />} />');
  });

  it('should handle pages alongside a layout and its children', async () => {
     mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/admin/layout.tsx`,
      `${PAGES_DIR}/admin/index.tsx`,
      `${PAGES_DIR}/admin/users.tsx`,
      `${PAGES_DIR}/index.tsx`,
    ]);

    vol.fromJSON({
      'index.tsx': 'export default () => <div>Home</div>',
      'admin/layout.tsx': 'export default () => <Outlet />',
      'admin/index.tsx': 'export default () => <div>Admin</div>',
      'admin/users.tsx': 'export default () => <div>Admin Users</div>',
    }, PAGES_DIR);
    
    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE, importSource: 'react-router-dom' });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');

    expect(generatedCode).toMatchSnapshot();
    
    // Verifica se a rota / (Home) está no nível raiz
    expect(generatedCode).toContain('<Route path="/" element={<Page3 />} />');
    // Verifica se as rotas de admin estão agrupadas sob o seu layout
    const adminRegex = /<Route element={<Page0 \/>}>\s*<Route path="users" element={<Page2 \/>} \/>\s*<Route index element={<Page1 \/>} \/>\s*<\/Route>/;
    expect(generatedCode).toMatch(adminRegex);
  });
});