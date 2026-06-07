import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, User, ShoppingCart, Calculator, CheckCircle, FilePlus, Calendar, List, Receipt, Search, DollarSign, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Select from "react-select";

// Type Definitions
type Person = { 
  id: number; 
  name: string; 
  firstName?: string;
  lastName?: string;
  companyName?: string;
  fatherName?: string;
  nationalId?: string;
  address?: string;
  personType: 'real' | 'legal';
  role: 'customer' | 'employee' | 'supplier'; 
  phone: string; 
};
type Product = { id: number; name: string; price: number; type: 'product' | 'service'; category: string };

type InvoiceItem = {
  id: string;
  productId: number | '';
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  totalPrice: number;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'products' | 'persons'>('create');
  
  const [persons, setPersons] = useState<Person[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [invoiceMode, setInvoiceMode] = useState<'auto' | 'manual'>('auto');
  const [invoiceTitle, setInvoiceTitle] = useState('فاکتور فروش کالا');
  const [currency, setCurrency] = useState<'IRT' | 'IRR' | 'USD'>('IRT');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState<Date | any>(new Date());
  const [customerId, setCustomerId] = useState<number | ''>('');
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Product state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductType, setNewProductType] = useState<'product' | 'service'>('product');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Person state
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [newPersonType, setNewPersonType] = useState<'real' | 'legal'>('real');
  const [newPersonFirstName, setNewPersonFirstName] = useState('');
  const [newPersonLastName, setNewPersonLastName] = useState('');
  const [newPersonCompanyName, setNewPersonCompanyName] = useState('');
  const [newPersonFatherName, setNewPersonFatherName] = useState('');
  const [newPersonNationalId, setNewPersonNationalId] = useState('');
  const [newPersonAddress, setNewPersonAddress] = useState('');
  const [newPersonRole, setNewPersonRole] = useState<'customer' | 'employee' | 'supplier'>('customer');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  const [submittingPerson, setSubmittingPerson] = useState(false);

  // Fetch API data on mount
  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        setInvoices(await res.json());
      }
    } catch (error) {
      console.error('Error fetching invoices', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (error) {
      console.error('Error fetching products', error);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;
    
    setSubmittingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProductName, 
          price: Number(newProductPrice),
          type: newProductType,
          category: newProductCategory || 'عمومی'
        })
      });
      if (res.ok) {
        await fetchProducts();
        setNewProductName('');
        setNewProductPrice('');
        setNewProductType('product');
        setNewProductCategory('');
        setIsProductModalOpen(false);
        setSuccessMsg('کالا یا خدمات با موفقیت اضافه شد');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error('Error adding product', error);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('آیا از حذف این کالا اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product', error);
    }
  };

  const fetchPersons = async () => {
    try {
      const res = await fetch('/api/persons');
      if (res.ok) {
        setPersons(await res.json());
      }
    } catch (error) {
      console.error('Error fetching persons', error);
    }
  };

  const handleSubmitPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonType === 'real' && (!newPersonFirstName || !newPersonLastName)) return;
    if (newPersonType === 'legal' && !newPersonCompanyName) return;
    
    setSubmittingPerson(true);
    try {
      const res = await fetch('/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          personType: newPersonType,
          firstName: newPersonFirstName,
          lastName: newPersonLastName,
          companyName: newPersonCompanyName,
          fatherName: newPersonFatherName,
          nationalId: newPersonNationalId,
          address: newPersonAddress,
          role: newPersonRole,
          phone: newPersonPhone
        })
      });
      if (res.ok) {
        await fetchPersons();
        setNewPersonFirstName('');
        setNewPersonLastName('');
        setNewPersonCompanyName('');
        setNewPersonFatherName('');
        setNewPersonNationalId('');
        setNewPersonAddress('');
        setNewPersonPhone('');
        setNewPersonRole('customer');
        setIsPersonModalOpen(false);
        setSuccessMsg('شخص با موفقیت اضافه شد');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error('Error adding person', error);
    } finally {
      setSubmittingPerson(false);
    }
  };

  const handleDeletePerson = async (id: number) => {
    if (!confirm('آیا از حذف این شخص اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/persons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPersons();
      }
    } catch (error) {
      console.error('Error deleting person', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchPersons(),
          fetchProducts()
        ]);
        
        await fetchInvoices();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initialize with one empty row
    handleAddItem();
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: Math.random().toString(36).substring(7),
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        totalPrice: 0
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Special handling for product selection to auto-fill details
          if (field === 'productId' && value !== '') {
            const product = products.find(p => p.id === Number(value));
            if (product) {
              updatedItem.productName = product.name;
              updatedItem.unitPrice = product.price;
              const subtotal = product.price * updatedItem.quantity;
              updatedItem.totalPrice = Math.max(0, subtotal * (1 - (updatedItem.discountPercent / 100)));
            }
          }

          // Special handling for pricing calculation
          if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent') {
            const qty = field === 'quantity' ? Number(value) : Number(updatedItem.quantity);
            const price = field === 'unitPrice' ? Number(value) : Number(updatedItem.unitPrice);
            const discPercent = field === 'discountPercent' ? Number(value) : Number(updatedItem.discountPercent);
            
            const subtotal = qty * price;
            const total = subtotal * (1 - (discPercent / 100));
            updatedItem.totalPrice = total > 0 ? total : 0;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const submitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    // Basic validation
    if (!customerId || items.length === 0 || items.some(i => i.productId === '')) {
      alert('لطفاً همه فیلدهای ضروری را پر کنید.');
      setSubmitting(false);
      return;
    }

    const finalInvoiceNumber = invoiceMode === 'auto' ? `INV-${Math.floor(Math.random() * 1000000)}` : invoiceNumber;

    const payload = {
      invoiceNumber: finalInvoiceNumber,
      title: invoiceTitle,
      currency,
      date: typeof date.toDate === 'function' ? date.toDate().toISOString() : new Date(date).toISOString(),
      jalaliDate: new Date(date).toLocaleDateString('fa-IR'),
      customerId,
      items,
      overallDiscountPercent,
      totalAmount: calculateFinalTotal()
    };

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccessMsg(data.message || 'فاکتور با موفقیت ثبت شد!');
        await fetchInvoices();
        
        // Reset form after short delay
        setTimeout(() => {
          if (invoiceMode === 'manual') setInvoiceNumber('');
          setCustomerId('');
          setItems([]);
          setOverallDiscountPercent(0);
          handleAddItem();
          setSuccessMsg('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting invoice:', error);
      alert('خطا در ارتباط با سرور.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal();
    const final = subtotal * (1 - (overallDiscountPercent / 100));
    return final > 0 ? final : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const currencyLabel = currency === 'IRT' ? 'تومان' : currency === 'IRR' ? 'ریال' : 'دلار';

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium text-lg">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full ml-3" />
        در حال بارگذاری اطلاعات ...
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto font-sans">
      
      {/* Header and Tabs */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-indigo-600" />
            سیستم مدیریت فاکتور
          </h1>
          <p className="mt-2 text-gray-500 text-sm">ثبت و مدیریت فاکتورهای فروش</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'create' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <FilePlus className="w-4 h-4" />
            ثبت فاکتور جدید
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'list' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <List className="w-4 h-4" />
            لیست فاکتورها
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'products' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <Package className="w-4 h-4" />
            مدیریت کالاها
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('persons')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'persons' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <User className="w-4 h-4" />
            مدیریت اشخاص
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
      <form onSubmit={submitInvoice} className="space-y-6">
        
        {/* Document Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Invoice Title */}
            <div className="lg:col-span-4 pb-2 border-b border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                عنوان فاکتور
              </label>
              <input
                type="text"
                value={invoiceTitle}
                onChange={(e) => setInvoiceTitle(e.target.value)}
                placeholder="مثال: فاکتور فروش تجهیزات کامپیوتری"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm bg-gray-50 focus:bg-white text-gray-900 text-lg font-medium"
                required
              />
            </div>
            
            {/* Customer Dropdown */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                مشتری / طرف حساب
              </label>
              <Select
                isRtl
                isSearchable={true}
                value={customerId ? { value: customerId, label: persons.find(c => c.id === customerId)?.name } : null}
                onChange={(option: any) => setCustomerId(option ? option.value : '')}
                options={persons.map(c => ({ value: c.id, label: `${c.name} (${c.role === 'customer' ? 'مشتری' : c.role === 'supplier' ? 'تامین کننده' : 'کارمند'})` }))}
                placeholder="انتخاب یا جستجو..."
                noOptionsMessage={() => "نتیجه‌ای یافت نشد"}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '0.15rem',
                    backgroundColor: '#f9fafb',
                    borderColor: '#e5e7eb',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  })
                }}
                className="text-gray-900 w-full"
              />
            </div>
            
            {/* Invoice Number */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 border-r-0">
                  <FilePlus className="w-4 h-4 text-gray-400" />
                  شماره فاکتور
                </div>
                <button
                  type="button"
                  onClick={() => setInvoiceMode(m => m === 'auto' ? 'manual' : 'auto')}
                  className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  {invoiceMode === 'auto' ? 'تولید خودکار' : 'ورود دستی'}
                </button>
              </label>
              <input
                type="text"
                value={invoiceMode === 'auto' ? '' : invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder={invoiceMode === 'auto' ? 'تولید خودکار' : 'مثال: 1402-001'}
                disabled={invoiceMode === 'auto'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm bg-gray-50 focus:bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                required={invoiceMode === 'manual'}
              />
            </div>

            {/* Date */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-gray-400" />
                تاریخ صدور
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={date}
                onChange={(dateObject: any) => {
                  if (dateObject) {
                    setDate(dateObject.toDate());
                  }
                }}
                format="YYYY/MM/DD"
                calendarPosition="bottom-right"
                inputClass="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm bg-gray-50 focus:bg-white text-gray-900"
                containerClassName="w-full mb-1"
              />
              <div className="text-[11px] text-gray-500 text-left font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block w-full" dir="ltr">
                میلادی: {date ? new Date(date).toISOString().split('T')[0] : ''}
              </div>
            </div>

            {/* Currency */}
            <div className="lg:col-span-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">تنظیمات مالی</span>
                <span className="text-xs text-gray-500">واحد پولی فاکتور را انتخاب کنید</span>
              </div>
              
              <div className="flex bg-gray-50 border border-gray-200 p-1 rounded-xl w-fit">
                {(['IRT', 'IRR', 'USD'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all border border-transparent ${
                      currency === c ? 'bg-white shadow-sm text-indigo-700 border-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                  >
                    {c === 'IRT' ? 'تومان' : c === 'IRR' ? 'ریال' : 'دلار'}
                  </button>
                ))}
              </div>
            </div>
            
          </div>
        </div>

        {/* Items Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-500" />
              اقلام فاکتور
            </h2>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-right whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="text-sm font-medium text-gray-500 border-b border-gray-100">
                  <th className="pb-4 pt-2 pr-2 font-medium w-12 text-center">ردیف</th>
                  <th className="pb-4 pt-2 pr-4 font-medium w-1/3">نام کالا (جستجو)</th>
                  <th className="pb-4 pt-2 pr-4 font-medium w-24">تعداد</th>
                  <th className="pb-4 pt-2 pr-4 font-medium w-36">فی واحد</th>
                  <th className="pb-4 pt-2 pr-4 font-medium w-36">تخفیف (٪)</th>
                  <th className="pb-4 pt-2 pr-4 font-medium w-40">جمع خط ({currencyLabel})</th>
                  <th className="pb-4 pt-2 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 text-center text-gray-400 font-medium">
                        {formatNumber(index + 1)}
                      </td>
                      <td className="py-4 pr-4">
                        <Select
                          isRtl
                          isSearchable={true}
                          value={item.productId ? { value: item.productId, label: item.productName || products.find(p => p.id === item.productId)?.name } : null}
                          onChange={(option: any) => handleItemChange(item.id, 'productId', option ? option.value : '')}
                          options={products.map(p => ({ value: p.id, label: p.name }))}
                          placeholder="جستجوی کالا..."
                          noOptionsMessage={() => "کالایی یافت نشد"}
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderRadius: '0.5rem',
                              borderColor: '#e5e7eb',
                              minHeight: '42px'
                            }),
                            menu: (base) => ({ ...base, zIndex: 50 }),
                            menuPortal: base => ({ ...base, zIndex: 9999 })
                          }}
                          menuPortalTarget={document.body}
                          className="w-full text-sm shadow-sm"
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-sm text-center"
                          required
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-sm"
                            required
                          />
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent}
                            onChange={(e) => handleItemChange(item.id, 'discountPercent', Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-sm text-red-500 pr-8"
                          />
                          <span className="absolute right-3 top-2.5 text-gray-400 text-sm">%</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                         <div className="flex flex-col w-full px-3 py-1.5 rounded-lg border border-transparent bg-gray-50 min-h-[42px] justify-center">
                            {item.discountPercent > 0 && (
                              <span className="text-[10px] text-gray-400 line-through leading-none mb-0.5">
                                {formatCurrency(item.quantity * item.unitPrice)}
                              </span>
                            )}
                            <span className="text-gray-700 font-semibold text-sm leading-none">
                              {formatCurrency(item.totalPrice)}
                            </span>
                         </div>
                      </td>
                      <td className="py-4 pl-4 text-left">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                          title="حذف این ردیف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-white">
             <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-2 px-4 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                افزودن سطر جدید
              </button>
          </div>
        </div>

        {/* Footer / Summary */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mt-8">
          
          <div className="w-full lg:w-1/3 space-y-4">
            {/* Success Message Banner */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-200 shadow-sm"
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  ثبت نهایی فاکتور
                </>
              )}
            </button>
          </div>

          <div className="w-full lg:w-2/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6">
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">تخفیف روی جمع کل فاکتور</label>
                  <div className="relative">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={overallDiscountPercent}
                        onChange={(e) => setOverallDiscountPercent(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-gray-50 focus:bg-white text-gray-900 pr-10"
                        placeholder="درصد تخفیف"
                      />
                      <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">%</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-end min-w-[250px] border-t sm:border-t-0 sm:border-r border-gray-100 pt-4 sm:pt-0 sm:pr-6">
                <div className="flex justify-between items-center text-gray-500 text-sm mb-2">
                  <span>جمع خطوط:</span>
                  <span>{formatCurrency(calculateSubtotal())} {currencyLabel}</span>
                </div>
                {overallDiscountPercent > 0 && (
                  <div className="flex justify-between items-center text-red-500 text-sm mb-2 font-medium">
                    <span>کسر تخفیف کلی ({overallDiscountPercent}٪):</span>
                    <span>{formatCurrency(calculateSubtotal() * (overallDiscountPercent / 100))} {currencyLabel}</span>
                  </div>
                )}
                <div className="flex flex-col border-t border-gray-100 pt-3 mt-1">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Calculator className="w-4 h-4" />
                    <span className="text-sm font-semibold text-gray-800">مبلغ قابل پرداخت:</span>
                  </div>
                  <div className="text-3xl font-bold divide-x divide-x-reverse flex items-baseline gap-2 text-gray-900 mt-1">
                    <span className="tracking-tight text-indigo-600">{formatCurrency(calculateFinalTotal())}</span>
                    <span className="text-sm font-medium text-gray-500 mr-2 pr-2 border-r border-gray-200">{currencyLabel}</span>
                  </div>
                </div>
              </div>

          </div>
          
        </div>
      </form>
      ) : activeTab === 'list' ? (
        /* Invoice List */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <List className="w-5 h-5 text-indigo-500" />
              لیست فاکتورهای ثبت شده
            </h2>
          </div>
          
          <div className="p-0 overflow-x-auto">
            {invoices.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>هیچ فاکتوری یافت نشد.</p>
              </div>
            ) : (
              <table className="w-full text-right whitespace-nowrap min-w-[800px]">
                <thead>
                  <tr className="text-sm font-medium text-gray-500 border-b border-gray-100 bg-gray-50/30">
                    <th className="py-4 px-6 text-right">عنوان</th>
                    <th className="py-4 px-6 text-right">شماره فاکتور</th>
                    <th className="py-4 px-6 text-right">تاریخ میلادی</th>
                    <th className="py-4 px-6 text-right">تاریخ شمسی</th>
                    <th className="py-4 px-6 text-right">مشتری</th>
                    <th className="py-4 px-6 text-right">تعداد اقلام</th>
                    <th className="py-4 px-6 text-right">مبلغ پرداختی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900 border-r-2 border-transparent">
                        {inv.title || 'فاکتور بدون عنوان'}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-sm" dir="ltr">
                        {inv.date ? new Date(inv.date).toISOString().split('T')[0] : ''}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {inv.jalaliDate || (inv.date && new Date(inv.date).toLocaleDateString('fa-IR'))}
                      </td>
                      <td className="py-4 px-6 text-gray-800 font-medium">
                        {inv.customerName}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {formatNumber(inv.items?.length || 0)} قلم
                      </td>
                      <td className="py-4 px-6 text-indigo-600 font-semibold bg-gray-50/50">
                        {formatCurrency(inv.totalAmount)} {inv.currency === 'USD' ? 'دلار' : inv.currency === 'IRR' ? 'ریال' : 'تومان'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : activeTab === 'products' ? (
        /* Products List & Manage */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" />
              مدیریت کالا / خدمات
            </h2>
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              ثبت جدید
            </button>
          </div>
          
          {successMsg && (
            <div className="mx-6 mt-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 border border-green-100">
              <CheckCircle className="w-5 h-5" />
              {successMsg}
            </div>
          )}
          
          <div className="p-0 overflow-x-auto">
            {products.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>هیچ کالایی یافت نشد.</p>
              </div>
            ) : (
              <table className="w-full text-right whitespace-nowrap min-w-[600px]">
                <thead>
                  <tr className="text-sm font-medium text-gray-500 border-b border-gray-100 bg-gray-50/30">
                    <th className="py-4 px-6 text-right">ردیف</th>
                    <th className="py-4 px-6 text-right">نام کالا / خدمات</th>
                    <th className="py-4 px-6 text-right">نوع</th>
                    <th className="py-4 px-6 text-right">گروه‌بندی</th>
                    <th className="py-4 px-6 text-right">قیمت پایه (تومان)</th>
                    <th className="py-4 px-6 w-24">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p, index) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-500 w-16 text-center">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900 border-r-2 border-transparent hover:border-indigo-500">
                        {p.name}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        <span className={`px-2 py-1 rounded inline-flex items-center gap-1.5 ${p.type === 'service' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                          {p.type === 'service' ? 'خدمات' : 'کالا'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {p.category}
                      </td>
                      <td className="py-4 px-6 text-indigo-600 font-medium">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                          title="حذف کالا"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : activeTab === 'persons' ? (
        /* Persons List & Manage */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              مدیریت اشخاص
            </h2>
            <button
              onClick={() => setIsPersonModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              ثبت جدید
            </button>
          </div>
          
          {successMsg && (
            <div className="mx-6 mt-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 border border-green-100">
              <CheckCircle className="w-5 h-5" />
              {successMsg}
            </div>
          )}
          
          <div className="p-0 overflow-x-auto">
            {persons.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>هیچ شخصی یافت نشد.</p>
              </div>
            ) : (
              <table className="w-full text-right whitespace-nowrap min-w-[800px]">
                <thead>
                  <tr className="text-sm font-medium text-gray-500 border-b border-gray-100 bg-gray-50/30">
                    <th className="py-4 px-6 text-right">ردیف</th>
                    <th className="py-4 px-6 text-right">نام / عنوان</th>
                    <th className="py-4 px-6 text-right">نوع کاربر</th>
                    <th className="py-4 px-6 text-right">کد / شناسه ملی</th>
                    <th className="py-4 px-6 text-right">نقش</th>
                    <th className="py-4 px-6 text-right">شماره تماس</th>
                    <th className="py-4 px-6 w-24">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {persons.map((p, index) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-500 w-16 text-center">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900 border-r-2 border-transparent hover:border-indigo-500">
                        {p.name}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {p.personType === 'legal' ? 'حقوقی' : 'حقیقی'}
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-mono text-sm" dir="ltr">
                        {p.nationalId || '-'}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        <span className={`px-2 py-1 rounded inline-flex items-center gap-1.5 ${p.role === 'customer' ? 'bg-indigo-50 text-indigo-700' : p.role === 'supplier' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'}`}>
                          {p.role === 'customer' ? 'مشتری' : p.role === 'supplier' ? 'تامین کننده' : 'کارمند'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-mono text-sm" dir="ltr">
                        {p.phone || '-'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDeletePerson(p.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                          title="حذف شخص"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : null}

      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-500" />
                  ثبت کالا / خدمات جدید
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="productForm" onSubmit={handleSubmitProduct} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام کالا / خدمت <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="مثال: طراحی رابط کاربری"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                        required
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        قیمت پایه (تومان) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        placeholder="مثال: 1500000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                        required
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع
                      </label>
                      <select
                        value={newProductType}
                        onChange={(e) => setNewProductType(e.target.value as 'product' | 'service')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 bg-white"
                      >
                        <option value="product">کالا</option>
                        <option value="service">خدمات</option>
                      </select>
                    </div>
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        گروه‌بندی
                      </label>
                      <input
                        type="text"
                        value={newProductCategory}
                        onChange={(e) => setNewProductCategory(e.target.value)}
                        placeholder="مثال: کالای دیجیتال"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors shadow-sm"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="productForm"
                  disabled={submittingProduct}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingProduct ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>ثبت کالا / خدمات</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isPersonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-3xl max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  ثبت شخص جدید
                </h3>
                <button
                  onClick={() => setIsPersonModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="personForm" onSubmit={handleSubmitPerson} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع شخص
                      </label>
                      <select
                        value={newPersonType}
                        onChange={(e) => setNewPersonType(e.target.value as 'real' | 'legal')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 bg-white"
                      >
                        <option value="real">حقیقی (فرد)</option>
                        <option value="legal">حقوقی (شرکت)</option>
                      </select>
                    </div>
                    
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نقش
                      </label>
                      <select
                        value={newPersonRole}
                        onChange={(e) => setNewPersonRole(e.target.value as 'customer' | 'employee' | 'supplier')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 bg-white"
                      >
                        <option value="customer">مشتری</option>
                        <option value="supplier">تامین کننده</option>
                        <option value="employee">کارمند</option>
                      </select>
                    </div>
                    
                    {newPersonType === 'real' ? (
                      <>
                        <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نام <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newPersonFirstName}
                            onChange={(e) => setNewPersonFirstName(e.target.value)}
                            placeholder="نام"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                            required
                          />
                        </div>
                        <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نام خانوادگی <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newPersonLastName}
                            onChange={(e) => setNewPersonLastName(e.target.value)}
                            placeholder="نام خانوادگی"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                            required
                          />
                        </div>
                        <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نام پدر
                          </label>
                          <input
                            type="text"
                            value={newPersonFatherName}
                            onChange={(e) => setNewPersonFatherName(e.target.value)}
                            placeholder="اختیاری"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                          />
                        </div>
                        <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            کد ملی
                          </label>
                          <input
                            type="text"
                            value={newPersonNationalId}
                            onChange={(e) => setNewPersonNationalId(e.target.value)}
                            placeholder="کد ملی 10 رقمی"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900 text-left"
                            dir="ltr"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-full text-right md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نام شرکت / سازمان <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newPersonCompanyName}
                            onChange={(e) => setNewPersonCompanyName(e.target.value)}
                            placeholder="مثال: شرکت توسعه تجارت البرز"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                            required
                          />
                        </div>
                        <div className="w-full text-right md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            شناسه ملی شرکت
                          </label>
                          <input
                            type="text"
                            value={newPersonNationalId}
                            onChange={(e) => setNewPersonNationalId(e.target.value)}
                            placeholder="شناسه ملی"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900 text-left"
                            dir="ltr"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="w-full text-right md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره تماس
                      </label>
                      <input
                        type="text"
                        value={newPersonPhone}
                        onChange={(e) => setNewPersonPhone(e.target.value)}
                        placeholder="مثال: 09120000000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900 text-left"
                        dir="ltr"
                      />
                    </div>
                    
                    <div className="w-full text-right md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        آدرس
                      </label>
                      <input
                        type="text"
                        value={newPersonAddress}
                        onChange={(e) => setNewPersonAddress(e.target.value)}
                        placeholder="تهران، خیابان..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsPersonModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors shadow-sm"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="personForm"
                  disabled={submittingPerson}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingPerson ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>ثبت شخص</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

