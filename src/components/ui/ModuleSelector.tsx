import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Box, Calculator, Settings, LayoutDashboard, LayoutGrid, Users, FileText, PieChart, Store } from 'lucide-react';

interface Props {
  onSelectModule: (module: 'all' | 'commerce' | 'inventory' | 'accounting' | 'admin' | 'crm' | 'hr' | 'reports_module') => void;
  storeSettings?: any;
}

export default function ModuleSelector({ onSelectModule, storeSettings }: Props) {
  const storeName = storeSettings?.storeName || 'انتخاب بخش کاری سیستم';
  const logoUrl = storeSettings?.logoUrl;

  const modules = [
    {
      id: 'commerce',
      title: 'بازرگانی و فروش',
      description: 'مدیریت مشتریان، فاکتورهای خرید و فروش، پیش‌فاکتورها و تحلیل میزان فروش.',
      icon: <ShoppingCart className="w-8 h-8 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-500 hover:shadow-emerald-200/50',
      iconBg: 'bg-emerald-100/80',
    },
    {
      id: 'inventory',
      title: 'انبار و کالا',
      description: 'پیکربندی انبارها، معرفی کالاها، صدور اسناد ورود و خروج، موجودی و انبارگردانی.',
      icon: <Box className="w-8 h-8 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200 hover:border-amber-500 hover:shadow-amber-200/50',
      iconBg: 'bg-amber-100/80',
    },
    {
      id: 'accounting',
      title: 'حسابداری و خزانه‌داری',
      description: 'مدیریت بانک، صندوق، دریافت و پرداخت، چک‌ها، وام و تهیه گزارشات مالی.',
      icon: <Calculator className="w-8 h-8 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-500 hover:shadow-indigo-200/50',
      iconBg: 'bg-indigo-100/80',
    },
    {
      id: 'crm',
      title: 'ارتباط با مشتریان (CRM)',
      description: 'پرونده جامع اشخاص، پیگیری تعاملات، صورت‌حساب مشتری و وفاداری.',
      icon: <Users className="w-8 h-8 text-rose-600" />,
      color: 'bg-rose-50 border-rose-200 hover:border-rose-500 hover:shadow-rose-200/50',
      iconBg: 'bg-rose-100/80',
    },
    {
      id: 'hr',
      title: 'منابع انسانی و حقوق',
      description: 'مدیریت پرسنل، صدور فیش حقوقی، کارکرد و مساعده و وام پرسنل.',
      icon: <FileText className="w-8 h-8 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-200 hover:border-cyan-500 hover:shadow-cyan-200/50',
      iconBg: 'bg-cyan-100/80',
    },
    {
      id: 'reports_module',
      title: 'گزارشات و داشبوردها',
      description: 'تحلیل داده‌ها، نمودارهای مالی و فروش، گزارشات جامع مدیریتی.',
      icon: <PieChart className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 hover:border-purple-500 hover:shadow-purple-200/50',
      iconBg: 'bg-purple-100/80',
    },
    {
      id: 'admin',
      title: 'پیکربندی سیستم',
      description: 'مدیریت کاربران و نقش‌ها، تنظیمات پایه‌ای، لاگ‌ها و پایگاه داده.',
      icon: <Settings className="w-8 h-8 text-slate-600" />,
      color: 'bg-slate-50 border-slate-200 hover:border-slate-500 hover:shadow-slate-200/50',
      iconBg: 'bg-slate-200/80',
    },
    {
      id: 'all',
      title: 'داشبورد جامع (همه بخش‌ها)',
      description: 'نمایش تمامی بخش‌های سیستم به صورت یکجا بدون تفکیک.',
      icon: <LayoutGrid className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-50 border-blue-300 hover:border-blue-600 hover:shadow-blue-300/50 md:col-span-2 lg:col-span-2',
      iconBg: 'bg-blue-100',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden" dir="rtl">
      {/* Animated Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-blue-200/40 to-emerald-200/40 blur-[100px]"
        />
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-r from-rose-200/40 to-amber-200/40 blur-[80px]"
        />
      </div>
      
      <div className="w-full max-w-6xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 flex flex-col items-center"
        >
          {logoUrl ? (
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              src={logoUrl} 
              alt={storeName} 
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain mb-6 drop-shadow-xl bg-white p-2 rounded-3xl"
            />
          ) : (
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-3xl shadow-lg border border-slate-100 mb-6 backdrop-blur-xl bg-white/80">
              <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-md shadow-indigo-200">
                <Store className="w-10 h-10" />
              </div>
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 drop-shadow-sm">{storeName}</h1>
          <p className="text-slate-600 text-lg sm:text-xl font-medium max-w-2xl mx-auto drop-shadow-sm">
            با توجه به نیاز فعلی خود، یکی از ماژول‌های تخصصی زیر را برای ورود به سیستم انتخاب کنید.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {modules.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1 * idx + 0.3, type: "spring", stiffness: 100 }}
              onClick={() => onSelectModule(m.id as any)}
              className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 transform hover:-translate-y-1.5 shadow-md hover:shadow-xl flex flex-col items-start gap-4 ${m.color} group relative overflow-hidden bg-white/80 backdrop-blur-md`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-0" />
              
              <div className={`p-3.5 rounded-2xl ${m.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-white/60`}>
                {m.icon}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                  {m.title}
                </h2>
                <p className="text-slate-600/90 leading-relaxed text-[13px] font-medium">
                  {m.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
