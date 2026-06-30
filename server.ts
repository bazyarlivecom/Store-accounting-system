import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';
import fsPromises from 'fs/promises';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Client } from 'pg';
import cookieParser from 'cookie-parser';

const DATA_FILE = path.join(process.cwd(), 'database.json');
const SQLITE_FILE = path.join(process.cwd(), 'database.sqlite');

let db: any;
let pgClient: Client | null = null;
let usePg = false;
const DB_CONFIG_FILE = path.join(process.cwd(), 'db_config.json');

const KNOWN_TABLES = [
  'users', 'company_profile', 'financial_years', 'person_groups', 'person_roles',
  'accounts', 'cashboxes', 'warehouses', 'product_categories', 'products',
  'transactions', 'invoices', 'accounting_documents', 'checkbooks',
  'warehouse_stocks', 'stocktakings', 'person_follow_ups', 'loans',
  'ledger_accounts', 'installments', 'sms_messages', 'person_opening_balances',
  'persons', 'system_logs', 'database_logs', 'backupConfig'
];


const tableSchemas = new Map<string, Set<string>>();
async function syncTableSchema(client: any, tableName: string, dataObj: any) {
    if (!dataObj || typeof dataObj !== 'object') return;
    let knownCols = tableSchemas.get(tableName);
    if (!knownCols) {
        knownCols = new Set();
        try {
            const res = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1', [tableName]);
            for (const row of res.rows) knownCols.add(row.column_name);
        } catch (e) {}
        tableSchemas.set(tableName, knownCols);
    }
    
    for (const [k, v] of Object.entries(dataObj)) {
        if (!knownCols.has(k)) {
            let colType = 'TEXT';
            if (typeof v === 'number') colType = 'DOUBLE PRECISION';
            else if (typeof v === 'boolean') colType = 'BOOLEAN';
            else if (typeof v === 'object') colType = 'JSONB';
            
            try {
               await client.query(`ALTER TABLE "${tableName}" ADD COLUMN "${k}" ${colType}`);
               knownCols.add(k);
            } catch (e) {
               console.error(`Error adding column ${k} to ${tableName}`, e);
            }
        }
    }
}

async function connectPgDb(connectionString: string) {
    try {
        const client = new Client({ connectionString });
        await client.connect();
        return client;
    } catch (e: any) {
        if (e.code === '3D000') { // database does not exist
            const url = new URL(connectionString);
            const dbName = url.pathname.slice(1);
            url.pathname = '/postgres';
            const rootClient = new Client({ connectionString: url.toString() });
            await rootClient.connect();
            await rootClient.query(`CREATE DATABASE "${dbName}"`);
            await rootClient.end();
            
            const newClient = new Client({ connectionString });
            await newClient.connect();
            return newClient;
        }
        throw e;
    }
}


async function getDbData(key: string) {
  if (usePg && pgClient) {
    if (!KNOWN_TABLES.includes(key)) return null;
    const res = await pgClient.query(`SELECT * FROM "${key}"`);
    if (key === 'company_profile' || key === 'backupConfig') {
      return res.rows.length > 0 ? res.rows[0] : null;
    }
    return res.rows;
  } else {
    const row = db.prepare('SELECT value FROM store WHERE key = ?').get(key) as any;
    return row ? JSON.parse(row.value) : null;
  }
}

