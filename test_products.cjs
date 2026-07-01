const DatabaseSync = require('node:sqlite').DatabaseSync;
const db = new DatabaseSync('database.sqlite');
const row = db.prepare('SELECT value FROM store WHERE key = ?').get('products');
if (row) {
  const data = JSON.parse(row.value);
  console.log("Total products:", data.length);
  if (data.length > 0) {
    console.log("Sample product keys:", Object.keys(data[0]));
    console.log("Types of values in sample product:");
    for (const [k, v] of Object.entries(data[0])) {
      console.log(k, ":", typeof v, v === null ? 'null' : '');
    }
  }
} else {
  console.log("Products not found");
}
