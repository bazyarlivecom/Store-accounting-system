const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/\{\(\!\['products', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'person_ledger', 'database', 'update', 'checklist'\]\.includes\(activeTab\)\) && renderTabContent\(\)\}\n          <\/div>\n        <\/main>/, 
"{(!['products', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'person_ledger', 'database', 'update', 'checklist'].includes(activeTab)) && renderTabContent()}");

content = content.replace(/\{\/\* System Version Footer \*\/\}/, "          </div>\n        </main>\n        {/* System Version Footer */}");

content = content.replace(/<\/footer>\s*<\/div>\s*\{\s*printingTransaction && \(/, "</footer>\n      </div>\n    </div>\n    {printingTransaction && (");

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