async function setDbData(key: string, data: any) {
  if (usePg && pgClient) {
    if (!KNOWN_TABLES.includes(key)) return;
    await pgClient.query('BEGIN');
    await pgClient.query(`TRUNCATE TABLE "${key}"`);
    if (key === 'company_profile' || key === 'backupConfig' || !Array.isArray(data)) {
         if (data && typeof data === 'object') {
             data.id = 'singleton';
             await syncTableSchema(pgClient, key, data);
             const keys = Object.keys(data);
             const vals = Object.values(data);
             const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
             const colNames = keys.map(k => `"${k}"`).join(', ');
             await pgClient.query(`INSERT INTO "${key}" (${colNames}) VALUES (${placeholders}) ON CONFLICT(id) DO NOTHING`, vals);
         }
      } else {
         for (const item of data) {
            if (!item.id) item.id = Math.random().toString(36).substring(2, 15);
            await syncTableSchema(pgClient, key, item);
            const keys = Object.keys(item);
            const vals = Object.values(item);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const colNames = keys.map(k => `"${k}"`).join(', ');
            await pgClient.query(`INSERT INTO "${key}" (${colNames}) VALUES (${placeholders}) ON CONFLICT(id) DO NOTHING`, vals);
         }
      }
    await pgClient.query('COMMIT');
  } else {
    const value = JSON.stringify(data);
    db.prepare('INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
  }
}

async function getAllDbData() {
  if (usePg && pgClient) {
    const allData = [];
    for (const key of KNOWN_TABLES) {
       const res = await pgClient.query(`SELECT * FROM "${key}"`);
       if (key === 'company_profile' || key === 'backupConfig') {
         allData.push({ key, value: res.rows.length > 0 ? res.rows[0] : null });
       } else {
         allData.push({ key, value: res.rows });
       }
    }
    return allData;
  } else {
    return db.prepare('SELECT key, value FROM store').all() as any[];
  }
}

async function initDB() {
  try {
    const configRaw = await fsPromises.readFile(DB_CONFIG_FILE, 'utf-8');
    const config = JSON.parse(configRaw);
    if (config.engine === 'postgres' && config.connectionString) {
      pgClient = await connectPgDb(config.connectionString);
      usePg = true;
      console.log('Connected to PostgreSQL');
    }
  } catch (e) {
    if (process.env.DATABASE_URL) {
      pgClient = await connectPgDb(process.env.DATABASE_URL);
      usePg = true;
      console.log('Connected to PostgreSQL from env DATABASE_URL');
    }
  }

  db = new DatabaseSync(SQLITE_FILE);
  db.exec(`
    CREATE TABLE IF NOT EXISTS store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  if (usePg && pgClient) {
    for (const key of KNOWN_TABLES) {
      await pgClient.query(`
        CREATE TABLE IF NOT EXISTS "${key}" (id VARCHAR PRIMARY KEY)
      `);
    }
    try {
      const res = await pgClient.query(`SELECT COUNT(*) as count FROM "users"`);
      if (parseInt(res.rows[0].count) === 0) {
        console.log('Migrating from SQLite to Postgres...');
        const sqliteRows = db.prepare('SELECT key, value FROM store').all();
        for (const row of sqliteRows) {
          const key = row.key;
          if (KNOWN_TABLES.includes(key)) {
            const data = JSON.parse(row.value);
            if (key === 'company_profile' || key === 'backupConfig' || !Array.isArray(data)) {
               if (data && typeof data === 'object') {
                  data.id = 'singleton';
                  await syncTableSchema(pgClient, key, data);
                  const keys = Object.keys(data);
                  const vals = Object.values(data);
                  const placeholders = keys.map((_, i) => `${i + 1}`).join(', ');
                  const colNames = keys.map(k => `"${k}"`).join(', ');
                  await pgClient.query(`INSERT INTO "${key}" (${colNames}) VALUES (${placeholders}) ON CONFLICT(id) DO NOTHING`, vals);
               }
            } else {
               for (const item of data) {
                  if (!item.id) item.id = Math.random().toString(36).substring(2, 15);
                  await syncTableSchema(pgClient, key, item);
                  const keys = Object.keys(item);
                  const vals = Object.values(item);
                  const placeholders = keys.map((_, i) => `${i + 1}`).join(', ');
                  const colNames = keys.map(k => `"${k}"`).join(', ');
                  await pgClient.query(`INSERT INTO "${key}" (${colNames}) VALUES (${placeholders}) ON CONFLICT(id) DO NOTHING`, vals);
               }
            }
          }
        }
        console.log('Migration to Postgres complete');
      }
    } catch(e) { console.error('Migration error', e); }
  } else {
    try {
      const raw = await fsPromises.readFile(DATA_FILE, 'utf-8');
      const legacyDB = JSON.parse(raw);
      const getStmt = db.prepare('SELECT key FROM store WHERE key = ?');
      const insertStmt = db.prepare('INSERT INTO store (key, value) VALUES (?, ?)');
      for (const [key, value] of Object.entries(legacyDB)) {
        if (!getStmt.get(key)) {
          insertStmt.run(key, JSON.stringify(value));
        }
      }
      await fsPromises.rename(DATA_FILE, DATA_FILE + '.bak');
      console.log('Migrated JSON DB to SQLite');
    } catch (e) {}
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

  const getUsers = async () => {
    return (await getDbData('users')) || [];
  };

  const saveUsers = async (users) => {
    await setDbData('users', users);
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
    const users = await getUsers();
    
    if (users.length === 0 && username === 'admin' && password === '123') {
       const hashed = await bcrypt.hash('123', 10);
       const admin = { id: 'admin-1', username: 'admin', password: hashed, name: 'مدیر کل', role: 'admin', isActive: true, requires2FA: false };
       await saveUsers([admin]);
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
          await saveUsers(users);
       }
    }
    
    if (!isMatch) return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
    
    if (user.requires2FA) {
       const otp = Math.floor(100000 + Math.random() * 900000).toString();
       user.currentOTP = { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 };
       await saveUsers(users);
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
      const users = await getUsers();
      const user = users.find(u => u.username === decoded.username);
      
      if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });
      if (!user.currentOTP || user.currentOTP.code !== otp || user.currentOTP.expiresAt < Date.now()) {
         return res.status(401).json({ error: 'کد ورود نامعتبر است یا منقضی شده است' });
      }
      
      delete user.currentOTP;
      await saveUsers(users);
      
      return finalizeLogin(res, user);
    } catch(err) {
      return res.status(401).json({ error: 'توکن نامعتبر است' });
    }
  });
  
  app.post('/api/auth/refresh', async (req, res) => {
     const token = req.cookies.refreshToken;
     if (!token) return res.status(401).json({ error: 'نیازمند ورود مجدد' });
     
     try {
       const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
       const users = await getUsers();
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
     const backupData = await getDbData('backupConfig');
     if (backupData) {
        Object.assign(backupConfig, backupData);
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
        const rows = await getAllDbData();
        const backupData = {};
        for (const row of rows) {
          backupData[row.key] = row.value;
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

  app.post('/api/db/backup-config', async (req, res) => {
     backupConfig = { ...backupConfig, ...req.body };
     await setDbData('backupConfig', backupConfig);
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
    const { limit, offset } = req.query;
    try {
      let data = await getDbData(key);
      
      // Pagination for large collections
      if (Array.isArray(data) && ['invoices', 'transactions', 'system_logs'].includes(key)) {
        if (limit) {
          const limitNum = parseInt(limit as string, 10);
          const offsetNum = parseInt(offset as string, 10) || 0;
          
          // Sort by createdAt descending (if available) or reverse array
          data = data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          data = data.slice(offsetNum, offsetNum + limitNum);
        }
      }
      
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/data/batch', async (req, res) => {
    const { operations } = req.body;
    if (!Array.isArray(operations)) {
      return res.status(400).json({ error: 'Expected operations array' });
    }
    
    try {
      // Group operations by key
      const keys = new Set(operations.map((op: any) => op.key));
      const results: any[] = [];
      const sysLogs = (await getDbData('system_logs')) || [];
      const timestamp = Date.now();
      
      for (const key of Array.from(keys)) {
         let data = (await getDbData(key)) || [];
         if (!Array.isArray(data)) continue;
         
         const keyOps = operations.filter((op: any) => op.key === key);
         for (const op of keyOps) {
            if (op.type === 'append') {
               data.push(op.data);
               results.push({ id: op.data.id, status: 'appended' });
               sysLogs.push({ id: Math.random().toString(36).substring(2, 15), action: 'CREATE', userId: 'system', details: 'ایجاد رکورد گروهی', entityType: key, entityId: op.data.id, timestamp });
            } else if (op.type === 'update') {
               const idx = data.findIndex((x: any) => String(x.id) === String(op.id));
               if (idx !== -1) {
                  data[idx] = { ...data[idx], ...op.data };
                  results.push({ id: op.id, status: 'updated' });
                  sysLogs.push({ id: Math.random().toString(36).substring(2, 15), action: 'UPDATE', userId: 'system', details: 'ویرایش رکورد گروهی', entityType: key, entityId: op.id, timestamp });
               }
            } else if (op.type === 'delete') {
               const idx = data.findIndex((x: any) => String(x.id) === String(op.id));
               if (idx !== -1) {
                  data[idx].isDeleted = true;
                  results.push({ id: op.id, status: 'deleted' });
                  sysLogs.push({ id: Math.random().toString(36).substring(2, 15), action: 'DELETE', userId: 'system', details: 'حذف رکورد گروهی', entityType: key, entityId: op.id, timestamp });
               }
            }
         }
         await setDbData(key, data);
      }
      
      await setDbData('system_logs', sysLogs);
      res.json({ success: true, results });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/data/:key/append', async (req, res) => {
    const { key } = req.params;
    const newItem = req.body;
    try {
      const data = (await getDbData(key)) || [];
      if (Array.isArray(data)) {
        data.push(newItem);
        await setDbData(key, data);
        
        // Log creation
        const sysLogs = (await getDbData('system_logs')) || [];
        const timestamp = Date.now();
        sysLogs.push({ id: Math.random().toString(36).substring(2, 15), action: 'CREATE', userId: 'system', details: 'ایجاد رکورد جدید', entityType: key, entityId: newItem.id, changes: JSON.stringify(newItem), timestamp });
        await setDbData('system_logs', sysLogs);

        res.json({ success: true, data: newItem });
      } else {
        res.status(400).json({ error: 'Target is not an array' });
      }
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/data/:key/:id', async (req, res) => {
    const { key, id } = req.params;
    const updatedItem = req.body;
    try {
      const data = (await getDbData(key)) || [];
      if (Array.isArray(data)) {
        const index = data.findIndex((x: any) => String(x.id) === String(id));
        if (index !== -1) {
          const oldItem = data[index];
          data[index] = { ...oldItem, ...updatedItem };
          await setDbData(key, data);
          
          // Log update
          const sysLogs = (await getDbData('system_logs')) || [];
          const timestamp = Date.now();
          sysLogs.push({ id: Math.random().toString(36).substring(2, 15), action: 'UPDATE', userId: 'system', details: 'ویرایش رکورد', entityType: key, entityId: id, changes: JSON.stringify(updatedItem), timestamp });
          await setDbData('system_logs', sysLogs);

          res.json({ success: true, data: data[index] });
        } else {
          res.status(404).json({ error: 'Not found' });
        }
      } else {
        res.status(400).json({ error: 'Target is not an array' });
      }
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/data/:key', async (req, res) => {
    const { key } = req.params;
    const data = req.body;

    // Do not log changes to system_logs themselves
    if (key !== 'system_logs' && Array.isArray(data)) {
      try {
         const oldData = (await getDbData(key)) || [];

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
                 const decoded = jwt.verify(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-2024') as any;
                 if (decoded && decoded.username) userId = decoded.username;
               } catch(e) {}
            } else if (req.headers.authorization) {
               try {
                 const token = req.headers.authorization.split(' ')[1];
                 const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key-2024') as any;
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
                  const changes: any = {};
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
               const sysLogs = (await getDbData('system_logs')) || [];
               sysLogs.push(...logs);
               await setDbData('system_logs', sysLogs);
            }
         }
      } catch(err) {
         console.error('Audit log error:', err);
      }
    }

    try {
      await setDbData(key, data);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/db/recalculate-stocks', async (req, res) => {
    try {
      const products = (await getDbData('products')) || [];
      const invoices = (await getDbData('invoices')) || [];
      const warehouses = (await getDbData('warehouses')) || [];

      const stocksMap: Record<string, any> = {};

      products.forEach((p: any) => {
        if (p.type === 'service') return;
        const baseStock = Number(p.stock) || 0;
        const defaultWhId = (p.warehouseId || (warehouses[0]?.id) || 'unknown').toString();
        const key = `${p.id}_${defaultWhId}`;
        
        if (!stocksMap[key]) {
          stocksMap[key] = { productId: p.id, warehouseId: defaultWhId, physicalStock: 0, reservedStock: 0, availableStock: 0 };
        }
        stocksMap[key].physicalStock += baseStock;
      });

      const saleQtysMap: Record<string, number> = {};
      const remittedSaleQtysMap: Record<string, number> = {};

      invoices.forEach((inv: any) => {
        if (inv.isDraft || inv.status === 'draft' || inv.status === 'voided') return;
        if (!inv.items || !Array.isArray(inv.items)) return;
        inv.items.forEach((i: any) => {
          const prodId = i.productId;
          if (!prodId) return;
          const product = products.find((p: any) => p.id?.toString() === prodId.toString());
          if (!product || product.type === 'service') return;

          let q = Number(i.quantity) || 0;
          if (i.isSecondaryUnit && product.unitRatio) q = q * Number(product.unitRatio);

          const defaultWhId = (product.warehouseId || (warehouses[0]?.id) || 'unknown').toString();
          const whId = (i.warehouseId || inv.warehouseId || defaultWhId).toString();
          const key = `${prodId}_${whId}`;

          if (!stocksMap[key]) stocksMap[key] = { productId: prodId, warehouseId: whId, physicalStock: 0, reservedStock: 0, availableStock: 0 };

          if (inv.type === 'warehouse_receipt') {
            stocksMap[key].physicalStock += q;
          } else if (inv.type === 'warehouse_remittance') {
            stocksMap[key].physicalStock -= q;
            if (inv.sourceInvoiceId) {
              const sourceInv = invoices.find((sinv: any) => sinv.id?.toString() === inv.sourceInvoiceId?.toString());
              if (sourceInv && sourceInv.type === 'sale') remittedSaleQtysMap[key] = (remittedSaleQtysMap[key] || 0) + q;
            } else {
              remittedSaleQtysMap[key] = (remittedSaleQtysMap[key] || 0) + q;
            }
          } else if (inv.type === 'sale') {
            saleQtysMap[key] = (saleQtysMap[key] || 0) + q;
          }
        });
      });

      const productGlobalSales: Record<string, number> = {};
      const productGlobalRemitted: Record<string, number> = {};
      
      Object.keys(saleQtysMap).forEach(key => {
        const prodId = key.split('_')[0];
        productGlobalSales[prodId] = (productGlobalSales[prodId] || 0) + saleQtysMap[key];
      });
      Object.keys(remittedSaleQtysMap).forEach(key => {
        const prodId = key.split('_')[0];
        productGlobalRemitted[prodId] = (productGlobalRemitted[prodId] || 0) + remittedSaleQtysMap[key];
      });
      
      Object.keys(productGlobalSales).forEach(prodId => {
        const unremitted = Math.max(0, (productGlobalSales[prodId] || 0) - (productGlobalRemitted[prodId] || 0));
        if (unremitted > 0) {
          const product = products.find((p: any) => p.id.toString() === prodId.toString());
          const defaultWhId = (product?.warehouseId || (warehouses[0]?.id) || 'unknown').toString();
          const key = `${prodId}_${defaultWhId}`;
          if (!stocksMap[key]) stocksMap[key] = { productId: prodId, warehouseId: defaultWhId, physicalStock: 0, reservedStock: 0, availableStock: 0 };
          stocksMap[key].reservedStock += unremitted;
        }
      });

      const finalStocksList: any[] = Object.keys(stocksMap).map(key => {
        const item = stocksMap[key];
        return {
          id: key,
          productId: item.productId,
          warehouseId: item.warehouseId,
          physicalStock: item.physicalStock,
          reservedStock: item.reservedStock,
          availableStock: item.physicalStock - item.reservedStock,
          lastUpdated: Date.now()
        };
      });

      await setDbData('warehouse_stocks', finalStocksList);
      res.json({ success: true, data: finalStocksList });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/db/stats', async (req, res) => {
    try {
      let totalSize = 0;
      try {
        if (!usePg) {
           const stats = await fsPromises.stat(SQLITE_FILE);
           totalSize = stats.size;
        } else {
           // mock size for PG or fetch from pg_database size
           const res = await pgClient.query('SELECT pg_database_size(current_database()) as size');
           if (res.rows.length > 0) totalSize = parseInt(res.rows[0].size, 10);
        }
      } catch(e) {}
      
      const rows = await getAllDbData();
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
      const rows = await getAllDbData();
      const backupData: any = {};
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
      for (const [key, value] of Object.entries(parsed)) {
        await setDbData(key, value);
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

  app.post('/api/db/execute', async (req, res) => {
    const { query, params } = req.body;
    try {
      if (usePg && pgClient) {
         const isSelect = query.trim().toUpperCase().startsWith('SELECT');
         const result = await pgClient.query(query, params || []);
         if (isSelect) {
           res.json({ results: result.rows });
         } else {
           res.json({ info: { changes: result.rowCount } });
         }
      } else {
        const isSelect = query.trim().toUpperCase().startsWith('SELECT');
        const stmt = db.prepare(query);
        if (isSelect) {
          const results = stmt.all(...(params || []));
          res.json({ results });
        } else {
          const info = stmt.run(...(params || []));
          res.json({ info });
        }
      }
    } catch (err: any) {
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

  let migrationState = {
    status: 'idle',
    progress: 0,
    total: 0,
    logs: [] as string[],
    error: null as string | null
  };

  app.post('/api/migrate-postgres/validate', async (req, res) => {
    const { connectionString } = req.body;
    try {
      const client = await connectPgDb(connectionString);
      await client.query('SELECT NOW()');
      await client.end();
      res.json({ success: true, message: 'اتصال با موفقیت برقرار شد.' });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/migrate-postgres/start', async (req, res) => {
    const { connectionString } = req.body;
    if (migrationState.status === 'migrating') {
      return res.status(400).json({ error: 'مهاجرت در حال انجام است.' });
    }
    
    migrationState = { status: 'migrating', progress: 0, total: 0, logs: ['در حال اتصال به PostgreSQL...'], error: null };
    res.json({ success: true });
    
    (async () => {
      const client = new Client({ connectionString });
      try {
        await client.connect();
        migrationState.logs.push('اتصال به PostgreSQL با موفقیت انجام شد.');
        
        migrationState.logs.push('در حال خواندن داده‌ها از SQLite...');
        const stmt = db.prepare('SELECT key, value FROM store');
        const allRows = stmt.all();
        migrationState.total = allRows.length;
        migrationState.logs.push(`تعداد ${migrationState.total} جدول/مجموعه داده در SQLite یافت شد.`);
        
        migrationState.logs.push('بررسی و ایجاد جدول‌ها در PostgreSQL...');
        for (const table of KNOWN_TABLES) {
          await client.query(`
            CREATE TABLE IF NOT EXISTS "${table}" (id VARCHAR PRIMARY KEY)
          `);
        }
        
        migrationState.logs.push('شروع Transaction برای اطمینان از صحت داده‌ها...');
        await client.query('BEGIN');
        
        let count = 0;
        for (const row of allRows) {
          if (!KNOWN_TABLES.includes(row.key)) continue;
          migrationState.logs.push(`در حال انتقال داده‌های مربوط به: ${row.key}...`);
          
          const key = row.key;
          const data = JSON.parse(row.value);
          
          if (key === 'company_profile' || key === 'backupConfig' || !Array.isArray(data)) {
             if (data && typeof data === 'object') {
                 data.id = 'singleton';
                 await syncTableSchema(client, key, data);
                 const keys = Object.keys(data);
                 const vals = Object.values(data);
                 const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                 const colNames = keys.map(k => `"${k}"`).join(', ');
                 await client.query(`INSERT INTO "${key}" (${colNames}) VALUES (${placeholders}) ON CONFLICT(id) DO NOTHING`, vals);
             }
          } else {
             for (const item of data) {
                if (!item.id) item.id = Math.random().toString(36).substring(2, 15);
                await syncTableSchema(client, key, item);
                const keys = Object.keys(item);
                const vals = Object.values(item);
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                const colNames = keys.map(k => `"${k}"`).join(', ');
                await client.query(`INSERT INTO "${key}" (${colNames}) VALUES (${placeholders}) ON CONFLICT(id) DO NOTHING`, vals);
             }
          }
          
          count++;
          migrationState.progress = count;
          // Small delay for UI demonstration of progress
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        migrationState.logs.push('پایان تراکنش و ثبت دائمی اطلاعات (Commit)...');
        await client.query('COMMIT');
        
        migrationState.logs.push('به‌روزرسانی تنظیمات سیستم برای استفاده از PostgreSQL...');
        const config = { engine: 'postgres', connectionString };
        await fsPromises.writeFile(DB_CONFIG_FILE, JSON.stringify(config, null, 2));
        
        // Switch live runtime to PostgreSQL
        if (pgClient) {
           try { await pgClient.end(); } catch(e){}
        }
        pgClient = new Client({ connectionString });
        await pgClient.connect();
        usePg = true;
        
        migrationState.logs.push('مهاجرت اطلاعات با موفقیت به پایان رسید.');
        migrationState.status = 'success';
        
      } catch (err) {
        migrationState.logs.push(`خطا در هنگام مهاجرت: ${err.message}`);
        migrationState.logs.push('در حال بازگردانی تغییرات (Rollback)...');
        try { await client.query('ROLLBACK'); } catch(e){}
        migrationState.status = 'error';
        migrationState.error = err.message;
      } finally {
        try { await client.end(); } catch(e){}
      }
    })();
  });

  app.get('/api/migrate-postgres/status', (req, res) => {
    res.json(migrationState);
  });

  app.post('/api/migrate-postgres/reset', (req, res) => {
    migrationState = { status: 'idle', progress: 0, total: 0, logs: [], error: null };
    res.json({ success: true });
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
