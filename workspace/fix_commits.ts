import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">[\s\S]*?\{commitData\.commit\?\.author\?\.name \|\| 'توسعه‌دهنده'\}\s*<\/span>/g;

const replacement = `<div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                              <Shield className="w-3 h-3" />
                            </div>
                            تیم توسعه مرکز
                          </span>`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    console.log("Avatar removed");
} else {
    console.log("Regex not found");
}

code = code.replace("تغییرات آخرین نسخه‌ها", "لیست تغییرات بسته آپدیت");

fs.writeFileSync('src/App.tsx', code);
