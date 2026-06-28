const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
let lines = content.split('\n');
// We want to delete the lines containing the duplicate JSX.
// First let's find the closing tag on line 14451
for (let i = 14400; i < 14500; i++) {
  if (lines[i].includes(')}')) {
    console.log('Found )} at line ' + (i+1));
  }
}
lines.splice(14451, 23);
fs.writeFileSync('src/App.tsx', lines.join('\n'));
