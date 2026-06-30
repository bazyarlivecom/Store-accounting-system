const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

const KNOWN_TABLES = `
const KNOWN_TABLES = [
  'users', 'company_profile', 'financial_years', 'person_groups', 'person_roles',
  'accounts', 'cashboxes', 'warehouses', 'product_categories', 'products',
  'transactions', 'invoices', 'accounting_documents', 'checkbooks',
  'warehouse_stocks', 'stocktakings', 'person_follow_ups', 'loans',
  'ledger_accounts', 'installments', 'sms_messages', 'person_opening_balances',
  'persons', 'system_logs', 'database_logs', 'backupConfig'
];
`;

content = content.replace('const DB_CONFIG_FILE = path.join(process.cwd(), \'db_config.json\');', 'const DB_CONFIG_FILE = path.join(process.cwd(), \'db_config.json\');\n' + KNOWN_TABLES);

const newGetDbData = `async function getDbData(key: string) {
  if (usePg && pgClient) {
    if (!KNOWN_TABLES.includes(key)) return null;
    const res = await pgClient.query(\`SELECT data FROM "\${key}"\`);
    if (key === 'company_profile' || key === 'backupConfig') {
      return res.rows.length > 0 ? res.rows[0].data : null;
    }
    return res.rows.map(r => r.data);
  } else {
    const row = db.prepare('SELECT value FROM store WHERE key = ?').get(key) as any;
    return row ? JSON.parse(row.value) : null;
  }
}`;

const newSetDbData = `async function setDbData(key: string, data: any) {
  if (usePg && pgClient) {
    if (!KNOWN_TABLES.includes(key)) return;
    await pgClient.query('BEGIN');
    await pgClient.query(\`TRUNCATE TABLE "\${key}"\`);
    if (key === 'company_profile' || key === 'backupConfig' || !Array.isArray(data)) {
      await pgClient.query(\`INSERT INTO "\${key}" (id, data) VALUES ($1, $2)\`, ['singleton', JSON.stringify(data)]);
    } else {
      for (const item of data) {
         const id = item.id ? String(item.id) : Math.random().toString(36).substring(2, 15);
         await pgClient.query(\`INSERT INTO "\${key}" (id, data) VALUES ($1, $2)\`, [id, JSON.stringify(item)]);
      }
    }
    await pgClient.query('COMMIT');
  } else {
    const value = JSON.stringify(data);
    db.prepare('INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
  }
}`;

const newGetAllDbData = `async function getAllDbData() {
  if (usePg && pgClient) {
    const allData = [];
    for (const key of KNOWN_TABLES) {
       const res = await pgClient.query(\`SELECT data FROM "\${key}"\`);
       if (key === 'company_profile' || key === 'backupConfig') {
         allData.push({ key, value: res.rows.length > 0 ? res.rows[0].data : null });
       } else {
         allData.push({ key, value: res.rows.map(r => r.data) });
       }
    }
    return allData;
  } else {
    return db.prepare('SELECT key, value FROM store').all() as any[];
  }
}`;

content = content.replace(/async function getDbData[\s\S]*?\}\n/, newGetDbData + '\n\n');
content = content.replace(/async function setDbData[\s\S]*?\}\n/, newSetDbData + '\n\n');
content = content.replace(/async function getAllDbData[\s\S]*?\}\n/, newGetAllDbData + '\n\n');

const newInitDB = `async function initDB() {
  try {
    const configRaw = await fsPromises.readFile(DB_CONFIG_FILE, 'utf-8');
    const config = JSON.parse(configRaw);
    if (config.engine === 'postgres' && config.connectionString) {
      pgClient = new Client({ connectionString: config.connectionString });
      await pgClient.connect();
      usePg = true;
      console.log('Connected to PostgreSQL');
    }
  } catch (e) {
    if (process.env.DATABASE_URL) {
      pgClient = new Client({ connectionString: process.env.DATABASE_URL });
      await pgClient.connect();
      usePg = true;
      console.log('Connected to PostgreSQL from env DATABASE_URL');
    }
  }

  db = new DatabaseSync(SQLITE_FILE);
  db.exec(\`
    CREATE TABLE IF NOT EXISTS store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  \`);

  if (usePg && pgClient) {
    for (const key of KNOWN_TABLES) {
      await pgClient.query(\`
        CREATE TABLE IF NOT EXISTS "\${key}" (
          id VARCHAR PRIMARY KEY,
          data JSONB
        )
      \`);
    }
    try {
      const res = await pgClient.query(\`SELECT COUNT(*) as count FROM "users"\`);
      if (parseInt(res.rows[0].count) === 0) {
        console.log('Migrating from SQLite to Postgres...');
        const sqliteRows = db.prepare('SELECT key, value FROM store').all();
        for (const row of sqliteRows) {
          const key = row.key;
          if (KNOWN_TABLES.includes(key)) {
            const data = JSON.parse(row.value);
            if (key === 'company_profile' || key === 'backupConfig' || !Array.isArray(data)) {
               await pgClient.query(\`INSERT INTO "\${key}" (id, data) VALUES ($1, $2) ON CONFLICT(id) DO NOTHING\`, ['singleton', JSON.stringify(data)]);
            } else {
               for (const item of data) {
                  const id = item.id ? String(item.id) : Math.random().toString(36).substring(2, 15);
                  await pgClient.query(\`INSERT INTO "\${key}" (id, data) VALUES ($1, $2) ON CONFLICT(id) DO NOTHING\`, [id, JSON.stringify(item)]);
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
}`;

content = content.replace(/async function initDB[\s\S]*?Migrated JSON DB to SQLite'[\s\S]*?\}[\s\S]*?\}\n/, newInitDB + '\n');

// auth logic replacements
content = content.replace(/const getUsers = \(\) => \{[\s\S]*?return \[\\]; \}\n  \};/, `const getUsers = async () => {
    return (await getDbData('users')) || [];
  };`);
content = content.replace(/const saveUsers = \(users\) => \{[\s\S]*?\}\);\n  \};/, `const saveUsers = async (users) => {
    await setDbData('users', users);
  };`);

content = content.replace(/const users = getUsers\(\);/g, 'const users = await getUsers();');
content = content.replace(/saveUsers\(/g, 'await saveUsers(');
content = content.replace(/app\.post\('\/api\/auth\/refresh', \(req, res\) => \{/g, 'app.post(\'/api/auth/refresh\', async (req, res) => {');

const oldBackupConfig = `let backupConfig = { path: '', intervalHours: 4 };
   try {
      const getStmt = db.prepare('SELECT value FROM store WHERE key = ?');
      const row = getStmt.get('backupConfig');
      if (row && row.value) {
         Object.assign(backupConfig, JSON.parse(row.value));
      }
   } catch(e) {}`;
const newBackupConfig = `let backupConfig = { path: '', intervalHours: 4 };
   try {
      const backupData = await getDbData('backupConfig');
      if (backupData) {
         Object.assign(backupConfig, backupData);
      }
   } catch(e) {}`;
content = content.replace(oldBackupConfig, newBackupConfig);

fs.writeFileSync('server.ts', content);
