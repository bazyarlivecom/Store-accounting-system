import fs from 'fs';
let code = fs.readFileSync('src/lib/dataService.ts', 'utf8');

function replaceBlock(startIdx, endText, substitute) {
    if (startIdx === -1) return;
    const endIdx = code.indexOf(endText, startIdx) + endText.length;
    code = code.substring(0, startIdx) + substitute + code.substring(endIdx);
}

replaceBlock(
    code.indexOf('// Update product stock based on invoice type'),
    "    }\n  }",
    '// Stock is computed dynamically from history instead '
);

replaceBlock(
    code.indexOf('if (invoiceToDelete && invoiceToDelete.items'),
    "    }\n  }",
    '// Stock is computed dynamically from history instead '
);

fs.writeFileSync('src/lib/dataService.ts', code);
console.log('patched dataService.ts cleanly');
