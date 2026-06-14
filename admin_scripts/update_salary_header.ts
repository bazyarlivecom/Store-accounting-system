import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<div className="bg-gray-50\/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">\s*<h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 animate-pulse-slow">\s*<FileText className="w-5 h-5 text-indigo-500" \/>\s*لیست اسناد حقوق و فیش‌های حقوقی کارمندان\s*<\/h2>\s*<\/div>/;

const replacement = `<div className="bg-gradient-to-l from-indigo-50 to-white px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  لیست اسناد حقوق و فیش‌های حقوقی کارمندان
                </h1>
                <p className="text-sm text-gray-500 font-medium mt-1">مدیریت لیست کارکرد و فیش‌های حقوقی صادر شده پرسنل</p>
              </div>
            </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
