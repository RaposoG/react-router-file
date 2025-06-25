import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface GeneratorOptions {
  pagesDir: string;
  outputFile: string;
  importSource: string;
}

interface RouteFile {
  componentName: string;
  fullPath: string;
  importStatement: string;
}

interface RouteNode {
  pathSegment: string;
  layout?: RouteFile;
  pages: Map<string, RouteFile>;
  children: Map<string, RouteNode>;
}

const lazyImport = (componentName: string, filePath: string, outputFile: string) => {
  const relativePath = path.relative(path.dirname(outputFile), filePath).replace(/\\/g, '/');
  return `const ${componentName} = lazy(() => import('./${relativePath}'));`;
};

function formatRoutePath(filePath: string, pagesDir: string): string {
  const relativePath = path.relative(pagesDir, filePath);
  return relativePath
    .replace(/\\/g, '/')
    .replace(/\.(tsx|jsx)$/, '')
    .replace(/\/index$/, '')
    .replace(/^index$/, '')
    .replace(/\[\.\.\.([^\]]+)\]/g, '*')
    .replace(/\[([^\]]+)\]/g, ':$1');
}

// --- FUNÇÃO CORRIGIDA PARA USAR A SINTAXE DE ARQUIVO REAL ---
function getPathPriority(pathSegment: string): number {
  if (pathSegment.includes('[...')) return 3; 
  if (pathSegment.includes('[')) return 2;   
  if (pathSegment.startsWith('index.')) return 0;
  return 1;
}

function getNodeSpecificity(node: RouteNode): number {
  let maxPriority = 0;
  for (const page of node.pages.values()) {
    const priority = getPathPriority(path.basename(page.fullPath));
    if (priority > maxPriority) maxPriority = priority;
  }
  for (const child of node.children.values()) {
    const childPriority = getNodeSpecificity(child);
    if (childPriority > maxPriority) maxPriority = childPriority;
  }
  return maxPriority;
}

function generateRoutesFromNode(node: RouteNode, isRoot: boolean): string[] {
    const childNodes = Array.from(node.children.values());
    const pageFiles = Array.from(node.pages.values());

    childNodes.sort((a, b) => {
        const priorityA = getNodeSpecificity(a);
        const priorityB = getNodeSpecificity(b);
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        return b.pathSegment.length - a.pathSegment.length;
    });
    
    const pageRoutes = pageFiles
        .sort((a, b) => {
            const priorityA = getPathPriority(path.basename(a.fullPath));
            const priorityB = getPathPriority(path.basename(b.fullPath));
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            return b.fullPath.length - a.fullPath.length;
        })
        .map(page => {
            const isIndex = path.basename(page.fullPath).startsWith('index.');
            if (isIndex) {
                return `<Route index element={<${page.componentName} />} />`;
            }
            const pagePath = formatRoutePath(path.basename(page.fullPath), '');
            return `<Route path="${pagePath}" element={<${page.componentName} />} />`;
        });

    const childDirRoutes = childNodes.flatMap(child => generateRoutesFromNode(child, false));
    const allChildRoutes = [...pageRoutes, ...childDirRoutes];

    if (node.layout) {
        const pathProp = isRoot ? 'path="/"' : `path="${node.pathSegment}"`;
        return [
        `<Route ${pathProp} element={<${node.layout.componentName} />}>
            ${allChildRoutes.join('\n            ')}
        </Route>`,
        ];
    }

    if (!isRoot && allChildRoutes.length > 0) {
        return [
        `<Route path="${node.pathSegment}">
            ${allChildRoutes.join('\n            ')}
        </Route>`,
        ];
    }
    return allChildRoutes;
}


export async function generateRoutes(options: GeneratorOptions) {
  const { pagesDir, outputFile, importSource } = options;
  console.log('🔄 [react-router-file] Generating routes...');

  const allFiles = await glob('**/*.{tsx,jsx}', {
    cwd: pagesDir,
    absolute: true,
  });

  const imports: string[] = [];
  const rootNode: RouteNode = {
    pathSegment: '/',
    pages: new Map(),
    children: new Map(),
  };
  let componentIndex = 0;

  for (const file of allFiles) {
    const componentName = `Page${componentIndex++}`;
    imports.push(lazyImport(componentName, file, outputFile));

    const routeFile: RouteFile = {
      componentName,
      fullPath: file,
      importStatement: lazyImport(componentName, file, outputFile),
    };

    const isLayout = path.basename(file).startsWith('layout.');
    const dir = path.dirname(file);
    const relativeDir = path.relative(pagesDir, dir);
    const pathSegments = relativeDir.split(path.sep).filter(Boolean);

    let currentNode = rootNode;
    for (const segment of pathSegments) {
        const cleanSegment = formatRoutePath(segment, '');
        if (!currentNode.children.has(cleanSegment)) {
            currentNode.children.set(cleanSegment, {
                pathSegment: cleanSegment,
                pages: new Map(),
                children: new Map(),
            });
        }
        currentNode = currentNode.children.get(cleanSegment)!;
    }

    if (isLayout) {
      currentNode.layout = routeFile;
    } else {
      currentNode.pages.set(file, routeFile);
    }
  }

  const routeElements = generateRoutesFromNode(rootNode, true);

  const outputContent = `
// ATTENTION: This file is automatically generated by react-router-file.
// Do not edit manually.
import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from '${importSource}';

${imports.join('\n')}

const LoadingComponent = () => null;

export const AppRoutes = () => (
  <Suspense fallback={<LoadingComponent />}>
    <Routes>
      ${routeElements.join('\n      ')}
    </Routes>
  </Suspense>
);
  `.trim();

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, outputContent);
  console.log(`✅ [react-router-file] Routes generated successfully!`);
}