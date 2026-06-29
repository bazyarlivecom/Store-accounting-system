import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/\.$/) && lines[i+1] && lines[i+1].match(/^";/)) {
     lines[i] = lines[i] + "\\n";
     lines.splice(i+1, 1);
  } else if (lines[i].match(/\)$/) && lines[i+1] && lines[i+1].match(/^";/)) {
     lines[i] = lines[i] + "\\n";
     lines.splice(i+1, 1);
  } else if (lines[i].match(/\+ "$/) && lines[i+1] && lines[i+1].match(/^";/)) {
     lines[i] = lines[i].replace(/\+ "$/, '+ "\\n";');
     lines.splice(i+1, 1);
  } else if (lines[i].match(/\).$/) && lines[i+1] && lines[i+1].match(/^";/)) {
     lines[i] = lines[i] + "\\n";
     lines.splice(i+1, 1);
  } else if (lines[i].match(/\+$/) && lines[i+1] && lines[i+1].match(/^";/)) {
     lines[i+1] = lines[i+1].replace(/^";/, '"\\n";');
  }
}
fs.writeFileSync('src/App.tsx', lines.join('\n'));
