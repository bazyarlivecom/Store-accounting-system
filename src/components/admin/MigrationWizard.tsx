import React, { useState, useEffect, useRef } from 'react';
import { Database, Server, CheckCircle, AlertTriangle, ChevronLeft, RefreshCw, LogIn, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MigrationWizard({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState(1);
  const [connectionString, setConnectionString] = useState('postgresql://user:password@localhost:5432/dbname');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [migrationState, setMigrationState] = useState<any>({ status: 'idle', progress: 0, total: 0, logs: [], error: null });
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Poll status when migrating
  useEffect(() => {
    let interval: any;
    if (step === 3 && (migrationState.status === 'migrating' || migrationState.status === 'idle')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/migrate-postgres/status');
          const data = await res.json();
          setMigrationState(data);
          if (data.status === 'success' || data.status === 'error') {
            clearInterval(interval);
          }
        } catch (e) {
          console.error('Failed to poll status', e);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [step, migrationState.status]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [migrationState.logs]);

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationError('');
    try {
      const res = await fetch('/api/migrate-postgres/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString })
      });
      const data = await res.json();
      if (data.success) {
        setStep(3);
      } else {
        setValidationError(data.error || 'خطا در ارتباط با دیتابیس');
      }
    } catch (e: any) {
      setValidationError(e.message || 'خطای شبکه');
    } finally {
      setIsValidating(false);
    }
  };

  const handleStartMigration = async () => {
    try {
      await fetch('/api/migrate-postgres/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString })
      });
      // polling will take over
    } catch (e) {
      console.error(e);
    }
  };

  const resetMigration = async () => {
    await fetch('/api/migrate-postgres/reset', { method: 'POST' });
    setStep(1);
    setMigrationState({ status: 'idle', progress: 0, total: 0, logs: [], error: null });
  };

  const percent = migrationState.total > 0 ? Math.round((migrationState.progress / migrationState.total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden flex flex-col shadow-sm max-w-4xl mx-auto my-8 font-sans" dir="rtl">
      <div className="bg-slate-50 border-b-2 border-slate-200 p-6 flex items-center gap-4">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Wizard مهاجرت به PostgreSQL</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">انتقال امن، کامل و یکپارچه داده‌ها از SQLite محلی به سرور PostgreSQL</p>
        </div>
      </div>

      <div className="p-8">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
          {[
            { num: 1, title: 'معرفی و اهداف' },
            { num: 2, title: 'پیکربندی اتصال' },
            { num: 3, title: 'عملیات انتقال' },
            { num: 4, title: 'نتیجه عملیات' }
          ].map((s) => {
            const isActive = step === s.num;
            const isPast = step > s.num;
            return (
              <div key={s.num} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${isActive ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' : isPast ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-400'}`}>
                  {isPast ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-indigo-700' : isPast ? 'text-emerald-600' : 'text-slate-400'}`}>{s.title}</span>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 flex gap-4 text-blue-800">
                <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">چرا به PostgreSQL مهاجرت کنیم؟</h3>
                  <p className="text-sm font-medium leading-relaxed opacity-90">
                    سیستم فعلی از SQLite برای ذخیره‌سازی داده‌ها استفاده می‌کند که برای کاربردهای محلی عالی است. اما اگر نیاز به دسترسی همزمان چند کاربر، امنیت بالاتر، پشتیبان‌گیری ابری و یکپارچگی اطلاعات دارید، پایگاه‌داده قدرتمند PostgreSQL بهترین انتخاب است.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-slate-100 rounded-xl p-5 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">عدم از دست رفتن هیچ داده‌ای</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">تمام اطلاعات شامل فاکتورها، اشخاص، تنظیمات و تراکنش‌ها به صورت کامل منتقل می‌شوند.</p>
                  </div>
                </div>
                <div className="border-2 border-slate-100 rounded-xl p-5 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">حفظ روابط جداول (Integrity)</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">ساختار JSON و روابط داده‌ها دقیقاً با همان آیدی‌های یکتا منتقل خواهد شد.</p>
                  </div>
                </div>
                <div className="border-2 border-slate-100 rounded-xl p-5 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">بازگشت ایمن (Rollback)</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">عملیات در یک Transaction اجرا می‌شود و در صورت هرگونه خطا، هیچ تغییری اعمال نمی‌شود.</p>
                  </div>
                </div>
                <div className="border-2 border-slate-100 rounded-xl p-5 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">گزارش لحظه‌ای (Logs)</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">مراحل قدم به قدم در یک کنسول لاگ نمایش داده می‌شود.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-200">
                  شروع فرآیند مهاجرت <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رشته اتصال (Connection String) دیتابیس PostgreSQL مقصد</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    value={connectionString}
                    onChange={e => setConnectionString(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 font-mono text-sm rounded-xl py-4 pr-12 pl-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    placeholder="postgresql://username:password@localhost:5432/database_name"
                  />
                </div>
                <p className="text-xs font-medium text-slate-500 mt-2">فرمت صحیح: postgresql://[user]:[password]@[host]:[port]/[database]</p>
              </div>

              {validationError && (
                <div className="bg-rose-50 text-rose-700 border-2 border-rose-200 p-4 rounded-xl flex items-center gap-3 font-medium text-sm">
                  <XCircle className="w-5 h-5" />
                  {validationError}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 font-bold py-3 px-6 rounded-xl transition-all">
                  مرحله قبل
                </button>
                <button 
                  onClick={handleValidate} 
                  disabled={isValidating || !connectionString}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-200"
                >
                  {isValidating ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> در حال اعتبارسنجی اتصال...</>
                  ) : (
                    <>بررسی اتصال و ادامه <ChevronLeft className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {(step === 3 || step === 4) && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              
              {migrationState.status === 'idle' && step === 3 && (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Database className="w-10 h-10" />
                  </div>
                  <h3 className="font-black text-xl text-slate-800 mb-2">آماده برای شروع انتقال</h3>
                  <p className="text-slate-500 font-medium text-sm max-w-md mx-auto mb-8">
                    ارتباط با دیتابیس مقصد برقرار شد. با کلیک روی دکمه زیر، تمامی اطلاعات به صورت خودکار خوانده شده و به سرور PostgreSQL منتقل می‌شود. لطفاً تا پایان عملیات صفحه را نبندید.
                  </p>
                  <button onClick={handleStartMigration} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-xl inline-flex items-center gap-3 transition-all shadow-lg shadow-emerald-200">
                    <Play className="w-5 h-5" /> شروع فرآیند مهاجرت (اجرای Transaction)
                  </button>
                </div>
              )}

              {(migrationState.status === 'migrating' || migrationState.status === 'success' || migrationState.status === 'error') && (
                <div className="space-y-6">
                  {/* Progress Header */}
                  <div className="bg-slate-50 border-2 border-slate-100 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="font-bold text-slate-700 flex items-center gap-2">
                        {migrationState.status === 'migrating' && <><RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" /> در حال پردازش و انتقال داده‌ها...</>}
                        {migrationState.status === 'success' && <><CheckCircle className="w-6 h-6 text-emerald-500" /> عملیات با موفقیت پایان یافت</>}
                        {migrationState.status === 'error' && <><XCircle className="w-6 h-6 text-rose-500" /> خطا در اجرای عملیات</>}
                      </div>
                      <div className="font-bold text-xl text-indigo-600" dir="ltr">
                        {percent}%
                      </div>
                    </div>
                    
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden w-full relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={`absolute inset-y-0 left-0 ${migrationState.status === 'error' ? 'bg-rose-500' : migrationState.status === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-3 text-xs font-bold text-slate-500">
                      <span>ردیف پردازش شده: {migrationState.progress} از {migrationState.total}</span>
                      {migrationState.status === 'migrating' && <span className="animate-pulse text-indigo-500">لطفاً شکیبا باشید...</span>}
                    </div>
                  </div>

                  {/* Terminal / Logs */}
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2 text-sm">
                      <LogIn className="w-4 h-4" /> لاگ‌های سیستم (Execution Logs)
                    </h4>
                    <div className="bg-[#1e1e1e] rounded-xl p-4 h-[300px] overflow-y-auto font-mono text-[11px] leading-relaxed text-gray-300 border-2 border-slate-800 shadow-inner" dir="ltr">
                      {migrationState.logs.length === 0 ? (
                        <div className="opacity-50 italic text-center mt-10">Waiting for logs...</div>
                      ) : (
                        migrationState.logs.map((log: string, idx: number) => (
                          <div key={idx} className="mb-1 border-b border-gray-800/50 pb-1">
                            <span className="text-gray-500 select-none mr-3">[{new Date().toLocaleTimeString()}]</span>
                            <span className={`${log.includes('خطا') || log.includes('Error') ? 'text-rose-400' : log.includes('موفقیت') || log.includes('success') ? 'text-emerald-400' : log.includes('Transaction') || log.includes('Commit') ? 'text-blue-400 font-bold' : ''}`}>
                              {log}
                            </span>
                          </div>
                        ))
                      )}
                      <div ref={logsEndRef} />
                    </div>
                  </div>

                  {/* Actions */}
                  {migrationState.status === 'success' && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 flex items-center justify-between">
                      <div className="text-emerald-800 font-medium text-sm">
                        داده‌ها بدون نقص (بدون Data Loss) منتقل شدند و ساختار و روابط به صورت دقیق در PostgreSQL پیاده‌سازی شد.
                      </div>
                      <button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl transition-all">
                        بستن پنجره
                      </button>
                    </div>
                  )}

                  {migrationState.status === 'error' && (
                    <div className="flex justify-between items-center bg-rose-50 border-2 border-rose-200 rounded-xl p-5">
                      <div className="text-rose-700 font-medium text-sm max-w-xl">
                        خطایی رخ داد و عملیات Rollback شد. دیتابیس PostgreSQL بدون تغییر باقی ماند. می‌توانید خطا را در کنسول بالا بررسی کنید.
                      </div>
                      <button onClick={resetMigration} className="bg-white border-2 border-rose-200 hover:bg-rose-100 text-rose-700 font-bold py-2 px-6 rounded-xl transition-all flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> تلاش مجدد
                      </button>
                    </div>
                  )}

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
// Using lucide-react Play instead of importing it if not there
import { Play as PlayIcon } from 'lucide-react';
