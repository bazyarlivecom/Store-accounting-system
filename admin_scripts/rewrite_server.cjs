const fs = require('fs');

const serverCode = `import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';
import fsPromises from 'fs/promises';
import { DatabaseSync } from 'node:sqlite';

const DATA_FILE = path.join(process.cwd(), 'database.json');
const SQLITE_FILE = path.join(process.cwd(), 'database.sqlite');

let db: DatabaseSync;

async function initDB() {
  db = new DatabaseSync(SQLITE_FILE);
  db.exec(\`
    CREATE TABLE IF NOT EXISTS store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  \`);

  // Migrate JSON to SQLite if exists
  try {
    const raw = await fsPromises.readFile(DATA_FILE, 'utf-8');
    const legacyDB = JSON.parse(raw);
    const getStmt = db.prepare('SELECT key FROM store WHERE key = ?');
    const insertStmt = db.prepare('INSERT INTO store (key, value) VALUES (?, ?)');
    
    for (const [key, value] of Object.entries(legacyDB)) {
      const existing = getStmt.get(key);
      if (!existing) {
        insertStmt.run(key, JSON.stringify(value));
      }
    }
    // Rename old file so we don't migrate again
    await fsPromises.rename(DATA_FILE, DATA_FILE + '.bak');
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
      const getStmt = db.prepare('SELECT value FROM store WHERE key = ?');
      const row = getStmt.get(key) as { value: string } | undefined;
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
      const insertOrUpdate = db.prepare('INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      insertOrUpdate.run(key, JSON.stringify(data));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/db/stats', async (req, res) => {
    try {
      let totalSize = 0;
      try {
        const stats = await fsPromises.stat(SQLITE_FILE);
        totalSize = stats.size;
      } catch(e) {}
      
      const rowsStmt = db.prepare('SELECT key, value FROM store');
      const rows = rowsStmt.all() as { key: string, value: string }[];
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
      const rowsStmt = db.prepare('SELECT key, value FROM store');
      const rows = rowsStmt.all() as { key: string, value: string }[];
      const backupData: any = {};
      for (const row of rows) {
        backupData[row.key] = JSON.parse(row.value);
      }
      
      const fileName = \`backup-\${Date.now()}.json\`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', \`attachment; filename=\${fileName}\`);
      res.send(JSON.stringify(backupData, null, 2));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/db/restore', async (req, res) => {
    try {
      const parsed = req.body;
      const insertOrUpdate = db.prepare('INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      for (const [key, value] of Object.entries(parsed)) {
        insertOrUpdate.run(key, JSON.stringify(value));
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
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer();
`

fs.writeFileSync('server.ts', serverCode);
