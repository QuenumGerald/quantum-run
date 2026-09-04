import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        {
          postcssPlugin: 'ignore-openai-module-css-layer-error',
          Once(root) {
            const file = root.source?.input?.file || '';
            if (file.includes('@openai/apps-sdk-ui') && file.endsWith('.module.css')) {
              root.walkAtRules('layer', (atRule) => {
                atRule.replaceWith(...atRule.nodes);
              });
            }
          }
        },
        postcssImport(),
        tailwindcss(),
        autoprefixer()
      ]
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
