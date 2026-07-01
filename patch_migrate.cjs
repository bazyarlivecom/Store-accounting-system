const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const newEndpoints = `
  app.get('/api/migrate-postgres/tables', (req, res) => {
    try {
      const stmt = db.prepare('SELECT key FROM store');
      const allRows = stmt.all();
      const tables = allRows.map(r => r.key).filter(k => KNOWN_TABLES.includes(k));
      res.json({ success: true, tables });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/migrate-postgres/table/:table', async (req, res) => {
    const { table } = req.params;
    const { connectionString } = req.body;
    
    if (!KNOWN_TABLES.includes(table)) {
        return res.status(400).json({ error: 'جدول نامعتبر است' });
    }

    try {
      const client = new Client({ connectionString });
      await client.connect();

      const stmt = db.prepare('SELECT value FROM store WHERE key = ?');
      const row = stmt.get(table);
      if (!row) {
         await client.end();
         return res.status(404).json({ error: 'داده‌ای برای این جدول یافت نشد' });
      }

      await client.query(\`DROP TABLE IF EXISTS "\${table}" CASCADE\`);
      await client.query(\`CREATE TABLE "\${table}" (id VARCHAR PRIMARY KEY)\`);
      
      const data = JSON.parse(row.value);
      
      await client.query('BEGIN');
      let migratedCount = 0;
      tableSchemas.clear();

      if (table === 'company_profile' || table === 'backupConfig' || !Array.isArray(data)) {
          if (data && typeof data === 'object') {
              data.id = 'singleton';
              await syncTableSchema(client, table, data);
              const keys = Object.keys(data);
              const vals = Object.values(data);
              const placeholders = keys.map((_, i) => \`$\${i + 1}\`).join(', ');
              const colNames = keys.map(k => \`"\${k}"\`).join(', ');
              await client.query(\`INSERT INTO "\${table}" (\${colNames}) VALUES (\${placeholders}) ON CONFLICT(id) DO NOTHING\`, vals);
              migratedCount = 1;
          }
      } else {
          for (const item of data) {
              if (!item.id) item.id = Math.random().toString(36).substring(2, 15);
              await syncTableSchema(client, table, item);
              const keys = Object.keys(item);
              const vals = Object.values(item);
              const placeholders = keys.map((_, i) => \`$\${i + 1}\`).join(', ');
              const colNames = keys.map(k => \`"\${k}"\`).join(', ');
              await client.query(\`INSERT INTO "\${table}" (\${colNames}) VALUES (\${placeholders}) ON CONFLICT(id) DO NOTHING\`, vals);
              migratedCount++;
          }
      }

      await client.query('COMMIT');
      await client.end();
      res.json({ success: true, count: migratedCount });
    } catch (e) {
      console.error(\`Error migrating table \${table}:\`, e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });
`;

content = content.replace(/app\.post\('\/api\/migrate-postgres\/start'[\s\S]*?app\.get\('\/api\/migrate-postgres\/status'/m, newEndpoints + "\n  app.get('/api/migrate-postgres/status'");

fs.writeFileSync('server.ts', content);
