import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

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
  ],
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