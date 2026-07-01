const DatabaseSync = require('node:sqlite').DatabaseSync;
const db = new DatabaseSync('database.sqlite');
const rows = db.prepare('SELECT key FROM store').all();
console.log(rows.map(r => r.key));
