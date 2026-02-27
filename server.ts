
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Proxy
  // This proxies requests from /api-proxy/* to the target backend
  // The target backend URL is determined by the client, but we can provide a default
  // or use an environment variable.
  // For flexibility, we'll look for a header 'x-target-url' or similar, 
  // but a simpler way is to just proxy to a configured base URL.
  
  // Since the user is configuring the base URL in the UI, we need a way to tell the server where to proxy.
  // A common pattern is to send the target URL in a header.
  
  app.use('/api-proxy', (req, res, next) => {
    const targetUrl = req.headers['x-target-base-url'] as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing x-target-base-url header' });
    }

    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      pathRewrite: {
        '^/api-proxy': '', // remove /api-proxy from the path
      },
      on: {
        proxyReq: (proxyReq, req, res) => {
          // You can add additional headers here if needed
        },
        error: (err, req, res) => {
          console.error('Proxy Error:', err);
          if (res && 'status' in res) {
            (res as any).status(500).send('Proxy Error');
          }
        },
      },
      // Important for self-signed certs or local dev
      secure: false,
    })(req, res, next);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
