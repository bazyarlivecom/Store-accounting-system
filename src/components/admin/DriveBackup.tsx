import React, { useState, useEffect } from 'react';
import { HardDrive, CheckCircle, RefreshCcw, Download, Clock, Settings, Save } from 'lucide-react';

interface LocalBackupProps {
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function DriveBackup({ showNotification }: LocalBackupProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backups, setBackups] = useState<{file: string, size: number, time: number}[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [backupConfig, setBackupConfig] = useState({ path: '', intervalHours: 4 });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isBackupSettingsOpen, setIsBackupSettingsOpen] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/db/backup-config');
      const data = await res.json();
      if (data) {
         setBackupConfig(data);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const fetchBackups = async () => {
    setIsLoadingBackups(true);
    try {
      const res = await fetch('/api/db/backups');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBackups(data);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchBackups();
  }, []);

  const saveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/db/backup-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupConfig)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('تنظیمات پشتیبان‌گیری با موفقیت ذخیره شد.', 'success');
        setIsBackupSettingsOpen(false);
        fetchConfig();
        fetchBackups();
      } else {
        throw new Error(data.error);
      }
    } catch(err) {
      console.error(err);
      showNotification('خطا در ذخیره تنظیمات پشتیبان‌گیری.', 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const runBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch('/api/db/backups/do', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('نسخه پشتیبان با موفقیت ایجاد شد.', 'success');
        fetchBackups();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      showNotification('خطا در تهیه نسخه پشتیبان.', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (file: string) => {
    if (!window.confirm('آیا از بازنشانی این نسخه پشتیبان اطمینان دارید؟ اطلاعات فعلی شما ممکن است از دست برود.')) return;
    try {
      const res = await fetch(`/api/db/backups/restore/${file}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('اطلاعات با موفقیت بازنشانی شد. لطفاً سیستم را مجددا بارگذاری کنید.', 'success');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      showNotification('خطا در بازنشانی اطلاعات.', 'error');
    }
  };

  return (
    <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-inner flex flex-col gap-6 col-span-1 md:col-span-2">
      <div className="flex items-start md:items-center justify-between gap-3 w-full flex-col md:flex-row">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
             <HardDrive className="w-5 h-5 text-indigo-600" />
           </div>
           <div className="text-right flex-1">
             <h4 className="font-bold text-gray-700 text-sm">سیستم پشتیبان‌گیری محلی و زمان‌بندی‌شده</h4>
             <p className="text-xs text-gray-500 font-mono mt-0.5">پشتیبان‌گیری روی سرور محلی انجام می‌شود</p>
           </div>
        </div>
        <button
           onClick={() => setIsBackupSettingsOpen(!isBackupSettingsOpen)}
           className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-colors shadow-sm text-xs font-bold"
        >
           <Settings className="w-4 h-4" />
           تنظیمات پشتیبان‌گیری
        </button>
      </div>

      {isBackupSettingsOpen && (
        <div className="bg-white border border-indigo-100 p-5 rounded-xl shadow-sm flex flex-col gap-5">
           <h5 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-3">تنظیمات پشتیبان‌گیری پیشرفته</h5>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                 <label className="block text-xs font-bold text-gray-600">مسیر ذخیره فایل‌ها (Local Path)</label>
                 <input
                    type="text"
                    dir="ltr"
                    value={backupConfig.path}
                    onChange={e => setBackupConfig({...backupConfig, path: e.target.value})}
                    placeholder="مثال: C:\\backups یا /var/backups (خالی = پیش‌فرض)"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-mono text-left"
                 />
                 <p className="text-[10px] text-gray-400">در صورت خالی بودن، زیرپوشه backups در مسیر نصب برنامه استفاده می‌شود.</p>
              </div>

              <div className="space-y-2">
                 <label className="block text-xs font-bold text-gray-600">دوره تناوب زمان‌بندی (ساعت)</label>
                 <select
                    value={backupConfig.intervalHours}
                    onChange={e => setBackupConfig({...backupConfig, intervalHours: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                 >
                    <option value={0}>غیرفعال (فقط دستی)</option>
                    <option value={1}>هر 1 ساعت</option>
                    <option value={4}>هر 4 ساعت</option>
                    <option value={12}>هر 12 ساعت</option>
                    <option value={24}>روزانه (هر 24 ساعت)</option>
                 </select>
              </div>
           </div>

           <div className="flex justify-end">
              <button
                 onClick={saveConfig}
                 disabled={isSavingConfig}
                 className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm text-xs disabled:opacity-75"
              >
                 {isSavingConfig ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                 ذخیره تنظیمات
              </button>
           </div>
        </div>
      )}
      
      <div className="flex items-center justify-between bg-white border border-gray-150 p-4 rounded-xl">
        <div className="flex items-center gap-3">
           {backupConfig.intervalHours > 0 ? (
             <div className="text-right">
               <h5 className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                 <span className="relative flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                 </span>
                 پشتیبان‌گیری خودکار فعال است
               </h5>
               <p className="text-[10px] text-gray-500 mt-1">
                 هر {backupConfig.intervalHours} ساعت یکبار نسخه پشتیبان تهیه می‌شود.
               </p>
             </div>
           ) : (
             <div className="text-right">
               <h5 className="text-sm font-bold text-gray-500 flex items-center gap-1.5">
                 <span className="w-2.5 h-2.5 bg-gray-300 rounded-full"></span>
                 پشتیبان‌گیری خودکار غیرفعال است
               </h5>
               <p className="text-[10px] text-gray-400 mt-1">
                 شما قابلیت تهیه پشتیبان خودکار را غیرفعال کرده‌اید.
               </p>
             </div>
           )}
        </div>
        <button
          onClick={runBackup}
          disabled={isBackingUp}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-all shadow-sm text-xs disabled:opacity-75"
        >
          {isBackingUp ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
          تهیه پشتیبان فوری
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
         <div className="bg-gray-50 p-3 border-b border-gray-200">
            <h5 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              تاریخچه نسخه‌های پشتیبان
            </h5>
         </div>
         <div className="max-h-60 overflow-y-auto">
            {isLoadingBackups ? (
               <div className="p-6 text-center text-xs text-gray-500">در حال بارگذاری...</div>
            ) : backups.length === 0 ? (
               <div className="p-6 text-center text-xs text-gray-500">هیچ نسخه پشتیبانی یافت نشد.</div>
            ) : (
               <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50">
                     <tr>
                       <th className="p-3 font-bold text-gray-600">نام فایل</th>
                       <th className="p-3 font-bold text-gray-600">حجم</th>
                       <th className="p-3 font-bold text-gray-600">تاریخ ثبت</th>
                       <th className="p-3 font-bold text-gray-600">عملیات</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {backups.map(b => (
                       <tr key={b.file} className="hover:bg-slate-50">
                          <td className="p-3 text-gray-600" dir="ltr">{b.file}</td>
                          <td className="p-3 text-gray-500">{(b.size / 1024).toFixed(1)} KB</td>
                          <td className="p-3 text-gray-500">{new Date(b.time).toLocaleString('fa-IR')}</td>
                          <td className="p-3">
                             <button
                               onClick={() => handleRestore(b.file)}
                               className="text-xs px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors font-bold"
                             >
                               بازنشانی
                             </button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </div>
      </div>
    </div>
  );
}
