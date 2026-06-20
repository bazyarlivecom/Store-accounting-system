import React, { useState, useEffect } from 'react';
import { HardDrive, CheckCircle, RefreshCcw, Download, Clock } from 'lucide-react';

interface LocalBackupProps {
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function DriveBackup({ showNotification }: LocalBackupProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backups, setBackups] = useState<{file: string, size: number, time: number}[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(
    localStorage.getItem('auto_backup_local') !== 'false' // default true
  );

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
    fetchBackups();
  }, []);

  const toggleAutoBackup = () => {
    const newVal = !autoBackupEnabled;
    setAutoBackupEnabled(newVal);
    localStorage.setItem('auto_backup_local', String(newVal));
    if (newVal) {
      showNotification('تهیه نسخه پشتیبان خودکار (سرور محلی) فعال شد', 'success');
    } else {
      showNotification('پشتیبان‌گیری خودکار غیرفعال شد', 'success');
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
      <div className="flex items-center gap-3 w-full">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
          <HardDrive className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="text-right flex-1">
          <h4 className="font-bold text-gray-700 text-sm">سیستم پشتیبان‌گیری محلی و زمان‌بندی‌شده</h4>
          <p className="text-xs text-gray-500 font-mono mt-0.5">پشتیبان‌گیری روی سرور محلی انجام می‌شود</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between bg-white border border-gray-150 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${autoBackupEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={toggleAutoBackup}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${autoBackupEnabled ? '-translate-x-4' : 'translate-x-0'}`} />
          </div>
          <div className="text-right">
            <h5 className="text-sm font-bold text-gray-700">پشتیبان‌گیری خودکار (هر ۴ ساعت)</h5>
            <p className="text-[10px] text-gray-500">تمامی اطلاعات به صورت خودکار ایمن و در سرور ذخیره می‌شود.</p>
          </div>
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

