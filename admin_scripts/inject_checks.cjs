const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(
  "import SystemChecklist from './components/SystemChecklist';",
  "import SystemChecklist from './components/SystemChecklist';\nimport CheckManagement from './components/CheckManagement';"
);

c = c.replace(
  "{ id: 'accounts', label: 'حساب‌های بانکی', icon: <CreditCard className=\"w-4 h-4\" /> },",
  "{ id: 'accounts', label: 'حساب‌های بانکی', icon: <CreditCard className=\"w-4 h-4\" /> },\n             { id: 'checks', label: 'چک‌ها', icon: <CreditCard className=\"w-4 h-4\" /> },"
);

// We need to add 'checks' to the includes(activeTab) array.
c = c.replace(
  "(!['products', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'person_ledger', 'database', 'update', 'checklist'].includes(activeTab))",
  "(!['products', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'person_ledger', 'database', 'update', 'checklist', 'checks'].includes(activeTab))"
);

const checksContent = `      ) : activeTab === 'checks' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><CheckManagement /></motion.div>
      ) : activeTab === 'settings'`;
c = c.replace(") : activeTab === 'settings'", checksContent);

fs.writeFileSync('src/App.tsx', c);
