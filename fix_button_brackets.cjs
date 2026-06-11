const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const errBtnStr = `>
                  activeTab.includes('warehouse') ? 'بازگشت و ویرایش سند' : 'بازگشت و ویرایش فاکتور'
                </button>`;

const fixBtnStr = `>
                  {activeTab.includes('warehouse') ? 'بازگشت و ویرایش سند' : 'بازگشت و ویرایش فاکتور'}
                </button>`;

code = code.replace(errBtnStr, fixBtnStr);

const errFinalizeStr = `>
                  activeTab.includes('warehouse') ? 'ثبت قطعی در سیستم' : 'ثبت قطعی فاکتور در سیستم'
                </button>`;

const fixFinalizeStr = `>
                  {activeTab.includes('warehouse') ? 'ثبت قطعی در سیستم' : 'ثبت قطعی فاکتور در سیستم'}
                </button>`;

code = code.replace(errFinalizeStr, fixFinalizeStr);

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing labels brackets');
