const fs = require('fs');

const appFile = fs.readFileSync('src/App.tsx', 'utf8');
const restoreText = fs.readFileSync('app/applet/restore.txt', 'utf8');

// I need to find the part where it got broken:
const startAnchor = `<CurrencyInput currencyLabel={storeSettings?.currency}`;
const endAnchor = `<input \n                          type="text" `;

// Find `<CurrencyInput currencyLabel={storeSettings?.currency}` in App.tsx
const startIdx = appFile.lastIndexOf(`<CurrencyInput currencyLabel={storeSettings?.currency}`);
// Find `t-3 top-1/2 transform -translate-y-1/2" />`
const buggedEndCode = `t-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                          type="text" `;
const endIdx = appFile.indexOf(buggedEndCode, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    console.log("Found match. Replacing...");
    const newData = appFile.substring(0, startIdx + startAnchor.length) + '\n' + restoreText + appFile.substring(endIdx + buggedEndCode.length);
    fs.writeFileSync('src/App.tsx', newData);
    console.log("Success.");
} else {
    console.log("Not found.");
}
