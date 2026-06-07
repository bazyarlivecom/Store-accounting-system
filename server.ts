import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';
import fs from 'fs/promises';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const DATA_FILE = path.join(process.cwd(), 'database.json');
const SQLITE_FILE = path.join(process.cwd(), 'database.sqlite');

let db: any;

async function initDB() {
  db = await open({
    filename: SQLITE_FILE,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Migrate JSON to SQLite if exists
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const legacyDB = JSON.parse(raw);
    for (const [key, value] of Object.entries(legacyDB)) {
      const existing = await db.get('SELECT key FROM store WHERE key = ?', key);
      if (!existing) {
        await db.run('INSERT INTO store (key, value) VALUES (?, ?)', key, JSON.stringify(value));
      }
    }
    // Rename old file so we don't migrate again
    await fs.rename(DATA_FILE, DATA_FILE + '.bak');
    console.log('Migrated JSON DB to SQLite');
  } catch (e) {
    // Migration not needed or already done
  }
}

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;
  
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/data/:key', async (req, res) => {
    const { key } = req.params;
    try {
      const row = await db.get('SELECT value FROM store WHERE key = ?', key);
      if (row) {
        res.json(JSON.parse(row.value));
      } else {
        res.json(null);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/data/:key', async (req, res) => {
    const { key } = req.params;
    const data = req.body;
    try {
      await db.run(
        'INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        key,
        JSON.stringify(data)
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/db/stats', async (req, res) => {
    try {
      let totalSize = 0;
      try {
        const stats = await fs.stat(SQLITE_FILE);
        totalSize = stats.size;
      } catch(e) {}
      
      const rows = await db.all('SELECT key, value FROM store');
      const collections: any[] = [];
      
      for (const row of rows) {
        const value = JSON.parse(row.value);
        const sizeBytes = Buffer.byteLength(row.value, 'utf8');
        let recordCount = Array.isArray(value) ? value.length : Object.keys(value as any).length;
        collections.push({ name: row.key, size: sizeBytes, recordCount });
      }
      
      res.json({ totalSize, collections });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/db/backup', async (req, res) => {
    try {
      const rows = await db.all('SELECT key, value FROM store');
      const backupData: any = {};
      for (const row of rows) {
        backupData[row.key] = JSON.parse(row.value);
      }
      
      const fileName = `backup-${Date.now()}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.send(JSON.stringify(backupData, null, 2));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/db/restore', async (req, res) => {
    try {
      const parsed = req.body;
      for (const [key, value] of Object.entries(parsed)) {
        await db.run(
          'INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
          key,
          JSON.stringify(value)
        );
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/system/update', (req, res) => {
    exec('git pull origin main', (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'خطا در دریافت بروزرسانی از گیت‌هاب', error: stderr || error.message });
      }
      res.json({ success: true, message: 'بروزرسانی با موفقیت انجام شد', output: stdout });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static serving for production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
