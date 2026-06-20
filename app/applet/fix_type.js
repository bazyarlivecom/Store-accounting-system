const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  "const [settingsTab, setSettingsTab] = useState<'general' | 'numbering' | 'features' | 'printing'>('general');",
  "const [settingsTab, setSettingsTab] = useState<'general' | 'numbering' | 'features' | 'printing' | 'notification'>('general');"
);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced types');
