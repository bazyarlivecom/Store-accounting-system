import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace showSuccess with setSuccessMsg
content = content.replace(/showSuccess\(/g, 'setSuccessMsg(');

// Add 'product_categories' to activeTab state
const activeTabLineRegex = /const \[activeTab, setActiveTab \] = useState\<'([^']+)' \| (.*)\>\('create_sale'\);/;
const match = content.match(activeTabLineRegex);
if (match) {
  content = content.replace(activeTabLineRegex, \`const [activeTab, setActiveTab ] = useState<'\${match[1]}' | \${match[2]} | 'product_categories'>('create_sale');\`);
}

fs.writeFileSync('src/App.tsx', content);
