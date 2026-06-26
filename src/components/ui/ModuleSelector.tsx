import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Box, Calculator, Settings, LayoutDashboard, LayoutGrid, Users, FileText, PieChart } from 'lucide-react';

interface Props {
  onSelectModule: (module: 'all' | 'commerce' | 'inventory' | 'accounting' | 'admin' | 'crm' | 'hr' | 'reports_module') => void;
}

export default function ModuleSelector({ onSelectModule }: Props) {
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
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-6xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
            <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-md shadow-indigo-200">
              <LayoutDashboard className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">انتخاب بخش کاری سیستم</h1>
          <p className="text-slate-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto">
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
              className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 transform hover:-translate-y-1.5 shadow-sm hover:shadow-lg flex flex-col items-start gap-4 ${m.color} group relative overflow-hidden bg-white/70 backdrop-blur-sm`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-0" />
              
              <div className={`p-3.5 rounded-2xl ${m.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-white/50`}>
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
