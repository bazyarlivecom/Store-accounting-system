import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  "{menuLayout === \\'vertical\\' && (\\n      <aside",
  "{menuLayout === 'vertical' && (\n      <aside"
);
content = content.replace(
  "<div className={`flex ${menuLayout === \\'horizontal\\' ? \\'flex-col h-screen\\' : \\'h-screen\\'} overflow-hidden bg-gray-50/50 text-gray-800 font-sans`} dir=\"rtl\">",
  "<div className={`flex ${menuLayout === 'horizontal' ? 'flex-col h-screen' : 'h-screen'} overflow-hidden bg-gray-50/50 text-gray-800 font-sans`} dir=\"rtl\">"
);
content = content.replace(
  "        </div>\\n      </aside>\\n      )}\\n\\n      {/* Mobile Drawer Menu */}",
  "        </div>\n      </aside>\n      )}\n\n      {/* Mobile Drawer Menu */}"
);
// Make sure line 2717 actually gets the closing parenthesis.
// Wait, the previous replace didn't work for the closing bracket? Let's check App.tsx directly.
fs.writeFileSync('src/fix.ts', content);
