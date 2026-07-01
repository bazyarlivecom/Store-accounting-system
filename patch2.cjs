const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(/let knownCols = tableSchemas\.get\(tableName\);/, `let knownCols = tableSchemas.get(tableName);\n    if (v === undefined) continue;`);

const syncReplace = `            if (v === null) colType = 'TEXT';
            else if (typeof v === 'number') colType = 'DOUBLE PRECISION';`;
content = content.replace(/if \(typeof v === 'number'\) colType = 'DOUBLE PRECISION';/, syncReplace);

// Inside migrate-postgres/start
const migrateStartSearch = `migrationState.logs.push('بررسی و ایجاد جدول‌ها در PostgreSQL...');
        for (const table of KNOWN_TABLES) {
          await client.query(\`
            CREATE TABLE IF NOT EXISTS "\${table}" (id VARCHAR PRIMARY KEY)
          \`);
        }`;
const migrateStartReplace = `migrationState.logs.push('بررسی و ایجاد جدول‌ها در PostgreSQL...');
        tableSchemas.clear();
        for (const table of KNOWN_TABLES) {
          await client.query(\`DROP TABLE IF EXISTS "\${table}" CASCADE\`);
          await client.query(\`CREATE TABLE "\${table}" (id VARCHAR PRIMARY KEY)\`);
        }`;
content = content.replace(migrateStartSearch, migrateStartReplace);

// In case of error in migrate
const catchReplace = `      } catch (err: any) {
        await client.query('ROLLBACK');
        tableSchemas.clear();
        console.error('Migration error', err);
        migrationState.status = 'error';
        migrationState.error = err.message || String(err);
        migrationState.logs.push('خطا در هنگام مهاجرت: ' + migrationState.error);
        migrationState.logs.push('در حال بازگردانی تغییرات (Rollback)...');
      }`;
content = content.replace(/} catch \(err: any\) \{[\s\S]*?migrationState\.logs\.push\('در حال بازگردانی تغییرات \(Rollback\)\.\.\.'\);\s*\}/m, catchReplace);

// Also let's fix initDB migration to DROP tables if it decides to migrate
const initDBMigrateSearch = `      if (parseInt(res.rows[0].count) === 0) {
        console.log('Migrating from SQLite to Postgres...');
        const sqliteRows = db.prepare('SELECT key, value FROM store').all();`;
const initDBMigrateReplace = `      if (parseInt(res.rows[0].count) === 0) {
        console.log('Migrating from SQLite to Postgres...');
        tableSchemas.clear();
        for (const table of KNOWN_TABLES) {
          await pgClient.query(\`DROP TABLE IF EXISTS "\${table}" CASCADE\`);
          await pgClient.query(\`CREATE TABLE "\${table}" (id VARCHAR PRIMARY KEY)\`);
        }
        const sqliteRows = db.prepare('SELECT key, value FROM store').all();`;
content = content.replace(initDBMigrateSearch, initDBMigrateReplace);

fs.writeFileSync('server.ts', content);
