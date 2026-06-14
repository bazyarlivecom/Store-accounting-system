import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const tableBlockStart = content.indexOf('<table className="w-full text-right whitespace-nowrap min-w-[600px]">');
const tbodyStart = content.indexOf('<tbody className="divide-y divide-gray-50">', tableBlockStart);
const tbodyEnd = content.indexOf('</tbody>', tbodyStart);

if (tableBlockStart === -1 || tbodyStart === -1 || tbodyEnd === -1) {
  throw new Error("Could not find table block");
}

const beforeBlock = content.substring(0, tbodyStart);
const afterBlock = content.substring(tbodyEnd);

const newTbodyContent = `<tbody className="divide-y divide-gray-50">
                  {(() => {
                    const buildTree = (items, parentId = null, depth = 0) => {
                      let result = [];
                      const children = items.filter(c => 
                        (parentId === null && !c.parentId) || 
                        (parentId !== null && (c.parentId === parentId || c.parentId?.toString() === parentId?.toString()))
                      );
                      
                      children.forEach(child => {
                        result.push({ ...child, depth });
                        result = result.concat(buildTree(items, child.id, depth + 1));
                      });
                      
                      return result;
                    };
                    
                    const flatTree = buildTree(productCategories);
                    
                    if (flatTree.length === 0) return null;
                    
                    return flatTree.map((c: any, index: number) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-gray-500 w-16 text-center">
                          {index + 1}
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900 border-r-2 border-transparent hover:border-indigo-500">
                           <div className="flex items-center" style={{ paddingRight: \`\${c.depth * 20}px\` }}>
                             {c.depth > 0 && <span className="text-gray-300 ml-2">↳</span>}
                             {c.name}
                           </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm whitespace-normal text-right">
                           <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                             {c.parentId ? productCategories.find(p => p.id === c.parentId || p.id.toString() === c.parentId?.toString())?.name : 'دسته اصلی'}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm whitespace-normal w-1/3">
                          {c.description || '---'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditCategory(c)}
                              className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                              title="ویرایش گروه"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                              title="حذف گروه"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                `;

content = beforeBlock + newTbodyContent + afterBlock;
fs.writeFileSync('src/App.tsx', content);
