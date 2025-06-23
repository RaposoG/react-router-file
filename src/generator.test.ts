// src/generator.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vol } from 'memfs';
import { generateRoutes } from './generator';
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

describe('generateRoutes()', () => {
  const CWD = '/project';
  const PAGES_DIR = `${CWD}/src/pages`;
  const OUTPUT_FILE = `${CWD}/src/router.tsx`;

  const mockedGlob = vi.mocked(glob);

  beforeEach(() => {
    vol.reset();
    mockedGlob.mockClear();
  });

  it('should generate routes for basic pages', async () => {
    mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/index.tsx`,
      `${PAGES_DIR}/about.tsx`,
    ]);

    vol.fromJSON(
      {
        'index.tsx': 'export default () => <div>Home</div>',
        'about.tsx': 'export default () => <div>About</div>',
      },
      PAGES_DIR
    );

    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE });

    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    expect(generatedCode).toContain('<Route path="/" element={<Page0 />} />');
    expect(generatedCode).toContain('<Route path="/about" element={<Page1 />} />');
  });

  it('should handle dynamic and catch-all routes', async () => {
    mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/docs/[...slug].tsx`,
      `${PAGES_DIR}/posts/[id].tsx`,
    ]);
    
    vol.fromJSON(
      {
        'posts/[id].tsx': 'export default () => <div>Post</div>',
        'docs/[...slug].tsx': 'export default () => <div>Docs</div>',
      },
      PAGES_DIR
    );

    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');

    expect(generatedCode).toContain('<Route path="/posts/:id" element={<Page1 />} />');
    expect(generatedCode).toContain('<Route path="/docs/*" element={<Page0 />} />');
  });

  it('should create a correct snapshot for a complex structure', async () => {
    mockedGlob.mockResolvedValue([
      `${PAGES_DIR}/index.tsx`,
      `${PAGES_DIR}/about.tsx`,
      `${PAGES_DIR}/users/index.tsx`,
      `${PAGES_DIR}/users/[id].tsx`,
      `${PAGES_DIR}/users/[id]/settings.tsx`,
    ]);

    vol.fromJSON(
      {
        'index.tsx': 'export default () => <div>Home</div>',
        'about.tsx': 'export default () => <div>About</div>',
        'users/index.tsx': 'export default () => <div>Users</div>',
        'users/[id].tsx': 'export default () => <div>User ID</div>',
        'users/[id]/settings.tsx': 'export default () => <div>User Settings</div>',
      },
      PAGES_DIR
    );

    await generateRoutes({ pagesDir: PAGES_DIR, outputFile: OUTPUT_FILE });
    const generatedCode = fs.readFileSync(OUTPUT_FILE, 'utf-8');

    expect(generatedCode).toMatchSnapshot();
  });
});