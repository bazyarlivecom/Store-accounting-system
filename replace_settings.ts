import fs from 'fs';
const content = fs.readFileSync('src/components/reports/FinancialDashboard.tsx', 'utf-8');
const lines = content.split('\n');

const idx1 = lines.findIndex(l => l.includes("(['payable_checks', 'debtors', 'creditors'].includes(editingWidget.id)) ? ("));
if (idx1 !== -1) {
  lines[idx1] = `                <div className="space-y-4">
                  {['payable_checks', 'debtors', 'creditors'].includes(editingWidget.id) && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">تعداد نمایش رکوردها</label>
                      <select 
                        value={editingWidget.settings?.limit || 5} 
                        onChange={e => setEditingWidget({...editingWidget, settings: {...editingWidget.settings, limit: Number(e.target.value)}})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        <option value={5}>۵ مورد</option>
                        <option value={10}>۱۰ مورد</option>
                        <option value={20}>۲۰ مورد</option>
                        <option value={50}>۵۰ مورد</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">عرض ویجت در داشبورد</label>
                    <select 
                      value={editingWidget.settings?.width || editingWidget.defaultWidth} 
                      onChange={e => setEditingWidget({...editingWidget, settings: {...editingWidget.settings, width: e.target.value}})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="col-span-1">کوچک (یک ستون)</option>
                      <option value="col-span-1 md:col-span-2">متوسط (دو ستون)</option>
                      <option value="col-span-1 md:col-span-2 lg:col-span-3">بزرگ (سه ستون)</option>
                      <option value="col-span-1 md:col-span-2 lg:col-span-4">کامل (چهار ستون)</option>
                    </select>
                  </div>
                </div>`;
  const endIdx = lines.findIndex((l, i) => i > idx1 && l.includes("این ویجت تنظیمات خاصی ندارد."));
  if (endIdx !== -1) {
    // remove lines from idx1 + 1 to endIdx + 2
    lines.splice(idx1 + 1, endIdx - idx1 + 2);
  }
}

// And replace SortableWidget 
const sortableStart = lines.findIndex(l => l.includes("function SortableWidget"));
if (sortableStart !== -1) {
  const currentWidthLine = lines.findIndex((l, i) => i > sortableStart && l.includes("const style = {"));
  if (currentWidthLine !== -1) {
    // we already replaced transform CSS earlier
    const classLine = lines.findIndex((l, i) => i > sortableStart && l.includes("className={`relative group ${widget.defaultWidth}"));
    if (classLine !== -1) {
      lines.splice(classLine, 0, "  const currentWidth = widget.settings?.width || widget.defaultWidth;");
      lines[classLine + 1] = lines[classLine + 1].replace("widget.defaultWidth", "currentWidth");
    }
  }

  // settings button
  const settingsBtnLine = lines.findIndex((l, i) => i > sortableStart && l.includes("['payable_checks', 'debtors', 'creditors'].includes(widget.id) && ("));
  if (settingsBtnLine !== -1) {
    lines.splice(settingsBtnLine, 1);
    const endParen = lines.findIndex((l, i) => i > settingsBtnLine && l.includes(")}"));
    if (endParen !== -1) {
      lines.splice(endParen, 1);
    }
  }
}

fs.writeFileSync('src/components/reports/FinancialDashboard.tsx', lines.join('\n'));
