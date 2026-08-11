import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'birthday-universe-api' });
});

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getUniverseFilePath = (id) => path.join(DATA_DIR, `${id}.json`);
const safeId = (id) => /^[a-z0-9]{8,64}$/i.test(id);
const passwordHash = (password) => crypto.scryptSync(password, 'birthday-universe', 64).toString('hex');
const publicUniverse = (universe) => {
  const { accessPassword, accessPasswordHash, ...safeUniverse } = universe;
  return { ...safeUniverse, passwordProtected: Boolean(accessPassword || accessPasswordHash) };
};

app.post('/api/universe', (req, res) => {
  const universe = req.body;
  if (!universe || !safeId(universe.id)) {
    return res.status(400).json({ error: 'Invalid universe data. Missing ID.' });
  }

  try {
    const password = typeof universe.accessPassword === 'string' ? universe.accessPassword.trim() : '';
    const storedUniverse = { ...universe, accessPassword: undefined, accessPasswordHash: password ? passwordHash(password) : undefined };
    fs.writeFileSync(getUniverseFilePath(universe.id), JSON.stringify(storedUniverse, null, 2));
    res.json({ success: true, id: universe.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write data on server.' });
  }
});

app.get('/api/universe/:id', (req, res) => {
  const { id } = req.params;
  if (!safeId(id)) return res.status(400).json({ error: 'Invalid universe ID.' });
  const filePath = getUniverseFilePath(id);
  const requestedPassword = req.query.password;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Universe not found.' });
  }

  try {
    const universe = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const validPassword = universe.accessPasswordHash
      ? requestedPassword && crypto.timingSafeEqual(Buffer.from(universe.accessPasswordHash, 'hex'), Buffer.from(passwordHash(requestedPassword), 'hex'))
      : universe.accessPassword && requestedPassword === universe.accessPassword;
    if ((universe.accessPasswordHash || universe.accessPassword) && !validPassword) {
      return res.status(403).json({ error: 'Password required.' });
    }
    res.json(publicUniverse(universe));
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
