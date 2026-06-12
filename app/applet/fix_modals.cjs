const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regexEnd = /<\/AnimatePresence>\s*<\/div>\s*<\/main>/;
if(regexEnd.test(content)) {
  content = content.replace(regexEnd, '</AnimatePresence>');
  console.log('Replaced end with regex');
} else {
  console.log('Regex End not found either!');
}

const startRegex = /renderTabContent\(\)\}\s*<AnimatePresence>/;
if (startRegex.test(content)) {
  content = content.replace(startRegex, 'renderTabContent()}\n          </div>\n        </main>\n\n      <AnimatePresence>');
  console.log('Replaced start');
} else {
  console.log('Start not found!');
}

fs.writeFileSync('src/App.tsx', content);
