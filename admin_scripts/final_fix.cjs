const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. We added </div></main> inside the ternary replace earlier. Let's remove them.
content = content.replace(/\{\(\!\['products', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'person_ledger', 'database', 'update', 'checklist'\]\.includes\(activeTab\)\) && renderTabContent\(\)\}\n          <\/div>\n        <\/main>/, 
"{(!['products', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'person_ledger', 'database', 'update', 'checklist'].includes(activeTab)) && renderTabContent()}");

// 2. Around 4000, we have the two </div> lines. Let's verify what they were.
// At line 4013: </AnimatePresence>
// Then line 4010, 4011 are </div></div>
// Let's replace the whole block from </AnimatePresence> to footer to make sure it's correct.
const footerRegex = /<\/div>\s*<\/div>\s*\{\/\* System Version Footer \*\/\}/g;
// Wait, in fix_syntax we replaced this with "{/* System Version Footer */}".
// So currently it is:
// </AnimatePresence>
//   {/* System Version Footer */}
// <footer...

// I will just add the correct closing tags.
// The whole App container needs:
// </main> (closes main)
// </div> (closes flex-1 flex flex-col)
// </div> (closes flex h-screen)
// </> (closes fragment)

content = content.replace(/\{\/\* System Version Footer \*\/\}/, 
\`          </div>
        </main>
        {/* System Version Footer */}
\`);

// And at the end of the footer (where it used to say </div> for flex h-screen):
content = content.replace(/<\/footer>\s*<\/div>\s*\{\s*printingTransaction && \(/,
\`</footer>
      </div>
    </div>
    {printingTransaction && (\`);

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
