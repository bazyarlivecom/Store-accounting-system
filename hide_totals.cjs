const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `              {/* Totals & Submit */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">`;

const replacementStr = `              {/* Totals & Submit */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {(!activeTab.includes('warehouse')) && (
                <div className="p-6">`;

code = code.replace(targetStr, replacementStr);

const endStr = `                  </div>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">`;

const endRepStr = `                  </div>
                </div>
                )}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">`;
code = code.replace(endStr, endRepStr);

fs.writeFileSync('src/App.tsx', code);
console.log("done");
