const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `) : activeTab === "system_logs" ? (`;

const smsPanelCode = `) : activeTab === "sms_panel" ? (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
  >
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">تاریخچه پیامک‌ها</h2>
        <p className="text-sm text-gray-500 mt-1">مدیریت پیامک‌های ارسال شده از طریق وب‌سرویس یا دستگاه GSM</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setSettingsTab("notification")}
          className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-medium text-sm hover:bg-indigo-100 transition-colors"
        >
          تنظیمات پیامک
        </button>
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="bg-gray-50 border-y border-gray-100 text-gray-500">
            <th className="p-4 font-semibold w-16">ردیف</th>
            <th className="p-4 font-semibold">گیرنده</th>
            <th className="p-4 font-semibold">متن پیام</th>
            <th className="p-4 font-semibold">وضعیت</th>
            <th className="p-4 font-semibold">ارائه‌دهنده</th>
            <th className="p-4 font-semibold">تاریخ و زمان</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {smsMessages.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-gray-500">هیچ پیامکی در سیستم ثبت نشده است.</td>
            </tr>
          ) : (
            smsMessages.sort((a,b)=>b.timestamp - a.timestamp).map((msg, index) => (
              <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-gray-500">{index + 1}</td>
                <td className="p-4 font-bold text-gray-800" dir="ltr">{msg.recipient}</td>
                <td className="p-4 text-gray-600 max-w-md truncate" title={msg.message}>{msg.message}</td>
                <td className="p-4">
                  <span className={\`px-2.5 py-1 rounded-full text-xs font-bold \${msg.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : msg.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}\`}>
                    {msg.status === 'sent' ? 'ارسال شده' : msg.status === 'pending' ? 'در انتظار' : 'خطا'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={\`px-2.5 py-1 rounded-full text-xs font-bold \${msg.provider === 'online' || msg.provider === 'sms' ? 'bg-blue-100 text-blue-700' : msg.provider === 'gsm' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}\`}>
                    {msg.provider === 'sms' ? 'وب‌سرویس' : msg.provider === 'gsm' ? 'دستگاه GSM' : 'نامشخص'}
                  </span>
                </td>
                <td className="p-4 text-gray-500" dir="ltr">
                  {new Date(msg.timestamp).toLocaleString('fa-IR')}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </motion.div>
) : activeTab === "system_logs" ? (`;

content = content.replace(targetStr, smsPanelCode);
fs.writeFileSync(filePath, content);
console.log('Injected sms_panel');
