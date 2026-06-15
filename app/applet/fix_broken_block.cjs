const fs = require('fs');

const appFile = fs.readFileSync('src/App.tsx', 'utf8');

// The corrupted block starts with the end of the previous case:
const anchorStart = `            </motion.div>
           );

        case 'list_sale':
        case 'list_purchase':
        case 'list_warehouse_docs':
           return (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-between gap-4">`;

// And ends with the start of the next proper list block:
const anchorEnd = `
        case 'list_sale':
        case 'list_purchase':
        case 'list_warehouse_docs':
           return (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-between gap-4">`;

const idxStart = appFile.indexOf(anchorStart);
const idxEnd = appFile.indexOf(anchorEnd, idxStart + 100);

if (idxStart !== -1 && idxEnd !== -1) {
    const fixedAppFile = appFile.substring(0, idxStart) + `            </motion.div>
           );` + appFile.substring(idxEnd);
    fs.writeFileSync('src/App.tsx', fixedAppFile);
    console.log("Deleted corrupted block successfully.");
} else {
    console.log("Anchors not found. idxStart:", idxStart, "idxEnd:", idxEnd);
}
