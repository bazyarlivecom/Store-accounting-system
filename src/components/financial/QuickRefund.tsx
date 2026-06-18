import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import DatePickerModule from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { User, Wallet, FileText, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import { getAccounts, getCashboxes, getPersons, addTransaction, addPerson } from '../../services/dataService';
import { Account, Cashbox, Person } from '../../types';

const DatePicker = (DatePickerModule as any).default || DatePickerModule;

export default function QuickRefund({ showNotification, onComplete }: { showNotification?: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void, onComplete?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);

  // Form State
  const [amount, setAmount] = useState('');
  const [resourceType, setResourceType] = useState<'bank' | 'cashbox'>('bank');
  const [resourceId, setResourceId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  
  // Person state
  const [personOption, setPersonOption] = useState<'select' | 'miscellaneous'>('miscellaneous');
  const [personId, setPersonId] = useState('');
  const [miscName, setMiscName] = useState('');

  const [date, setDate] = useState<string>(new Date().toLocaleDateString('fa-IR'));
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accs, cbs, pers] = await Promise.all([
        getAccounts(),
        getCashboxes(),
        getPersons()
      ]);
      setAccounts(accs as Account[]);
      setCashboxes(cbs as Cashbox[]);
      setPersons(pers as Person[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      showNotification?.('لطفاً مبلغ معتبری وارد کنید', 'error');
      return;
    }
    if (!resourceId) {
      showNotification?.('لطفاً منبع پرداخت را مشخص کنید', 'error');
      return;
    }
    if (personOption === 'select' && !personId) {
      showNotification?.('لطفاً شخص/مشتری را انتخاب کنید', 'error');
      return;
    }
    if (personOption === 'miscellaneous' && !miscName) {
      showNotification?.('لطفاً نام شخص متفرقه را وارد کنید', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let finalPersonId = personId;

      // Handle miscellaneous person
      if (personOption === 'miscellaneous') {
        const payload: Partial<Person> = {
          name: miscName,
          personType: 'real',
          role: 'customer',
          phone: '', // Not required
          cardNumber: cardNumber || undefined,
          additionalNotes: 'تولید شده خودکار به عنوان متفرقه جهت استرداد وجه'
        };
        const newP = await addPerson(payload);
        if (newP && newP.id) {
            finalPersonId = newP.id.toString();
        } else { // Fallback get all persons to find latest if return object doesn't have ID
            const ps = await getPersons();
            finalPersonId = ps[ps.length - 1].id.toString();
        }
      }

      await addTransaction({
        type: 'pay',
        resourceType,
        resourceId,
        personId: finalPersonId,
        amount: Number(amount),
        date: date || new Date().toLocaleDateString('fa-IR'),
        receiptNumber: `REF-${Math.floor(Math.random() * 100000)}`,
        description: description || `استرداد وجه بابت عودت متفرقه - ${cardNumber ? 'به کارت ' + cardNumber : ''}`
      });

      showNotification?.('استرداد وجه با موفقیت ثبت شد و از حساب کسر گردید.', 'success');
      
      // Reset form
      setAmount('');
      setResourceId('');
      setPersonOption('miscellaneous');
      setMiscName('');
      setPersonId('');
      setCardNumber('');
      setDescription('');
      
      onComplete?.();
      
    } catch (error) {
      console.error('Error submitting refund:', error);
      showNotification?.('خطا در ثبت استرداد وجه', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">در حال بارگذاری اطلاعات...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto" dir="rtl">
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
        <div className="bg-rose-50 text-rose-900 px-6 py-4 flex items-center gap-3 border-b border-rose-100">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm border border-rose-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black font-sans">استرداد سریع وجه (مشتری متفرقه)</h2>
            <p className="text-xs text-rose-700/80 mt-1">بازگشت سریع وجه کالا در پی عودت متفرقه بدون نیاز به ثبت فاکتور برگشتی و تعریف مشتری</p>
          </div>
        </div>

        <form onSubmit={handleRefundSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Amount */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-2">مبلغ عودت وجه (تومان) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  value={Number(amount || 0).toLocaleString()} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/,/g, '');
                    if (!isNaN(Number(val))) setAmount(val);
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 font-sans text-xl font-black text-rose-700 transition-all text-left"
                  dir="ltr"
                  placeholder="0"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">تومان</span>
              </div>
            </div>

            {/* Which Customer? */}
            <div className="md:col-span-2 bg-gray-50 p-4 border border-gray-100 rounded-xl space-y-4">
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-800">
                  <input type="radio" className="text-rose-600" checked={personOption === 'miscellaneous'} onChange={() => setPersonOption('miscellaneous')} />
                  مشتری متفرقه (جدید)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-800">
                  <input type="radio" className="text-indigo-600" checked={personOption === 'select'} onChange={() => setPersonOption('select')} />
                  تخصیص به یک مشتری موجود
                </label>
              </div>

              {personOption === 'miscellaneous' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">نام مشتری یا شخص <span className="text-rose-500">*</span></label>
                      <input 
                        required
                        type="text" 
                        value={miscName} 
                        onChange={e => setMiscName(e.target.value)} 
                        className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" 
                        placeholder="مثلا: آقای احمدی (خرید خرد)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                         شماره کارت واریزی <span className="text-gray-400 font-normal">اختیاری</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={cardNumber} 
                          onChange={e => setCardNumber(e.target.value.replace(/\\D/g, '').substring(0, 16))} 
                          className="w-full border rounded-xl px-4 py-2.5 pl-10 text-sm bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono tracking-widest text-left" 
                          dir="ltr"
                          placeholder="____ ____ ____ ____"
                        />
                        <CreditCard className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">انتخاب شخص <span className="text-rose-500">*</span></label>
                   <select required value={personId} onChange={e => setPersonId(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                     <option value="">-- انتخاب کنید --</option>
                     {persons.map(p => (
                       <option key={p.id} value={p.id}>{p.name} {p.personType === 'legal' ? '(حقوقی)' : ''}</option>
                     ))}
                   </select>
                </div>
              )}
            </div>

            {/* Payment Source */}
            <div className="md:col-span-2">
               <label className="block text-xs font-bold text-gray-700 mb-2">منبع کسر وجه <span className="text-rose-500">*</span></label>
               <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
                  <button type="button" onClick={() => {setResourceType('bank'); setResourceId('');}} className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 rounded-lg transition-all ${resourceType === 'bank' ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}>
                    <CreditCard className="w-4 h-4" /> بانک
                  </button>
                  <button type="button" onClick={() => {setResourceType('cashbox'); setResourceId('');}} className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 rounded-lg transition-all ${resourceType === 'cashbox' ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Banknote className="w-4 h-4" /> صندوق نقدی
                  </button>
                </div>

                <select required value={resourceId} onChange={e => setResourceId(e.target.value)} className="w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-gray-800">
                  <option value="">-- انتخاب {resourceType === 'bank' ? 'حساب بانکی' : 'صندوق'} --</option>
                  {(resourceType === 'bank' ? accounts : cashboxes).map((item: any) => (
                    <option key={item.id} value={item.id}>{item.bankName || item.name} (موجودی: {Number(item.balance).toLocaleString()} تومان)</option>
                  ))}
                </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">تاریخ ثبت <span className="text-rose-500">*</span></label>
              <div className="custom-datepicker-wrapper w-full">
                <DatePicker
                  value={date}
                  onChange={(d: any) => setDate(d?.format?.('YYYY/MM/DD') || '')}
                  calendar={persian}
                  locale={persian_fa}
                  calendarPosition="bottom-right"
                  render={(value: string, openCalendar: () => void) => (
                    <div className="relative cursor-pointer" onClick={openCalendar}>
                      <input 
                        readOnly 
                        value={value} 
                        className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" 
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">بابت / توضیحات</label>
              <input 
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" 
                placeholder="ارائه شده توسط مشتری به عنوان..."
              />
            </div>
            
          </div>

          <div className="pt-6 border-t mt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={submitting}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              {submitting ? 'در حال ثبت...' : (
                <>
                  <CheckCircle className="w-5 h-5" /> تایید و استرداد وجه
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
