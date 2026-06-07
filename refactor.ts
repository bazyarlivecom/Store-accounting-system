import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const startStr = `      ) : activeTab === 'checklist' ? (
        <motion.div`;

const endStr = `          </div>
        </motion.div>
      ) : null}`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `      ) : activeTab === 'checklist' ? (
        <SystemChecklist />
      ) : null}`;
    content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Replaced successfully!");
} else {
    console.log("Could not find boundaries", startIndex, endIndex);
}
