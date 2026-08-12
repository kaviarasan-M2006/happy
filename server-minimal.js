import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const MONGODB_URI = String(process.env.MONGODB_URI || '').trim();
const MONGODB_DB_NAME = String(process.env.MONGODB_DB_NAME || 'birthday_universe').trim();

let mongoClient;
let universeCollectionPromise;

const getUniverseCollection = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured on the backend.');
  }

  if (!universeCollectionPromise) {
    mongoClient = new MongoClient(MONGODB_URI, {
      // Atlas requires TLS. Keep certificate verification enabled.
      tls: true,
      tlsMinVersion: 'TLSv1.2',
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    universeCollectionPromise = mongoClient
      .connect()
      .then((client) => client.db(MONGODB_DB_NAME).collection('universes'))
      .catch((error) => {
        universeCollectionPromise = undefined;
        throw error;
      });
  }

  return universeCollectionPromise;
};

const safeId = (id) => /^[a-z0-9]{8,64}$/i.test(id);
const passwordHash = (password) => crypto.scryptSync(password, 'birthday-universe', 64).toString('hex');

const publicUniverse = (universe) => {
  const { _id, accessPassword, accessPasswordHash, ...safeUniverse } = universe;
  return {
    ...safeUniverse,
    passwordProtected: Boolean(accessPassword || accessPasswordHash),
  };
};

app.get('/api/health', async (_req, res) => {
  try {
    const collection = await getUniverseCollection();
    await collection.databaseName;
    res.json({ ok: true, service: 'birthday-universe-api', database: 'mongodb' });
  } catch (error) {
    console.error('Health check database error:', error?.message || error);
    res.status(503).json({
      ok: false,
      service: 'birthday-universe-api',
      database: 'mongodb',
      error: 'MongoDB is not connected.',
    });
  }
});

app.post('/api/universe', async (req, res) => {
  const universe = req.body;
  if (!universe || !safeId(universe.id)) {
    return res.status(400).json({ error: 'Invalid universe data. Missing ID.' });
  }

  try {
    const password = typeof universe.accessPassword === 'string' ? universe.accessPassword.trim() : '';
    const storedUniverse = {
      ...universe,
      accessPassword: undefined,
      accessPasswordHash: password ? passwordHash(password) : undefined,
      _id: universe.id,
      updatedAt: new Date(),
    };

    const collection = await getUniverseCollection();
    await collection.replaceOne(
      { _id: universe.id },
      storedUniverse,
      { upsert: true },
    );

    res.json({ success: true, id: universe.id });
  } catch (error) {
    console.error('Failed to save universe:', error?.message || error);
    res.status(500).json({
      error: 'Failed to save birthday data to the database.',
    });
  }
});

app.get('/api/universe/:id', async (req, res) => {
  const { id } = req.params;
  if (!safeId(id)) return res.status(400).json({ error: 'Invalid universe ID.' });

  try {
    const collection = await getUniverseCollection();
    const universe = await collection.findOne({ _id: id });
    const requestedPassword = typeof req.query.password === 'string' ? req.query.password : '';

    if (!universe) {
      return res.status(404).json({ error: 'Universe not found.' });
    }

    const validPassword = universe.accessPasswordHash
      ? requestedPassword && crypto.timingSafeEqual(
          Buffer.from(universe.accessPasswordHash, 'hex'),
          Buffer.from(passwordHash(requestedPassword), 'hex'),
        )
      : universe.accessPassword && requestedPassword === universe.accessPassword;

    if ((universe.accessPasswordHash || universe.accessPassword) && !validPassword) {
      return res.status(403).json({ error: 'Password required.' });
    }

    res.json(publicUniverse(universe));
  } catch (error) {
    console.error('Failed to read universe:', error?.message || error);
    res.status(500).json({
      error: 'Failed to read birthday data from the database.',
    });
  }
});

// Optional one-time migration of existing local JSON files into MongoDB.
// This keeps old generated links available when the deployment still contains
// the existing data/ directory. It never changes the frontend API.
const migrateLocalData = async () => {
  const DATA_DIR = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(__dirname, 'data');

  if (String(process.env.MIGRATE_LOCAL_DATA || 'true').toLowerCase() === 'false') return;
  if (!fs.existsSync(DATA_DIR)) return;

  const files = fs.readdirSync(DATA_DIR).filter((name) => name.endsWith('.json'));
  if (!files.length) return;

  try {
    const collection = await getUniverseCollection();
    let migrated = 0;

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
        const universe = JSON.parse(raw);
        if (!universe || !safeId(universe.id)) continue;

        await collection.updateOne(
          { _id: universe.id },
          { $setOnInsert: { ...universe, _id: universe.id, migratedAt: new Date() } },
          { upsert: true },
        );
        migrated += 1;
      } catch (fileError) {
        console.error(`Could not migrate ${file}:`, fileError?.message || fileError);
      }
    }

    console.log(`MongoDB local-data migration complete: ${migrated}/${files.length} file(s) checked.`);
  } catch (error) {
    console.error('MongoDB local-data migration failed:', error?.message || error);
  }
};

const distPath = path.join(__dirname, 'dist');
const indexFilePath = path.join(distPath, 'index.html');
if (fs.existsSync(distPath) && fs.existsSync(indexFilePath)) {
  app.get('/universe/:id', (_req, res) => {
    res.type('html').send(fs.readFileSync(indexFilePath, 'utf8'));
  });

  app.get('/universe/:id/', (_req, res) => {
    res.type('html').send(fs.readFileSync(indexFilePath, 'utf8'));
  });

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.type('html').send(fs.readFileSync(indexFilePath, 'utf8'));
  });
}

app.listen(PORT, async () => {
  console.log(`Server listening on ${PORT}`);

  if (!MONGODB_URI) {
    console.error('WARNING: MONGODB_URI is missing. Add it to the Render environment variables.');
    return;
  }

  try {
    await getUniverseCollection();
    console.log(`MongoDB connected. Database: ${MONGODB_DB_NAME}`);
    await migrateLocalData();
  } catch (error) {
    console.error('MongoDB connection failed:', error?.message || error);
  }
});
