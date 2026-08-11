export interface BirthdayUniverse {
  id: string;
  name: string;
  nickname: string;
  age: string;
  message: string;
  thankYou: string;
  language: string;
  photos: {
    id: string;
    dataUrl: string;
    caption: string;
    date: string;
    memory: string;
  }[];
  videoDataUrl: string; // Featured video uploaded
  musicDataUrl: string; // Background music
  musicLoop: boolean;
  musicVolume: number;
  voiceDataUrl: string; // Voice message
  theme: string; // theme name
  particles: {
    stars: boolean;
    butterflies: boolean;
    balloons: boolean;
    ribbons: boolean;
    petals: boolean;
    sparkles: boolean;
    confetti: boolean;
    fireworks: boolean;
    particles: boolean; // glowing particles
    magicCursor: boolean;
  };
  cake: {
    design: string;
    candleColor: string;
    candleCount: number;
    message: string;
    customTier1Color?: string;
    customTier2Color?: string;
  };
  generatedVideoUrl: string; // Data URL of the generated slideshow MP4
  accessPassword?: string;
  passwordProtected?: boolean;
  animationPreset?: string;
  textStyle?: {
    fontFamily: string;
    titleSize: number;
    bodySize: number;
  };
  contactPhone?: string;
  contactMessage?: string;
  createdAt: number;
}

const DB_NAME = 'BirthdayUniverseDB';
const DB_VERSION = 1;
const STORE_NAME = 'universes';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveUniverse(universe: BirthdayUniverse): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(universe);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getUniverse(id: string): Promise<BirthdayUniverse | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getAllUniverses(): Promise<BirthdayUniverse[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteUniverse(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
