import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Set high JSON limit to support large base64 media uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Save birthday universe details
app.post('/api/universe', (req, res) => {
  const universe = req.body;
  if (!universe || !universe.id) {
    return res.status(400).json({ error: 'Invalid universe data. Missing ID.' });
  }

  try {
    const filePath = path.join(DATA_DIR, `${universe.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(universe, null, 2));
    console.log(`Successfully saved universe: ${universe.id}`);
    res.json({ success: true, id: universe.id });
  } catch (error) {
    console.error('Failed to save universe file:', error);
    res.status(500).json({ error: 'Failed to write data on server.' });
  }
});

// Fetch birthday universe details
app.get('/api/universe/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(DATA_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`Universe not found: ${id}`);
    return res.status(404).json({ error: 'Universe not found.' });
  }

  try {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(fileData));
  } catch (error) {
    console.error('Failed to read universe file:', error);
    res.status(500).json({ error: 'Failed to read data on server.' });
  }
});

// Serve Vite frontend production build
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log(`Serving static files from production folder: ${distPath}`);
  app.use(express.static(distPath));

  app.get('/universe/:id', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  // Catch-all route to serve index.html for react routing / hash compatibility
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('Production folder "dist" not found. Running in API-only server mode.');
}

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🎉 Birthday Universe Express Server running!`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`💾 Data stored at: ${DATA_DIR}`);
  console.log(`==================================================`);
});
