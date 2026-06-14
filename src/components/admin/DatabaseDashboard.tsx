import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface DatabaseDashboardProps {
  showNotification: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function DatabaseDashboard({ showNotification }: DatabaseDashboardProps) {
  const [stats, setStats] = useState<{ totalSize: number; collections: any[] }>({ totalSize: 0, collections: [] });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/db/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats().finally(() => setIsRefreshing(false));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCollectionNameInPersian = (key: string) => {
    const names: Record<string, string> = {
      'persons': 'اشخاص / طرف حساب‌ها',
      'products': 'کالاها و خدمات',
      'accounts': 'حساب‌های بانکی',
      'cashboxes': 'صندوق‌ها',
      'invoices': 'فاکتورها',
      'transactions': 'تراکنش‌های مالی',
      'company_profile': 'تنظیمات پایه'
    };
    return names[key] || key;
  };

  const handleBackup = () => {
    // Simply download from the endpoint
    const a = document.createElement('a');
    a.href = '/api/db/backup';
    a.download = `حسابداری-پشتیبان-${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification('نسخه پشتیبان با موفقیت دانلود شد', 'success');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/db/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          showNotification('بازیابی دیتابیس با موفقیت انجام شد. سیستم راه‌اندازی مجدد می‌شود', 'success');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          throw new Error('Restore failed');
        }
      } catch (err) {
        showNotification('فایل پشتیبان نامعتبر است', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden max-w-4xl mx-auto"
      dir="rtl"
    >
      <div className="bg-gradient-to-r from-rose-50 to-slate-50/30 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-rose-600" />
          مدیریت پایگاه داده و ذخیره‌سازی محلی
        </h2>
        <button 
          onClick={handleRefresh}
          className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="p-6 md:p-8 space-y-8">
        
        {/* Core Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-md text-white">
            <h3 className="font-medium text-indigo-100 flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 opacity-80" />
              حجم کل دیتابیس (database.sqlite)
            </h3>
            <div className="text-4xl font-extrabold font-mono tracking-tight text-left dir-ltr">
              {formatSize(stats.totalSize)}
            </div>
          </div>
          
          <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 shadow-inner flex flex-col justify-center items-center text-center gap-4">
            <div className="flex gap-4 w-full">
              <button
                onClick={handleBackup}
                className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-white border-2 border-emerald-100 hover:border-emerald-300 rounded-xl transition-all shadow-sm group"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-bold text-gray-700 text-sm">دانلود نسخه پشتیبان</span>
              </button>
              
              <div className="flex-1 relative">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleRestore}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <button
                  type="button"
                  className="w-full h-full flex flex-col items-center justify-center gap-2 py-4 bg-white border-2 border-amber-100 hover:border-amber-300 rounded-xl transition-all shadow-sm group"
                >
                  <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="font-bold text-gray-700 text-sm">بازیابی از فایل</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Collections Breakdown Tables */}
        <div>
          <h3 className="text-gray-800 font-extrabold text-base mb-4 border-b border-gray-100 pb-2">تفکیک جداول پایگاه داده</h3>
          <div className="overflow-x-auto bg-white border border-gray-100 rounded-xl">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6 font-semibold text-gray-600 w-16 text-center">ردیف</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">نام جدول (Collection)</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-center">تعداد رکوردهای ثبت شده</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-left">حجم داده‌ها</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {stats.collections.map((col, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-400 font-mono text-center">{idx + 1}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-800">{getCollectionNameInPersian(col.name)}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{col.name}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold font-mono text-xs">
                        {col.recordCount}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-left font-mono text-gray-600 font-medium">
                      {formatSize(col.size)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Helper Note */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-sm text-indigo-800">
          <AlertCircle className="w-5 h-5 shrink-0 text-indigo-500 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-bold mb-1">اطلاعات ذخیره‌سازی</p>
            <p>این سامانه اکنون تمامی اطلاعات را به صورت محلی در یک فایل پایگاه داده امن <code>database.sqlite</code> در سرور/سیستم ذخیره می‌کند. برای اطمینان بیشتر، می‌توانید به صورت مستمر نسخه پشتیبان (فایل‌های JSON) تهیه کنید.</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
