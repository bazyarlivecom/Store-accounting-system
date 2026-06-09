import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Change root flex layout
content = content.replace(
  '<div className="flex h-screen overflow-hidden bg-gray-50/50 text-gray-800 font-sans" dir="rtl">',
  '<div className={`flex ${menuLayout === \\\'horizontal\\\' ? \\\'flex-col h-screen\\\' : \\\'h-screen\\\'} overflow-hidden bg-gray-50/50 text-gray-800 font-sans`} dir="rtl">'
);

// 2. Wrap Desktop Sidebar
content = content.replace(
  '<aside className="hidden md:flex flex-col w-64 bg-slate-900 shadow-2xl z-40 text-slate-300 flex-shrink-0 transition-all duration-300 overflow-y-auto" dir="rtl">',
  '{menuLayout === \\\'vertical\\\' && (\\n      <aside className="hidden md:flex flex-col w-64 bg-slate-900 shadow-2xl z-40 text-slate-300 flex-shrink-0 transition-all duration-300 overflow-y-auto" dir="rtl">'
);

content = content.replace(
  '        </div>\\n      </aside>\\n\\n      {/* Mobile Drawer Menu */}',
  '        </div>\\n      </aside>\\n      )}\\n\\n      {/* Mobile Drawer Menu */}'
);

// 3. Add horizontal menu support and the toggle button
// Let's replace the whole top header block
const topHeaderRegex = /\{\/\* Top Header \*\/\}[\s\S]*?(?=<main)/;
const match = content.match(topHeaderRegex);
if (match) {
  let newHeader = match[0].replace(
    '<div className="flex flex-row items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-xs" dir="rtl">',
    `<div className="flex flex-col bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">\n          <div className="flex flex-row items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-xs" dir="rtl">`
  );

  // Add the layout toggle button right before `<button onClick={() => setIsFullWidth(!isFullWidth)}`
  newHeader = newHeader.replace(
    '<button\\n              onClick={() => setIsFullWidth(!isFullWidth)}',
    `<button
              onClick={() => setMenuLayout(menuLayout === 'vertical' ? 'horizontal' : 'vertical')}
              className={\`px-3 py-2 border rounded-xl transition-all cursor-pointer font-black gap-2 hidden md:flex items-center text-xs shadow-3xs active:scale-95 text-slate-600 hover:text-indigo-700 bg-white border-slate-200\`}
              title={menuLayout === 'vertical' ? "نمایش منوی افقی" : "نمایش منوی عمودی"}
            >
              {menuLayout === 'vertical' ? <LayoutList className="w-4 h-4" /> : <GripHorizontal className="w-4 h-4" />}
              <span className="hidden sm:inline-block">{menuLayout === 'vertical' ? 'منوی افقی' : 'منوی عمودی'}</span>
            </button>
            <button
              onClick={() => setIsFullWidth(!isFullWidth)}`
  );

  // Close the wrapper div and conditionally add horizontal menu
  newHeader = newHeader + `\n          {menuLayout === 'horizontal' && renderHorizontalMenu()}\n          </div>\n          `;

  content = content.replace(match[0], newHeader);
}

fs.writeFileSync('src/App.tsx', content);
