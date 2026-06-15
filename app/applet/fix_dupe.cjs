const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The first case block starts around 3750:
//        case 'list_sale':

// The second corrupted case block starts around 3854:
//        case 'list_sale':

// I will find the last occurrence of case 'list_sale': and delete it up to the next case.
const lastCaseIdx = code.lastIndexOf("case 'list_sale':");
if (lastCaseIdx > code.indexOf("case 'list_sale':")) { // There are multiple
    const nextCaseIdx = code.indexOf("case 'create_receive_receipt':", lastCaseIdx);
    
    // Check if the corrupted part with "ثبت و صدور فاکتور فروش" and missing tags is BEFORE this duplicate case.
    // wait, the corruption " Unexpected closing button tag " is at 3848, which is IN the first one or just before the second one!
    console.log('lastCaseIdx:', lastCaseIdx, 'nextCaseIdx:', nextCaseIdx);
}
