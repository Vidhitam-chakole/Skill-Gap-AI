import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function staticCompressionPlugin() {
  return {
    name: 'static-compression',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) return;

      const compressFile = (filePath) => {
        const ext = path.extname(filePath);
        if (['.js', '.css', '.html', '.svg', '.json'].includes(ext)) {
          const content = fs.readFileSync(filePath);
          if (content.length > 512) {
            try {
              // Brotli maximum compression (level 11)
              const br = zlib.brotliCompressSync(content, {
                params: {
                  [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
                },
              });
              fs.writeFileSync(`${filePath}.br`, br);

              // Gzip maximum compression (level 9)
              const gz = zlib.gzipSync(content, { level: 9 });
              fs.writeFileSync(`${filePath}.gz`, gz);
            } catch (err) {
              console.warn('Compression skipped for:', filePath, err.message);
            }
          }
        }
      };

      const walk = (dir) => {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
          } else {
            compressFile(fullPath);
          }
        }
      };

      walk(distDir);
    },
  };
}

export default defineConfig({
  envDir: '../',
  plugins: [
    react(),
    {
      name: 'serve-root-seo-files',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/robots.txt') {
            const robotsPath = path.resolve(__dirname, '../robots.txt');
            if (fs.existsSync(robotsPath)) {
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              return fs.createReadStream(robotsPath).pipe(res);
            }
          }
          if (req.url === '/sitemap.xml') {
            const sitemapPath = path.resolve(__dirname, '../sitemap.xml');
            if (fs.existsSync(sitemapPath)) {
              res.setHeader('Content-Type', 'application/xml; charset=utf-8');
              return fs.createReadStream(sitemapPath).pipe(res);
            }
          }
          if (req.url && req.url.startsWith('/google') && req.url.endsWith('.html')) {
            const fileName = path.basename(req.url);
            const rootGooglePath = path.resolve(__dirname, '..', fileName);
            if (fs.existsSync(rootGooglePath)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              return fs.createReadStream(rootGooglePath).pipe(res);
            }
          }
          next();
        });
      },
    },
    staticCompressionPlugin(),
  ],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            return 'vendor-misc';
          }
        },
      },
    },
  },
  esbuild: {
    legalComments: 'none',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
