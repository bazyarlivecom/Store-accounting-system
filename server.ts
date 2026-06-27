import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';
import fsPromises from 'fs/promises';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const DATA_FILE = path.join(process.cwd(), 'database.json');
const SQLITE_FILE = path.join(process.cwd(), 'database.sqlite');

let db;

async function initDB() {
  db = new DatabaseSync(SQLITE_FILE);
  db.exec(`
    CREATE TABLE IF NOT EXISTS store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

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
    await fsPromises.rename(DATA_FILE, DATA_FILE + '.bak');
    console.log('Migrated JSON DB to SQLite');
  } catch (e) {
  }
}

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;
  
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  // === AUTHENTICATION & USERS === //
  const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-2024';
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-2024';

  const getUsers = () => {
    try {
      const row = db.prepare('SELECT value FROM store WHERE key = ?').get('users');
      return row ? JSON.parse(row.value) : [];
    } catch(e) { return []; }
  };

  const saveUsers = (users) => {
    db.prepare('INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('users', JSON.stringify(users));
  };
  
  // Custom users endpoint intercepting password saves
  app.post('/api/data/users', async (req, res, next) => {
    try {
      const users = req.body;
      if (Array.isArray(users)) {
        for (const user of users) {
          if (user.password && !user.password.startsWith('$2b$')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        }
      }
      req.body = users;
      next();
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    
    if (users.length === 0 && username === 'admin' && password === '123') {
       const hashed = await bcrypt.hash('123', 10);
       const admin = { id: 'admin-1', username: 'admin', password: hashed, name: 'مدیر کل', role: 'admin', isActive: true, requires2FA: false };
       saveUsers([admin]);
       users.push(admin);
    }
    
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
    if (!user.isActive) return res.status(403).json({ error: 'حساب کاربری غیرفعال است.' });
    
    let isMatch = false;
    if (user.password.startsWith('$2b$')) {
       isMatch = await bcrypt.compare(password, user.password);
    } else {
       isMatch = (password === user.password);
       if (isMatch) {
          user.password = await bcrypt.hash(password, 10);
          saveUsers(users);
       }
    }
    
    if (!isMatch) return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
    
    if (user.requires2FA) {
       const otp = Math.floor(100000 + Math.random() * 900000).toString();
       user.currentOTP = { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 };
       saveUsers(users);
       console.log('OTP for ' + username + ' is: ' + otp);
       
       const tempToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '5m' });
       return res.json({ requireOTP: true, tempToken, message: 'کد تایید ورود جهت تست (در کنسول هم چاپ شد): ' + otp }); 
    } else {
       return finalizeLogin(res, user);
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    const { tempToken, otp } = req.body;
    try {
      const decoded = jwt.verify(tempToken, JWT_SECRET);
      const users = getUsers();
      const user = users.find(u => u.username === decoded.username);
      
      if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });
      if (!user.currentOTP || user.currentOTP.code !== otp || user.currentOTP.expiresAt < Date.now()) {
         return res.status(401).json({ error: 'کد ورود نامعتبر است یا منقضی شده است' });
      }
      
      delete user.currentOTP;
      saveUsers(users);
      
      return finalizeLogin(res, user);
    } catch(err) {
      return res.status(401).json({ error: 'توکن نامعتبر است' });
    }
  });
  
  app.post('/api/auth/refresh', (req, res) => {
     const token = req.cookies.refreshToken;
     if (!token) return res.status(401).json({ error: 'نیازمند ورود مجدد' });
     
     try {
       const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
       const users = getUsers();
       const user = users.find(u => u.username === decoded.username);
       if (!user || user.tokenVersion !== decoded.tokenVersion) {
         return res.status(401).json({ error: 'توکن نامعتبر است' });
       }
       
       const accessToken = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
       res.json({ accessToken });
     } catch(e) {
       res.status(401).json({ error: 'توکن نامعتبر است' });
     }
  });
  
  app.post('/api/auth/logout', (req, res) => {
      res.clearCookie('refreshToken');
      res.json({ success: true });
  });
  
  function finalizeLogin(res, user) {
     const tokenVersion = user.tokenVersion || 1;
     const accessToken = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
     const refreshToken = jwt.sign({ username: user.username, tokenVersion }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
     
     res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth/refresh' });
     
     const userWithoutPwd = { ...user };
     delete userWithoutPwd.password;
     delete userWithoutPwd.currentOTP;
     res.json({ accessToken, user: userWithoutPwd });
  }
  // === END AUTHENTICATION === //

  // --- Local Backups Logic (Configurable) ---
  let backupConfig = { path: '', intervalHours: 4 };
  try {
     const getStmt = db.prepare('SELECT value FROM store WHERE key = ?');
     const row = getStmt.get('backupConfig');
     if (row && row.value) {
        Object.assign(backupConfig, JSON.parse(row.value));
     }
  } catch(e) {}

  const getBackupsDir = () => {
     return backupConfig.path && backupConfig.path.trim() !== '' 
        ? backupConfig.path 
        : path.join(process.cwd(), 'backups');
  };

  let backupInterval = null;
  const runBackupJob = async () => {
     try {
        const dir = getBackupsDir();
        await fsPromises.mkdir(dir, { recursive: true });
        const rowsStmt = db.prepare('SELECT key, value FROM store');
        const rows = rowsStmt.all();
        const backupData = {};
        for (const row of rows) {
          backupData[row.key] = JSON.parse(row.value);
        }
        const fileName = `backup-${Date.now()}.json`;
        await fsPromises.writeFile(path.join(dir, fileName), JSON.stringify(backupData));
        
        // keep only last 20 backups
        const files = await fsPromises.readdir(dir);
        const jsonFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json')).sort();
        if (jsonFiles.length > 20) {
           for (let i = 0; i < jsonFiles.length - 20; i++) {
              await fsPromises.unlink(path.join(dir, jsonFiles[i]));
           }
        }
     } catch (err) {
        console.error('Backup job failed', err);
     }
  };

  if (backupConfig.intervalHours > 0) {
     backupInterval = setInterval(runBackupJob, backupConfig.intervalHours * 60 * 60 * 1000);
  }

  app.post('/api/db/backup-config', (req, res) => {
     backupConfig = { ...backupConfig, ...req.body };
     const insertOrUpdate = db.prepare('INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
     insertOrUpdate.run('backupConfig', JSON.stringify(backupConfig));
     if (backupInterval) clearInterval(backupInterval);
     if (backupConfig.intervalHours > 0) {
        backupInterval = setInterval(runBackupJob, backupConfig.intervalHours * 60 * 60 * 1000);
     }
     res.json({ success: true, config: backupConfig });
  });

  app.get('/api/db/backup-config', (req, res) => {
      res.json(backupConfig);
  });

  app.post('/api/db/run-backup', async (req, res) => {
      await runBackupJob();
      res.json({ success: true });
  });

  app.get('/api/db/backups', async (req, res) => {
     try {
        const dir = getBackupsDir();
        await fsPromises.mkdir(dir, { recursive: true });
        const files = await fsPromises.readdir(dir);
        const jsonFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json')).sort((a,b) => b.localeCompare(a));
        const backupsList = [];
        for (const file of jsonFiles) {
           const stat = await fsPromises.stat(path.join(dir, file));
           backupsList.push({ file, size: stat.size, time: stat.mtimeMs });
        }
        res.json(backupsList);
     } catch(e) {
        res.status(500).json({ error: e.message });
     }
  });

  app.delete('/api/db/backups/:filename', async (req, res) => {
      try {
         const { filename } = req.params;
         const dir = getBackupsDir();
         const filePath = path.join(dir, filename);
         if (!filePath.startsWith(dir)) return res.status(403).send('Invalid path');
         await fsPromises.unlink(filePath);
         res.json({ success: true });
      } catch(e) {
         res.status(500).json({ error: e.message });
      }
  });

  app.get('/api/data/:key', async (req, res) => {
    const { key } = req.params;
    try {
      const getStmt = db.prepare('SELECT value FROM store WHERE key = ?');
      const row = getStmt.get(key);
      if (row) {
        res.json(JSON.parse(row.value));
      } else {
        res.json(null);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/data/:key', async (req, res) => {
    const { key } = req.params;
    const data = req.body;

    // Do not log changes to system_logs themselves
    if (key !== 'system_logs' && Array.isArray(data)) {
      try {
         const getStmt = db.prepare('SELECT value FROM store WHERE key = ?');
         const oldRow = getStmt.get(key);
         const oldData = oldRow ? JSON.parse(oldRow.value) : [];

         if (Array.isArray(oldData)) {
            const oldMap = new Map();
            oldData.forEach(item => { if (item && item.id) oldMap.set(String(item.id), item); });

            const newMap = new Map();
            data.forEach(item => { if (item && item.id) newMap.set(String(item.id), item); });

            const logs = [];
            const timestamp = Date.now();
            let userId = 'system';
            
            // Extract token if any
            if (req.cookies && req.cookies.refreshToken) {
               try {
                 const decoded = jwt.verify(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-2024');
                 if (decoded && decoded.username) userId = decoded.username;
               } catch(e) {}
            } else if (req.headers.authorization) {
               try {
                 const token = req.headers.authorization.split(' ')[1];
                 const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key-2024');
                 if (decoded && decoded.username) userId = decoded.username;
               } catch(e) {}
            }

            const generateId = () => Math.random().toString(36).substring(2, 15);

            // Find Added and Updated
            newMap.forEach((newItem, id) => {
               if (!oldMap.has(id)) {
                  logs.push({ id: generateId(), action: 'CREATE', userId, details: 'ایجاد رکورد جدید', entityType: key, entityId: id, changes: JSON.stringify(newItem), timestamp });
               } else {
                  const oldItem = oldMap.get(id);
                  const changes = {};
                  let hasChanges = false;
                  for (const k in newItem) {
                     if (k !== 'updatedAt' && k !== 'createdAt') {
                       if (JSON.stringify(newItem[k]) !== JSON.stringify(oldItem[k])) {
                          changes[k] = { old: oldItem[k], new: newItem[k] };
                          hasChanges = true;
                       }
                     }
                  }
                  if (hasChanges) {
                     logs.push({ id: generateId(), action: 'UPDATE', userId, details: 'ویرایش رکورد', entityType: key, entityId: id, changes: JSON.stringify(changes), timestamp });
                  }
               }
            });

            // Find Deleted
            oldMap.forEach((oldItem, id) => {
               if (!newMap.has(id)) {
                  logs.push({ id: generateId(), action: 'DELETE', userId, details: 'حذف رکورد', entityType: key, entityId: id, changes: JSON.stringify(oldItem), timestamp });
               }
            });

            if (logs.length > 0) {
               const sysLogsRow = getStmt.get('system_logs');
               const sysLogs = sysLogsRow ? JSON.parse(sysLogsRow.value) : [];
               sysLogs.push(...logs);
               const insertOrUpdate = db.prepare('INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
               insertOrUpdate.run('system_logs', JSON.stringify(sysLogs));
            }
         }
      } catch(err) {
         console.error('Audit log error:', err);
      }
    }

    try {
      const insertOrUpdate = db.prepare('INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      insertOrUpdate.run(key, JSON.stringify(data));
      res.json({ success: true });
    } catch (err) {
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
      const rows = rowsStmt.all();
      const collections = [];
      
      for (const row of rows) {
        const value = JSON.parse(row.value);
        const sizeBytes = Buffer.byteLength(row.value, 'utf8');
        let recordCount = Array.isArray(value) ? value.length : Object.keys(value).length;
        collections.push({ name: row.key, size: sizeBytes, recordCount });
      }
      
      res.json({ totalSize, collections });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/db/backup', async (req, res) => {
    try {
      const rowsStmt = db.prepare('SELECT key, value FROM store');
      const rows = rowsStmt.all();
      const backupData = {};
      for (const row of rows) {
        backupData[row.key] = JSON.parse(row.value);
      }
      
      const fileName = `backup-${Date.now()}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.send(JSON.stringify(backupData, null, 2));
    } catch (err) {
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/sys/dirs', async (req, res) => {
    try {
      const target = req.body.path || process.cwd();
      const items = await fsPromises.readdir(target, { withFileTypes: true });
      const dirs = items.filter(i => i.isDirectory()).map(i => i.name);
      const parent = path.dirname(target);
      res.json({ current: target, parent, dirs });
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/sys/drives', async (req, res) => {
    try {
       if (process.platform === 'win32') {
          res.json(['C:\\', 'D:\\', 'E:\\', 'F:\\']);
       } else {
          res.json(['/']);
       }
    } catch (e) {
       res.json(['/']);
    }
  });

  app.post('/api/system/update', (req, res) => {
    const repoUrl = 'https://github.com/bazyarlivecom/Store-accounting-system.git';
    
    const script = `
      if [ ! -d ".git" ]; then
        git init
        git remote add origin ${repoUrl}
      fi
      git fetch --all
      git reset --hard origin/main
      npm run build
    `;

    exec(script, (error, stdout, stderr) => {
      if (error) {
        console.error(`update error: ${error.message}`);
        return res.status(500).json({ error: error.message, details: stderr });
      }
      
      console.log('Update output:', stdout);
      res.json({ success: true, message: 'Update completed successfully. ' + stdout });
      
      setTimeout(() => {
        console.log('Restarting process after update...');
        process.exit(0);
      }, 2000);
    });
  });

  app.post('/api/db/execute', (req, res) => {
    const { query, params } = req.body;
    try {
      const isSelect = query.trim().toUpperCase().startsWith('SELECT');
      const stmt = db.prepare(query);
      if (isSelect) {
        const results = stmt.all(...(params || []));
        res.json({ results });
      } else {
        const info = stmt.run(...(params || []));
        res.json({ info });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/search-products', async (req, res) => {
    const { query, category } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
  
    try {
      const prompt = `Generate a realistic list of 10 fake products related to "${query}"${category ? ` in the category of "${category}"` : ''}. Focus on Persian product names. Return purely a JSON array of objects with keys "name", "description", and "priceStr". No markdown formatting, no backticks, just raw JSON.`;
      
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const text = await response.text();
      let cleanText = text;
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        cleanText = match[0];
      } else {
        cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      
      const products = JSON.parse(cleanText || "[]");
      
      res.json({ products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
