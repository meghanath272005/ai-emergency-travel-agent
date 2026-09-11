import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRequest } from './src/apiRouter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API Middleware
app.use(async (req, res, next) => {
  if (req.url && req.url.startsWith('/api/')) {
    try {
      const handled = await handleApiRequest(req, res);
      if (handled) return;
    } catch (e) {
      console.error('Server API error:', e);
    }
  }
  next();
});

// Static assets from dist
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mission-Critical Neural Transit server online at port ${PORT}`);
});
