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
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getUniverseFilePath = (id) => path.join(DATA_DIR, `${id}.json`);

app.post('/api/universe', (req, res) => {
  const universe = req.body;
  if (!universe || !universe.id) {
    return res.status(400).json({ error: 'Invalid universe data. Missing ID.' });
  }

  try {
    fs.writeFileSync(getUniverseFilePath(universe.id), JSON.stringify(universe, null, 2));
    res.json({ success: true, id: universe.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write data on server.' });
  }
});

app.get('/api/universe/:id', (req, res) => {
  const { id } = req.params;
  const filePath = getUniverseFilePath(id);
  const requestedPassword = req.query.password;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Universe not found.' });
  }

  try {
    const universe = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (universe.accessPassword && requestedPassword !== universe.accessPassword) {
      return res.status(403).json({ error: 'Password required.' });
    }
    res.json(universe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data on server.' });
  }
});

const distPath = path.join(__dirname, 'dist');
const indexFilePath = path.join(distPath, 'index.html');
if (fs.existsSync(distPath) && fs.existsSync(indexFilePath)) {
  app.get('/universe/:id', (req, res) => {
    res.type('html').send(fs.readFileSync(indexFilePath, 'utf8'));
  });

  app.get('/universe/:id/', (req, res) => {
    res.type('html').send(fs.readFileSync(indexFilePath, 'utf8'));
  });

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.type('html').send(fs.readFileSync(indexFilePath, 'utf8'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
