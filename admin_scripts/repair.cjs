const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const s1 = "  return (\n    <>\n\n      {confirmState.isOpen && (";
const s2 = "option.data.searchStr || option.label || '').toLowerCase().includes(inputValue.toLowerCase());";

const i1 = content.indexOf(s1);
const i2 = content.indexOf(s2) + s2.length;

if (i1 !== -1 && i2 !== -1) {
    const before = content.substring(0, i1);
    const after = content.substring(i2);
    content = before + "  return (option.data.searchStr || option.label || '').toLowerCase().includes(inputValue.toLowerCase());" + after;
    fs.writeFileSync('src/App.tsx', content);
    console.log("FIXED TIER 1");
} else {
    console.log("NOT FOUND", i1, i2);
}

