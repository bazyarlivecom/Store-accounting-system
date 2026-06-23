import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Box, Calculator, Settings, LayoutDashboard, LayoutGrid } from 'lucide-react';

interface Props {
  onSelectModule: (module: 'all' | 'commerce' | 'inventory' | 'accounting' | 'admin') => void;
}

export default function ModuleSelector({ onSelectModule }: Props) {
  const modules = [
    {
      id: 'commerce',
      title: 'بازرگانی و فروش',
      description: 'مدیریت مشتریان، فاکتورهای خرید و فروش، پیش‌فاکتورها و تحلیل میزان فروش.',
      icon: <ShoppingCart className="w-10 h-10 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-500 hover:shadow-emerald-200',
      iconBg: 'bg-emerald-100',
    },
    {
      id: 'inventory',
      title: 'انبار و کالا',
      description: 'پیکربندی انبارها، معرفی کالاها، صدور اسناد ورود و خروج، موجودی و انبارگردانی.',
      icon: <Box className="w-10 h-10 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200 hover:border-amber-500 hover:shadow-amber-200',
      iconBg: 'bg-amber-100',
    },
    {
      id: 'accounting',
      title: 'حسابداری و خزانه‌داری',
      description: 'مدیریت بانک، صندوق، دریافت و پرداخت، چک‌ها، وام و تهیه گزارشات مالی.',
      icon: <Calculator className="w-10 h-10 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-500 hover:shadow-indigo-200',
      iconBg: 'bg-indigo-100',
    },
    {
      id: 'admin',
      title: 'پیکربندی سیستم',
      description: 'مدیریت کاربران و نقش‌ها، تنظیمات پایه‌ای سیستم، پشتیبان‌گیری و پایگاه داده.',
      icon: <Settings className="w-10 h-10 text-slate-600" />,
      color: 'bg-slate-50 border-slate-200 hover:border-slate-500 hover:shadow-slate-200',
      iconBg: 'bg-slate-200',
    },
    {
      id: 'all',
      title: 'داشبورد جامع (همه بخش‌ها)',
      description: 'نمایش تمامی بخش‌های سیستم به صورت یکجا بدون تفکیک.',
      icon: <LayoutGrid className="w-10 h-10 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 hover:border-blue-500 hover:shadow-blue-200 md:col-span-2 lg:col-span-2',
      iconBg: 'bg-blue-100',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-lg shadow-indigo-200">
            <LayoutDashboard className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">انتخاب بخش کاری سیستم</h1>
        <p className="text-slate-500 mt-2 text-lg">لطفاً ماژول مورد نظر خود را برای شروع انتخاب کنید</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full"
      >
        {modules.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (idx + 1) }}
            onClick={() => onSelectModule(m.id as any)}
            className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 transform hover:-translate-y-2 shadow-sm hover:shadow-xl flex items-start gap-6 ${m.color}`}
          >
            <div className={`p-4 rounded-2xl ${m.iconBg}`}>
              {m.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">{m.title}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {m.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
