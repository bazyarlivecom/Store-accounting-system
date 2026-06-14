const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const tabUi = `      ) : activeTab === 'person_roles' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-l from-indigo-50/50 to-white px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="w-6 h-6 text-indigo-500" />
                  مدیریت نقش‌های ارتباطی اشخاص
                </h1>
                <p className="text-xs text-slate-500 font-bold mt-1">تعریف نقش‌ها (مثل راننده، بازاریاب) و مدیریت کدهای پیش‌فرض برای صدور کد اشخاص</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-4">{editingPersonRoleId ? 'ویرایش نقش' : 'ثبت نقش جدید'}</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-[2]">
                <input
                  type="text"
                  value={newPersonRoleName}
                  onChange={(e) => setNewPersonRoleName(e.target.value)}
                  placeholder="عنوان نقش (مثلا راننده پایانه)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 font-bold text-sm"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newPersonRoleCode}
                  onChange={(e) => setNewPersonRoleCode(e.target.value)}
                  placeholder="کد پیش‌فرض (مثلا 40)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 font-bold text-sm"
                />
              </div>
              <button
                onClick={handleSavePersonRole}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 justify-center"
              >
                {editingPersonRoleId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingPersonRoleId ? 'ذخیره تغییرات' : 'افزودن نقش'}
              </button>
              {editingPersonRoleId && (
                <button
                  onClick={() => {
                    setEditingPersonRoleId(null);
                    setNewPersonRoleName('');
                    setNewPersonRoleCode('');
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  انصراف
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {personRoles.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold text-sm">هیچ نقشی ثبت نشده است.</div>
            ) : (
              <table className="w-full text-right whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-black">
                    <th className="py-4 px-6 w-full">عنوان نقش</th>
                    <th className="py-4 px-6 text-center">کد پایه (Prefix)</th>
                    <th className="py-4 px-6 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {personRoles.map(g => (
                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-sm text-slate-900">{g.name}</td>
                      <td className="py-4 px-6 text-center font-mono font-black text-xs text-indigo-600">{g.code}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingPersonRoleId(g.id);
                              setNewPersonRoleName(g.name);
                              setNewPersonRoleCode(g.code);
                            }}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="ویرایش نقش"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePersonRole(g.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف نقش"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : activeTab === 'accounts' ? (`;

content = content.replace("      ) : activeTab === 'accounts' ? (", tabUi);

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
