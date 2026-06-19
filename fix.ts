import fs from 'fs';
let code = fs.readFileSync('src/components/admin/DriveBackup.tsx', 'utf8');
code = code.replace("replace(/\\\\//g, '-')", "replace(/\\/\\//g, '-')"); // wait no, the original was "replace(/\\\\//g, '-')" and we want "replace(/\\//g, '-')"
code = code.replace("replace(/\\\\//g, '-')", "replace(/\\//g, '-')");
fs.writeFileSync('src/components/admin/DriveBackup.tsx', code);

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
const importsMatch = appCode.match(/import \{([^}]+)\} from 'lucide-react'/);
if (importsMatch && !importsMatch[1].includes('Banknote')) {
    appCode = appCode.replace(importsMatch[0], importsMatch[0].replace('}', ', Banknote}'));
    fs.writeFileSync('src/App.tsx', appCode);
}
console.log('Fixed');
