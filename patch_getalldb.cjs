const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const lines = content.split('\n');
const start = lines.findIndex(l => l.startsWith('async function getAllDbData'));
const end = lines.findIndex(l => l.startsWith('// Initialization')); // or something else... Let's find the next top level function

const nextFunc = lines.findIndex((l, i) => i > start && l.startsWith('async function initDB'));

const newGetAllDbData = `async function getAllDbData() {
  if (usePg && pgClient) {
    const allData = [];
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

    for (const key of KNOWN_TABLES) {
       const res = await pgClient.query(\`SELECT * FROM "\${key}"\`);
       if (key === 'company_profile' || key === 'backupConfig') {
         allData.push({ key, value: res.rows.length > 0 ? parseJSONFields(res.rows[0]) : null });
       } else {
         allData.push({ key, value: res.rows.map(parseJSONFields) });
       }
    }
    return allData;
  } else {
    const rows = db.prepare('SELECT key, value FROM store').all();
    return rows.map((r: any) => ({ key: r.key, value: JSON.parse(r.value) }));
  }
}
`;

lines.splice(start, nextFunc - start, newGetAllDbData);
fs.writeFileSync('server.ts', lines.join('\n'));
