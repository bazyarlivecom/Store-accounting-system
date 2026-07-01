const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// I will just read lines and replace the exact lines between getDbData and setDbData
const lines = content.split('\n');
const start = lines.findIndex(l => l.startsWith('async function getDbData'));
const end = lines.findIndex(l => l.startsWith('async function setDbData'));

const newGetDbData = `async function getDbData(key: string) {
  if (usePg && pgClient) {
    if (!KNOWN_TABLES.includes(key)) return null;
    const res = await pgClient.query(\`SELECT * FROM "\${key}"\`);
    
    const parseJSONFields = (row: any) => {
       if (!row) return row;
       for (const k in row) {
          if (typeof row[k] === 'string' && (row[k].startsWith('{') || row[k].startsWith('['))) {
             try {
                row[k] = JSON.parse(row[k]);
             } catch(e) {}
          }
       }
       return row;
    };

    if (key === 'company_profile' || key === 'backupConfig') {
      return res.rows.length > 0 ? parseJSONFields(res.rows[0]) : null;
    }
    return res.rows.map(parseJSONFields);
  } else {
    const row = db.prepare('SELECT value FROM store WHERE key = ?').get(key) as any;
    return row ? JSON.parse(row.value) : null;
  }
}
`;

lines.splice(start, end - start, newGetDbData);
fs.writeFileSync('server.ts', lines.join('\n'));
