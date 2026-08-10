import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🎉 Starting Birthday Universe API server & Vite dev server...');

// Start Express Server
const server = spawn('node', ['server.js'], { cwd: rootDir, stdio: 'inherit', shell: true });

// Start Vite Client
const client = spawn('npx', ['vite'], { cwd: rootDir, stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit();
});
