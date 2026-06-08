const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const s1 = '<div className="flex h-screen overflow-hidden bg-gray-50/50 text-gray-800 font-sans" dir="rtl">';
const s2 = '<>' +
'      {/* Confirm Action Modal */}' +
'      {confirmState.isOpen && (' +
'        <div className="fixed inset-0 bg-slate-900/40 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">' +
'          <motion.div ' +
'            initial={{ opacity: 0, scale: 0.95 }}' +
'            animate={{ opacity: 1, scale: 1 }}' +
'            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center border border-gray-100" ' +
'            dir="rtl"' +
'          >' +
'            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">' +
'               <AlertTriangle className="w-6 h-6" />' +
'            </div>' +
'            <h3 className="font-extrabold text-lg mb-2">تایید عملیات</h3>' +
'            <p className="text-gray-500 text-sm text-center mb-6">{confirmState.message}</p>' +
'            <div className="flex gap-3 w-full">' +
'               <button onClick={() => { confirmState.onConfirm(); setConfirmState({...confirmState, isOpen: false}) }} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">بله، تایید</button>' +
'               <button onClick={() => setConfirmState({...confirmState, isOpen: false})} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">انصراف</button>' +
'            </div>' +
'          </motion.div>' +
'        </div>' +
'      )}' +
s1;

content = content.replace(s1, s2);

const oldTernaryEnd = /(?:\) : activeTab === 'checklist' \? \([\s\S]*?<SystemChecklist \/>[\s\S]*?\) : null\})/;
content = content.replace(oldTernaryEnd, (match) => {
  return match + "\n          {(!['products', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'person_ledger', 'database', 'update', 'checklist'].includes(activeTab)) && renderTabContent()}\n          </div>\n        </main>\n";
});

content = content.replace(/<\/div>\n\s*<\/div>\n\s*\{\/\* System Version Footer \*\/\}/g, "{/* System Version Footer */}");

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed syntax tags');
