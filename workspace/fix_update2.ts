import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 mt-6">[\s\S]*?<div className="bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-xl text-center shadow-sm relative overflow-hidden flex-1 max-w-\[200px\]">[\s\S]*?<\/p>\s*<\/div>\s*<\/div>/g;

if (regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/App.tsx', code);
    console.log('Successfully removed using regex.');
} else {
    console.log('Not found via regex either.');
}