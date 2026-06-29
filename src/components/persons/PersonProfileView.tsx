import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Receipt, Wallet, FileText, ArrowRight, Building2, Calendar, Edit2, ShoppingCart, Truck } from "lucide-react";

interface PersonProfileViewProps {
  personId: string | number;
  persons: any[];
  invoices: any[];
  transactions: any[];
  storeSettings: any;
  calculatePersonBalance: (id: string | number) => { amount: number, status: string, totalDebits: number, totalCredits: number };
  onBack: () => void;
  onEdit: (person: any) => void;
  onViewLedger: (personId: string | number) => void;
  onCreateSale: (personId: string | number) => void;
  onCreatePurchase: (personId: string | number) => void;
  onCreateReceive: (personId: string | number) => void;
  onCreatePay: (personId: string | number) => void;
  getPersonDisplayName: (p: any) => string;
  formatCurrency: (amount: number) => string;
  toPersianDigits: (str: string | number) => string;
  formatPersianDateDisplay: (date: any) => string;
}

export default function PersonProfileView({
  personId,
  persons,
  invoices,
  transactions,
  storeSettings,
  calculatePersonBalance,
  onBack,
  onEdit,
  onViewLedger,
  onCreateSale,
  onCreatePurchase,
  onCreateReceive,
  onCreatePay,
  getPersonDisplayName,
  formatCurrency,
  toPersianDigits,
  formatPersianDateDisplay
}: PersonProfileViewProps) {
  const person = persons.find(p => p.id.toString() === personId.toString());
  
  const balance = useMemo(() => calculatePersonBalance(personId), [personId, calculatePersonBalance]);
  
  const recentInvoices = useMemo(() => {
    return invoices.filter(inv => inv.customerId?.toString() === personId.toString() && inv.status !== 'draft')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [invoices, personId]);

  if (!person) return null;

  const isOwed = balance.status === "بدهکار";
  const isOwes = balance.status === "بستانکار";
  const isClr = balance.status === "تسویه";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-right pb-10"
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          پروفایل شخص
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full mb-4 border-4 border-slate-100 shadow-sm overflow-hidden flex items-center justify-center bg-indigo-50">
            {person.imageUrl ? (
              <img src={person.imageUrl} alt={getPersonDisplayName(person)} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-indigo-300" />
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900">{getPersonDisplayName(person)}</h2>
          <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full mt-2 mb-6">
            {person.role === 'customer' ? 'مشتری' : person.role === 'supplier' ? 'تامین کننده' : 'همکار'}
          </span>

          <div className="w-full space-y-4 text-sm font-bold text-slate-700 text-right">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
              <span dir="ltr">{toPersianDigits(person.phone || "---")}</span>
            </div>
            {person.nationalId && (
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>کد ملی: {toPersianDigits(person.nationalId)}</span>
              </div>
            )}
            {person.companyName && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{person.companyName}</span>
              </div>
            )}
            <div className="flex items-center gap-3 items-start">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{person.address || "بدون آدرس"}</span>
            </div>
          </div>

          <button 
            onClick={() => onEdit(person)}
            className="mt-8 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            ویرایش اطلاعات
          </button>
        </div>

        {/* Financial & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-600" />
              وضعیت مالی
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-500 mb-1">جمع بدهکاری (افزایش بدهی)</div>
                <div className="text-lg font-black text-slate-900">{toPersianDigits(formatCurrency(balance.totalDebits))}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-500 mb-1">جمع بستانکاری (کاهش بدهی)</div>
                <div className="text-lg font-black text-slate-900">{toPersianDigits(formatCurrency(balance.totalCredits))}</div>
              </div>
              <div className={`p-4 rounded-2xl border ${isClr ? 'bg-slate-100 border-slate-200' : isOwed ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="text-xs font-bold text-slate-500 mb-1">مانده نهایی حساب</div>
                <div className={`text-xl font-black ${isClr ? 'text-slate-800' : isOwed ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {isClr ? 'تسویه کامل' : (
                    <>
                      {toPersianDigits(formatCurrency(Math.abs(balance.amount)))}
                      <span className="text-xs font-bold mr-2">{isOwed ? 'بدهکار به ما' : 'بستانکار از ما'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => onViewLedger(personId)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
            >
              <FileText className="w-5 h-5" />
              مشاهده ریز جزئیات و کارت حساب (دفتر معین)
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              عملیات سریع
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                onClick={() => onCreateSale(personId)}
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl font-bold text-sm transition-colors flex flex-col items-center gap-2 border border-blue-100"
              >
                <div className="p-2 bg-white rounded-xl shadow-sm"><ShoppingCart className="w-5 h-5 text-blue-600" /></div>
                فروش جدید
              </button>
              <button 
                onClick={() => onCreatePurchase(personId)}
                className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl font-bold text-sm transition-colors flex flex-col items-center gap-2 border border-purple-100"
              >
                <div className="p-2 bg-white rounded-xl shadow-sm"><Truck className="w-5 h-5 text-purple-600" /></div>
                خرید جدید
              </button>
              <button 
                onClick={() => onCreateReceive(personId)}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl font-bold text-sm transition-colors flex flex-col items-center gap-2 border border-emerald-100"
              >
                <div className="p-2 bg-white rounded-xl shadow-sm"><Receipt className="w-5 h-5 text-emerald-600" /></div>
                دریافت وجه
              </button>
              <button 
                onClick={() => onCreatePay(personId)}
                className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl font-bold text-sm transition-colors flex flex-col items-center gap-2 border border-rose-100"
              >
                <div className="p-2 bg-white rounded-xl shadow-sm"><Wallet className="w-5 h-5 text-rose-600" /></div>
                پرداخت وجه
              </button>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              آخرین فاکتورها
            </h3>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                فاکتوری ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${inv.type === 'sale' ? 'bg-blue-100 text-blue-700' : inv.type === 'purchase' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'}`}>
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          فاکتور {toPersianDigits(inv.invoiceNumber || inv.id)}
                          <span className="text-[10px] bg-white px-2 border border-slate-200 rounded text-slate-500">
                            {inv.type === 'sale' ? 'فروش' : inv.type === 'purchase' ? 'خرید' : 'سایر'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-500 mt-0.5">
                          {formatPersianDateDisplay(inv.jalaliDate || inv.date)}
                        </div>
                      </div>
                    </div>
                    <div className="font-black text-slate-900 text-sm text-left">
                      {toPersianDigits(formatCurrency(inv.totalAmount || 0))}
                      <span className="text-[9px] font-bold text-slate-400 block">{storeSettings.currency}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
