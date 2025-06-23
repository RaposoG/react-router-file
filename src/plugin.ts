// src/plugin.ts
import type { Plugin, ResolvedConfig } from 'vite';
import path from 'path';
import { generateRoutes } from './generator.js';

// 👇 1. ADICIONE A NOVA OPÇÃO AQUI
export interface PluginOptions {
  pagesDir?: string;
  outputFile?: string;
  importSource?: string;
}

export function fileRouterPlugin(options: PluginOptions = {}): Plugin {
  let viteConfig: ResolvedConfig;
  let isDev = false;

  const pagesDir = options.pagesDir 
    ? path.resolve(process.cwd(), options.pagesDir) 
    : path.resolve(process.cwd(), 'src/pages');

  const outputFile = options.outputFile
    ? path.resolve(process.cwd(), options.outputFile)
    : path.resolve(process.cwd(), 'src/router.tsx');
  
  // 👇 2. DEFINA UM VALOR PADRÃO PARA A NOVA OPÇÃO
  const importSource = options.importSource || 'react-router-dom';

  return {
    name: 'vite-react-file-router',

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
      isDev = viteConfig.command === 'serve';
    },

    async buildStart() {
      await generateRoutes({ pagesDir, outputFile, importSource });
    },

    configureServer(server) {
      const watcher = server.watcher;
      
      const handleFileChange = async (file: string) => {
        if (file.startsWith(pagesDir)) {
          await generateRoutes({ pagesDir, outputFile, importSource });
        }
      };
      
      watcher.on('add', handleFileChange);
      watcher.on('unlink', handleFileChange);
    },
  };
}