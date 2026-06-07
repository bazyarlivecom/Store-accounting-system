import React from 'react';
import { CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function SystemChecklist() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto"
    >
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-8 border-b border-teal-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-teal-500 text-white p-3 rounded-2xl shadow-sm shadow-teal-200">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-teal-950">چک‌لیست جامع سیستم حسابداری فروشگاهی</h2>
            <p className="text-sm font-semibold text-teal-700 mt-1">مراحل و نیازمندی‌های دقیق و ریز برای توسعه یک نرم‌افزار حسابداری کامل و بدون نقص</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 md:p-8 space-y-10">
        {/* Category: Infrastructure & Database */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3 mb-5">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">۱</span>
              زیرساخت و پایگاه داده (Backend & Database)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "طراحی معماری دیتابیس (SQL/NoSQL)", desc: "طراحی دقیق جداول (اشخاص، کالاها، حساب‌ها، فاکتورها، انبار، چک‌ها، اسناد مالی) با رعایت اصول نرمال‌سازی در PostgreSQL یا معادل آن.", priority: "high" },
              { title: "پیاده‌سازی API‌های RESTful/GraphQL", desc: "ایجاد اندپوینت‌های امن برای تمامی عملیات CRUD همراه با مستندسازی Swagger و مدیریت استاتوس کدها.", priority: "high" },
              { title: "احراز هویت و امنیت (Auth & Security)", desc: "پیاده‌سازی Login با JWT، رفرش توکن، ورود دو مرحله‌ای (OTP) و هش کردن پسوردها.", priority: "high" },
              { title: "مدیریت سطح دسترسی (RBAC/ACL)", desc: "تعریف Roleهای مختلف (مدیر، حسابدار، انباردار، فروشنده) و اعمال دسترسی روی تمام ماژول‌ها.", priority: "high" },
              { title: "مدیریت تراکنش‌ها (Database Transactions)", desc: "تضمین ذخیره یکپارچه موجودیت‌های چندگانه (موجودی انبار + فاکتور + سندحسابداری) جهت جلوگیری از مغایرت डेटा.", priority: "high" },
              { title: "سیستم کش و بهینه‌سازی (Caching)", desc: "استفاده از Redis برای کش کردن گزارشات سنگین و لیست‌های پایه برای افزایش چشمگیر سرعت لود.", priority: "medium" },
              { title: "بکاپ‌گیری و بازیابی ابری (Cloud Backup)", desc: "سرویس Job زمان‌بندی شده برای اکسپورت دیتابیس به صورت روزانه/هفتگی و ارسال به فضای ابری.", priority: "medium" },
              { title: "تست‌نویسی جامع (Unit & Integration Tests)", desc: "نوشتن تست‌های خودکار برای منطق‌های کلیدی حسابداری (مثل محاسبه سود/زیان، بالانس بودن اسناد دستی).", priority: "low" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-200 transition-all shadow-sm group">
                <input type="checkbox" className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-gray-800 text-[13px] group-hover:text-blue-700 transition-colors"><span className="text-gray-400 font-normal ml-1">{idx + 1}.</span> {item.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      item.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' : 
                      item.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.priority === 'high' ? 'اولویت بالا/فوری' : item.priority === 'medium' ? 'اولویت متوسط' : 'اولویت پایین'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: Base Definitions */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3 mb-5">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm">۲</span>
              اطلاعات پایه و تعاریف (Base Data)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "ساختار درختی حساب‌ها (کدینگ)", desc: "تعریف گروه حساب، حساب کل، حساب معین و جزئیات تفصیلی (سطح ۴ و ۵ در صورت نیاز).", priority: "high" },
              { title: "تعریف انبارهای چندگانه", desc: "قابلیت ایجاد چندین انبار (انبار مرکزی، فروشگاه، ضایعات) و تعیین انبار پیش‌فرض برای کاربران.", priority: "medium" },
              { title: "دسته‌بندی ویژگی‌دار کالاها", desc: "تعریف سوپرگروه، زیرگروه و مدل برای کالاها با امکان افزودن لیبل‌ها و تگ‌های دلخواه.", priority: "medium" },
              { title: "ثبت کالا با ابعاد تجاری کامل", desc: "بارکد دوبعدی، نقطه سفارش، حداقل موجودی، کد فنی سازنده، ۲ واحد سنجش، و نسبت تبدیل واحدها.", priority: "high" },
              { title: "تعریف جامع اشخاص (CRM اولیه)", desc: "مدیریت مشتریان، تامین‌کنندگان و ویزیتورها با ثبت کد ملی، کد اقتصادی، شماره شبا، حد اعتبار نقدی/چکی.", priority: "high" },
              { title: "تعریف انواع بازاریاب‌ها و پورسانت‌ها", desc: "ثبت بازاریاب و تعیین درصد یا مبلغ ثابت پورسانت بر اساس گروه‌کالایی یا فاکتور.", priority: "low" },
              { title: "ثبت مانده اول دوره جامع", desc: "ثبت موجودی تعدادی انبار، مانده ریالی صندوق/بانک‌ها، چک‌های در جریان، و مانده حساب اشخاص قبل از شروع سیستم.", priority: "high" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-purple-200 transition-all shadow-sm group">
                <input type="checkbox" className="mt-1 w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-gray-800 text-[13px] group-hover:text-purple-700 transition-colors"><span className="text-gray-400 font-normal ml-1">{idx + 9}.</span> {item.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      item.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' : 
                      item.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.priority === 'high' ? 'اولویت بالا/فوری' : item.priority === 'medium' ? 'اولویت متوسط' : 'اولویت پایین'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: Buying & Selling */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3 mb-5">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">۳</span>
              آیتم‌های فاکتور، خرید و فروش (Trade Management)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "صدور انواع فرم‌های تجاری", desc: "پیش‌فاکتور (با تاریخ انقضا)، فاکتور فروش رسمی/غیررسمی، فاکتور خرید، مرجوعی فروش و مرجوعی خرید.", priority: "high" },
              { title: "جزئیات حرفه‌ای اقلام فاکتور", desc: "محاسبه ارزش افزوده تفکیک‌شده، تخفیف درصدی و مبلغی به ازای هر کالا، و اضافه کسورات کل فاکتور.", priority: "high" },
              { title: "تخصیص بازاریاب به فاکتور", desc: "امکان انتخاب کاربر بازاریاب روی فاکتور فروش برای محاسبه اتوماتیک پورسانت فروش در پایان دوره.", priority: "medium" },
              { title: "پشتیبانی از سخت‌افزارهای فروشگاهی", desc: "سازگاری کامل فرانت‌اند با بارکداسکنر، دستگاه فیش‌پرینتر، کالاخوان (Price Checker) و ترازو دیجیتال (در صورت نیاز).", priority: "medium" },
              { title: "حواله و رسید انبار مستند", desc: "جدا کردن فرایند مالی (صدور فاکتور) از فرایند فیزیکی (خروج جنس از انبار) با ثبت حواله‌های تفکیک‌شده.", priority: "low" },
              { title: "قیمت‌گذاری پویا و تیپ قیمت", desc: "تعیین لیست قیمت دلخواه نظیر عمده، همکار، مصرف‌کننده و اعمال اتوماتیک روی فاکتور اشخاص.", priority: "medium" },
              { title: "مدیریت نقطه سفارش و هشدارها", desc: "سیستم کنترل اتوماتیک موجودی کالا برای جلوگیری از صدور فاکتور منفی یا اخطار برای کالای رو به اتمام.", priority: "high" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-emerald-200 transition-all shadow-sm group">
                <input type="checkbox" className="mt-1 w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-gray-800 text-[13px] group-hover:text-emerald-700 transition-colors"><span className="text-gray-400 font-normal ml-1">{idx + 16}.</span> {item.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      item.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' : 
                      item.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.priority === 'high' ? 'اولویت بالا/فوری' : item.priority === 'medium' ? 'اولویت متوسط' : 'اولویت پایین'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: Treasury & Finance */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3 mb-5">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-sm">۴</span>
              خزانه‌داری، چک و امور مالی (Treasury & Finance)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "عملیات دریافت و پرداخت نقدی", desc: "ثبت رسیدهای دریافت/پرداخت با امکان انتخاب حساب بانکی، صندوق، یا دستگاه کارت‌خوان مشخص.", priority: "high" },
              { title: "تسویه فاکتور چندگانه", desc: "امکان تسویه یک فاکتور از طریق ترکیبی از نقد، چک، کارتخوان و تخفیف نقدی روی یک فرم تسویه.", priority: "high" },
              { title: "مدیریت جامع چرخه چک‌های دریافتی", desc: "ثبت، واگذاری به بانک (خواباندن چک)، وصول، برگشت چک، مسترد کردن به مشتری یا خرج کردن به شخص ثالث.", priority: "high" },
              { title: "مدیریت اسناد و چک‌های پرداختی", desc: "صدور چک پرداختی، پاس شدن چک در بانک، عودت چک پرداخت شده یا ابطال چک.", priority: "medium" },
              { title: "ارتباط با کارت‌خوان‌ها (PC-POS)", desc: "همگام‌سازی فاکتور نرم‌افزار با دستگاه کارت‌خوان روی میز صندوق‌دار برای جلوگیری از خطای ورود مبلغ.", priority: "low" },
              { title: "ثبت اسناد دستی (ژورنال)", desc: "فرم مخصوص حسابداران سنتی برای نوشتن آرتیکل‌های حسابداری بدهکار و بستانکار جهت اصلاح حساب‌ها.", priority: "high" },
              { title: "مدیریت اقساط و دفترچه اقساط", desc: "قابلیت تقسیط بدهی فاکتور فروش، محاسبه فرمول سود فروش قسطی، و چاپ دفترچه پرداخت با سررسیدها.", priority: "medium" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-rose-200 transition-all shadow-sm group">
                <input type="checkbox" className="mt-1 w-5 h-5 text-rose-600 rounded border-gray-300 focus:ring-rose-500 cursor-pointer" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-gray-800 text-[13px] group-hover:text-rose-700 transition-colors"><span className="text-gray-400 font-normal ml-1">{idx + 23}.</span> {item.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      item.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' : 
                      item.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.priority === 'high' ? 'اولویت بالا/فوری' : item.priority === 'medium' ? 'اولویت متوسط' : 'اولویت پایین'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: HR & Payroll */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3 mb-5">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-sm">۵</span>
              مدیریت حقوق، دستمزد و منابع انسانی (HR)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "پرونده پرسنلی", desc: "مدیریت قراردادها، حقوق پایه، ساعت کاری و بیمه پرسنل مجموعه با محاسبه روزهای کارکرد.", priority: "medium" },
              { title: "ایجاد لیست حقوق (Payroll)", desc: "صدور دوره‌ای فیش حقوقی با امکان محاسبه اضافه‌کار، کسر بیمه و مالیات، مساعده، و پاداش‌ها اتوماتیک.", priority: "high" },
              { title: "صدور سند حسابداری حقوق", desc: "نگهداشتن هزینه حقوق پرداختی در سرفصل هزینه‌های جاری و ثبت بستانکاری در حساب کارمند به صورت خودکار.", priority: "high" },
              { title: "مساعده و وام کارکنان", desc: "پرداخت وام/مساعده و لحاظ کردن فرمول کسر اقساط وام در فیش حقوقی ماه‌های آینده کارمندان.", priority: "low" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-pink-200 transition-all shadow-sm group">
                <input type="checkbox" className="mt-1 w-5 h-5 text-pink-600 rounded border-gray-300 focus:ring-pink-500 cursor-pointer" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-gray-800 text-[13px] group-hover:text-pink-700 transition-colors"><span className="text-gray-400 font-normal ml-1">{idx + 30}.</span> {item.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      item.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' : 
                      item.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.priority === 'high' ? 'اولویت بالا/فوری' : item.priority === 'medium' ? 'اولویت متوسط' : 'اولویت پایین'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: Reporting & Dashboards */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3 mb-5">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm">۶</span>
              گزارشات مدیریتی، مالیاتی و نمودارها (Reports)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "گزارش سود و زیان دقیق", desc: "نمایش سود ناخالص و خالص در بازه تاریخ انتخابی با تفکیک هزینه‌ها با قابلیت‌های میانگین قیمت خرید کالاها.", priority: "high" },
              { title: "ترازنامه، تراز آزمایشی و دفاتر", desc: "دریافت خروجی ترازنامه‌های استاندارد حسابداری شامل تراز دو، چهار و شش ستونه برای تاییدیه مالیاتی.", priority: "high" },
              { title: "صورتحساب و صورت‌وضعیت اشخاص", desc: "ریز کامل از تمامی تراکنش‌های یک شخص مشخص شامل خرید، فروش، برگشتی‌ها، پرداختی‌ها و دریافتی‌ها.", priority: "high" },
              { title: "کاردکس موجودی و ریالی انبار", desc: "تاریخچه ورود و خروج مقداری کالاها (رسید و حواله) به همراه محاسبات ریالی موجودی انبارها.", priority: "high" },
              { title: "گزارشات مرور فروش و پرفروش‌ترین‌ها", desc: "تحلیل سریع‌ترین کالاهای در حال گردش، مشتریان برتر (VIP)، بازاریابان برتر و رکود کالاها.", priority: "medium" },
              { title: "گزارش مالیات بر ارزش افزوده (TTMS)", desc: "اکسپورت قالب اختصاصی و مورد تایید نرم‌افزار دارایی برای گزارشات فصلی مالیاتی خرید و فروش.", priority: "medium" },
              { title: "داشبورد تحلیلی و نمودارها", desc: "داشبورد مرکزی دارای گراف خطی فروش، چارت دایره‌ای تفکیک هزینه‌ها، و جدول چک‌های سررسید نزدیک.", priority: "high" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-amber-200 transition-all shadow-sm group">
                <input type="checkbox" className="mt-1 w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500 cursor-pointer" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-gray-800 text-[13px] group-hover:text-amber-700 transition-colors"><span className="text-gray-400 font-normal ml-1">{idx + 34}.</span> {item.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      item.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' : 
                      item.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.priority === 'high' ? 'اولویت بالا/فوری' : item.priority === 'medium' ? 'اولویت متوسط' : 'اولویت پایین'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: UX/UI & Extras */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3 mb-5">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-sm">۷</span>
              توسعه تجربه کاربری و امکانات سیستم (UX Engine & Tools)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "ابزار چاپ پیشرفته (Print Studio)", desc: "سیستم تولید PDF در برگه A4، A5 و قالب فیش پرینتر رولی به صورت اتوماتیک برای تمامی فرم‌ها و فاکتورها.", priority: "high" },
              { title: "خروجی اطلاعات (Excel/CSV Export)", desc: "کلیدهای گرفتن اکسپورت اکسل از دیتاتیل‌ها نظیر لیست اشخاص، لیست محصولات یا گزارشات با استایل تمیز.", priority: "high" },
              { title: "جستجوگر کالاها با PWA", desc: "بهینه‌سازی وب‌اپلیکیشن برای نصب روی گوشی (PWA) تا فروشندگان با دوربین موبایل بارکد کالا را استعلام بگیرند.", priority: "low" },
              { title: "کلیدهای میانبر در فرم‌ها (Hotkeys)", desc: "ذخیره فاکتور با (Ctrl+S)، شخص حدید با (F3) جهت کار سریع‌تر اپراتوری که تسلط روی کیبورد دارد.", priority: "medium" },
              { title: "عملیات بستن پایان سال مالی (Closing)", desc: "جابجایی مانده حساب‌های تفکیک شده، صفر کردن حساب‌های موقت(درآمد/هزینه)، صدور اتوماتیک اسناد اختتامیه و افتتاحیه.", priority: "high" },
              { title: "اطلاع‌رسانی پیامکی (SMS Gateway)", desc: "اتصال به پنل پیامکی برای ارسال اتوماتیک متن فاکتور خرید برای مشتری یا یادآوری تسویه فاکتور و سررسید چک.", priority: "medium" },
              { title: "امضای دیجیتال و لوگوی سربرگ", desc: "آپلود کردن تصویر شخصی برای چاپ روی سربرگ اسناد، امضای دیجیتال برای مدیر و استامپ پای فرم‌ها.", priority: "low" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-cyan-200 transition-all shadow-sm group">
                <input type="checkbox" className="mt-1 w-5 h-5 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-gray-800 text-[13px] group-hover:text-cyan-700 transition-colors"><span className="text-gray-400 font-normal ml-1">{idx + 41}.</span> {item.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      item.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' : 
                      item.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.priority === 'high' ? 'اولویت بالا/فوری' : item.priority === 'medium' ? 'اولویت متوسط' : 'اولویت پایین'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
