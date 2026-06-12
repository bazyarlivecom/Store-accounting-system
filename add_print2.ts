const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import Barcode from 'react-barcode'")) {
    content = content.replace(
        "import React, { useState, useEffect } from 'react';",
        "import React, { useState, useEffect } from 'react';\nimport Barcode from 'react-barcode';"
    );
}

// State
if (!content.includes('const [printingBarcodeProduct, setPrintingBarcodeProduct]')) {
    content = content.replace(
        "const [viewingProduct, setViewingProduct] = useState<any | null>(null);",
        "const [viewingProduct, setViewingProduct] = useState<any | null>(null);\n  const [printingBarcodeProduct, setPrintingBarcodeProduct] = useState<any | null>(null);"
    );
}

// Button in table
const btnTarget = `<Activity className="w-4 h-4" />
                          </button>`;
const btnReplace = btnTarget + `
                          <button
                            onClick={() => setPrintingBarcodeProduct(p)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all inline-block"
                            title="چاپ بارکد"
                          >
                            <Printer className="w-4 h-4" />
                          </button>`;
content = content.replace(btnTarget, btnReplace);

// Modal
const modalTarget = `{isProductModalOpen && (`;
const modalCode = `{printingBarcodeProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm print:bg-white print:p-0 print:absolute print:z-auto print:block" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto print:shadow-none print:w-[60mm] print:h-auto print:max-w-none print:max-h-none print:overflow-visible print:p-0 print:m-0"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center print:hidden">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-500" />
                  چاپ لیبل بارکد
                </h3>
                <button
                  onClick={() => setPrintingBarcodeProduct(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 print:p-0 flex flex-col items-center justify-center min-h-[250px] print:min-h-0 text-center mx-auto print:mx-0">
                <div className="border border-gray-100 p-6 rounded-2xl shadow-sm text-center w-full max-w-xs mx-auto print:border-none print:shadow-none bg-white print:m-0 print:p-1 print:max-w-[58mm] flex flex-col justify-center items-center">
                   <div className="font-extrabold text-gray-900 text-lg mb-2 truncate px-2 print:text-[12px] print:mb-1 print:leading-tight">{printingBarcodeProduct.name}</div>
                   
                   <div className="flex justify-center my-2 text-center items-center overflow-hidden w-full print:my-0 scale-100 print:scale-[0.80] origin-top">
                     {(printingBarcodeProduct.barcode && printingBarcodeProduct.barcode.length > 0) ? (
                       <Barcode value={printingBarcodeProduct.barcode} format="CODE128" width={2} height={50} fontSize={12} textMargin={2} margin={0} background="#ffffff" lineColor="#000000" />
                     ) : (printingBarcodeProduct.code && printingBarcodeProduct.code.length > 0) ? (
                       <Barcode value={printingBarcodeProduct.code} format="CODE128" width={2} height={50} fontSize={12} textMargin={2} margin={0} background="#ffffff" lineColor="#000000" />
                     ) : (
                       <div className="py-8 text-gray-400 text-sm font-bold bg-gray-50 rounded-xl w-full border border-gray-100 print:hidden">بدون کد/بارکد</div>
                     )}
                   </div>
                   
                   <div className="text-sm font-bold text-gray-500 flex justify-between w-full mt-4 px-3 print:hidden">
                     <span>قیمت مصرف‌کننده:</span>
                     <span className="text-indigo-600">{typeof formatNumber === 'function' ? formatNumber(printingBarcodeProduct.price) : printingBarcodeProduct.price} {storeSettings?.currency || 'تومان'}</span>
                   </div>
                   <div className="text-[14px] font-black tracking-wider text-gray-900 justify-between items-center hidden print:flex mt-0 pt-1 text-center w-full">
                     <span className="mx-auto block w-full text-center">{typeof formatNumber === 'function' ? formatNumber(printingBarcodeProduct.price) : printingBarcodeProduct.price} {storeSettings?.currency || 'تومان'}</span>
                   </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 print:hidden">
                 <button
                   onClick={() => setPrintingBarcodeProduct(null)}
                   className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all shadow-sm"
                 >
                   بستن
                 </button>
                 <button
                   onClick={() => window.print()}
                   className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                   disabled={!(printingBarcodeProduct.barcode || printingBarcodeProduct.code)}
                 >
                   <Printer className="w-5 h-5" />
                   چاپ لیبل استاندارد
                 </button>
              </div>
            </motion.div>
          </div>
        )}\n\n`;
content = content.replace(modalTarget, modalCode + modalTarget);

fs.writeFileSync('src/App.tsx', content);
console.log('done updating script!');
