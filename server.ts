import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase, getDBStatus } from './server/db.ts';
import studentsRouter from './server/routes/students.ts';
import ordersRouter from './server/routes/orders.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 1. Database Connection Initialization
  await connectToDatabase();

  // 2. Middlewares
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json());

  // 3. Health & Database Status Endpoint
  app.get('/api/db-status', (_, res) => {
    const status = getDBStatus();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      ...status,
    });
  });

  // 4. API Routes
  app.use('/api/students', studentsRouter);
  app.use('/api/orders', ordersRouter);
  // Also alias /api/admin/orders to orders router for clean administrative requests
  app.use('/api/admin/orders', (req, res, next) => {
    // Rewrites /api/admin/orders to /api/orders/admin/all or /api/orders/admin/:id/status
    if (req.url === '' || req.url === '/') {
      req.url = '/admin/all';
    } else if (req.url.endsWith('/status')) {
      req.url = `/admin${req.url}`;
    }
    ordersRouter(req, res, next);
  });

  // 5. Vite Middleware or Production Static Serving
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // 6. Start listening on Port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [NutriCampus Full-Stack] Server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 [NutriCampus API] Student endpoints active at http://0.0.0.0:${PORT}/api/students`);
    console.log(`🔌 [NutriCampus MongoDB] Status available at http://0.0.0.0:${PORT}/api/db-status`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
