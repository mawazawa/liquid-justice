import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression for production
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Bundle size visualization
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'LiquidJustice',
      formats: ['es', 'cjs'],
      fileName: (format) => `liquid-justice.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Externalize peer dependencies
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@radix-ui/react-slot',
        '@radix-ui/react-label',
        '@radix-ui/react-separator',
        '@radix-ui/react-tooltip',
        'lucide-react',
        'gsap',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        // Preserve CSS imports
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'liquid-justice.css';
          return assetInfo.name || 'asset';
        },
      },
    },
    sourcemap: true,
    // Ensure CSS is extracted
    cssCodeSplit: false,
  },
});
