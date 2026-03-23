
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
  const apiProxy = createProxyMiddleware({
    target: 'http://localhost', // Default target, overridden by router
    router: (req) => req.headers['x-target-base-url'] as string,
    changeOrigin: true,
    pathRewrite: {
      '^/api-proxy': '', // remove /api-proxy from the path
    },
    on: {
      error: (err, req, res) => {
        try {
          console.error('Proxy Error:', err);
          const errorMessage = err.message || 'Unknown Proxy Error';
          const isTimeout = errorMessage.includes('ETIMEDOUT');
          
          const responseBody = JSON.stringify({ 
            error: 'Proxy Error',
            message: isTimeout 
              ? `连接后端超时 (${req.headers['x-target-base-url']})。请检查后端服务是否启动，或尝试使用公网地址/内网穿透。`
              : errorMessage,
            code: (err as any).code
          });

          if ('headersSent' in res && !res.headersSent) {
            if ('writeHead' in res) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
            }
          }
          res.end(responseBody);
        } catch (e) {
          console.error('Error sending proxy error response:', e);
        }
      },
    },
    // Important for self-signed certs or local dev
    secure: false,
  });

  app.use('/api-proxy', (req, res, next) => {
    const targetUrl = req.headers['x-target-base-url'] as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing x-target-base-url header' });
    }
    apiProxy(req, res, next);
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
