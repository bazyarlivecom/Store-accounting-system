import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, FileText, User, ShoppingCart, Calculator, CheckCircle, FilePlus, Calendar, List, Receipt, Search, DollarSign, Package, X, RefreshCw, Menu, Github, CreditCard, Wallet, Store, Settings, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
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

type Account = {
  id: number;
  bankName: string;
  branchName?: string;
  accountNumber?: string;
  cardNumber?: string;
  shebaNumber?: string;
  balance: number;
  accountHolder?: string;
};

type Cashbox = {
  id: number;
  name: string;
  manager?: string;
  balance: number;
};

type InvoiceItem = {
  id: string;
  productId: number | '';
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  totalPrice: number;
};

const getBaseValueInToman = (cur: string) => {
  if (!cur) return 1;
  if (cur.includes('تومان')) return 1;
  if (cur.includes('ریال')) return 0.1;
  if (cur.includes('دلار') || cur.includes('USD')) return 70000;
  if (cur.includes('یورو') || cur.includes('EUR')) return 75000;
  if (cur.includes('درهم') || cur.includes('AED')) return 19000;
  return 1;
};

const getDefaultExchangeRate = (invoiceCur: string, storeCur: string) => {
  if (invoiceCur === storeCur) return 1;
  const invToman = getBaseValueInToman(invoiceCur);
  const storeToman = getBaseValueInToman(storeCur);
  return invToman / storeToman;
};

const showInvoiceCurrency = (c: string) => {
  if (!c) return 'تومان';
  if (c === 'IRT' || c === 'toman') return 'تومان';
  if (c === 'IRR' || c === 'rial') return 'ریال';
  if (c === 'USD' || c === 'dollar') return 'دلار';
  return c;
};

export default function App() {
  const [activeTab, setActiveTab ] = useState<'create_sale' | 'create_purchase' | 'list_sale' | 'list_purchase' | 'create_receive_receipt' | 'list_receive_receipt' | 'create_pay_receipt' | 'list_pay_receipt' | 'products' | 'persons' | 'accounts' | 'cashboxes' | 'update' | 'settings' | 'financial_report' | 'person_ledger'>('create_sale');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'create_sale') {
      setInvoiceType('sale');
      setInvoiceTitle('فاکتور فروش کالا');
    } else if (activeTab === 'create_purchase') {
      setInvoiceType('purchase');
      setInvoiceTitle('فاکتور خرید کالا');
    }
  }, [activeTab]);
  
  const [persons, setPersons] = useState<Person[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [storeSettings, setStoreSettings] = useState({ name: 'فروشگاه پیش‌فرض', address: '', phone: '', logoUrl: '', currency: 'تومان' });
  const [loading, setLoading] = useState(true);

  // Receipts & Payments Form State
  const [receiptPersonId, setReceiptPersonId] = useState<number | ''>('');
  const [receiptDate, setReceiptDate] = useState<Date | any>(new Date());
  const [receiptAmount, setReceiptAmount] = useState<string>('');
  const [receiptResourceType, setReceiptResourceType] = useState<'bank' | 'cashbox'>('bank');
  const [receiptResourceId, setReceiptResourceId] = useState<number | ''>('');
  const [receiptDescription, setReceiptDescription] = useState<string>('');
  const [submittingReceipt, setSubmittingReceipt] = useState<boolean>(false);
  const [receiptSuccessMsg, setReceiptSuccessMsg] = useState<string>('');

  // Person Ledger state
  const [ledgerPersonId, setLedgerPersonId] = useState<number | ''>('');

  // Update State
  const [updatingStr, setUpdatingStr] = useState(false);
  const [updateLog, setUpdateLog] = useState('');

  // Form State
  const [invoiceType, setInvoiceType] = useState<'sale' | 'purchase'>('sale');
  const [listFilter, setListFilter] = useState<'all' | 'sale' | 'purchase'>('all');
  const [invoiceMode, setInvoiceMode] = useState<'auto' | 'manual'>('auto');
  const [invoiceTitle, setInvoiceTitle] = useState('فاکتور فروش کالا');
  const [invoiceCurrency, setInvoiceCurrency] = useState<string>('تومان');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [exchangeRateInput, setExchangeRateInput] = useState<string>('1');
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

  // Bank Account modal & form state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [newAccountBankName, setNewAccountBankName] = useState('');
  const [newAccountBranchName, setNewAccountBranchName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountCardNumber, setNewAccountCardNumber] = useState('');
  const [newAccountShebaNumber, setNewAccountShebaNumber] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountHolder, setNewAccountHolder] = useState('');
  const [submittingAccount, setSubmittingAccount] = useState(false);

  // Cashbox modal & form state
  const [isCashboxModalOpen, setIsCashboxModalOpen] = useState(false);
  const [newCashboxName, setNewCashboxName] = useState('');
  const [newCashboxManager, setNewCashboxManager] = useState('');
  const [newCashboxBalance, setNewCashboxBalance] = useState('');
  const [submittingCashbox, setSubmittingCashbox] = useState(false);

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingPersonId, setEditingPersonId] = useState<number | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);
  const [editingCashboxId, setEditingCashboxId] = useState<number | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ name: '', address: '', phone: '', logoUrl: '', currency: 'تومان' });
  const [submittingSettings, setSubmittingSettings] = useState(false);

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
      const isEdit = editingProductId !== null;
      const url = isEdit ? `/api/products/${editingProductId}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
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
        setEditingProductId(null);
        setIsProductModalOpen(false);
        setSuccessMsg(isEdit ? 'کالا با موفقیت ویرایش شد' : 'کالا یا خدمات با موفقیت اضافه شد');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error('Error saving product', error);
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
      const isEdit = editingPersonId !== null;
      const url = isEdit ? `/api/persons/${editingPersonId}` : '/api/persons';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
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
        setEditingPersonId(null);
        setIsPersonModalOpen(false);
        setSuccessMsg(isEdit ? 'شخص با موفقیت ویرایش شد' : 'شخص با موفقیت اضافه شد');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error('Error saving person', error);
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

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        setAccounts(await res.json());
      }
    } catch (error) {
      console.error('Error fetching accounts', error);
    }
  };

  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountBankName) return;
    setSubmittingAccount(true);
    try {
      const isEdit = editingAccountId !== null;
      const url = isEdit ? `/api/accounts/${editingAccountId}` : '/api/accounts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: newAccountBankName,
          branchName: newAccountBranchName,
          accountNumber: newAccountNumber,
          cardNumber: newAccountCardNumber,
          shebaNumber: newAccountShebaNumber,
          balance: Number(newAccountBalance) || 0,
          accountHolder: newAccountHolder
        })
      });
      if (res.ok) {
        await fetchAccounts();
        setNewAccountBankName('');
        setNewAccountBranchName('');
        setNewAccountNumber('');
        setNewAccountCardNumber('');
        setNewAccountShebaNumber('');
        setNewAccountBalance('');
        setNewAccountHolder('');
        setEditingAccountId(null);
        setIsAccountModalOpen(false);
        setSuccessMsg(isEdit ? 'حساب بانکی با موفقیت ویرایش شد' : 'حساب بانکی با موفقیت ثبت شد');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error('Error saving account', error);
    } finally {
      setSubmittingAccount(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('آیا از حذف این حساب بانکی اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAccounts();
      }
    } catch (error) {
      console.error('Error deleting account', error);
    }
  };

  const fetchCashboxes = async () => {
    try {
      const res = await fetch('/api/cashboxes');
      if (res.ok) {
        setCashboxes(await res.json());
      }
    } catch (error) {
      console.error('Error fetching cashboxes', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  const handleSubmitReceipt = async (type: 'receive' | 'pay', e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptPersonId || !receiptAmount || !receiptResourceType || !receiptResourceId) {
      alert('لطفا تمام اطلاعات الزامی فرم را وارد کنید.');
      return;
    }

    setSubmittingReceipt(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          personId: Number(receiptPersonId),
          amount: Number(receiptAmount),
          date: typeof receiptDate.toDate === 'function' ? receiptDate.toDate().toISOString() : new Date(receiptDate).toISOString(),
          jalaliDate: new Date(receiptDate).toLocaleDateString('fa-IR'),
          resourceType: receiptResourceType,
          resourceId: Number(receiptResourceId),
          description: receiptDescription
        })
      });

      if (res.ok) {
        setReceiptSuccessMsg(type === 'receive' ? 'رسید دریافت با موفقیت صادر شد' : 'رسید پرداخت با موفقیت صادر شد');
        setReceiptPersonId('');
        setReceiptAmount('');
        setReceiptResourceType('bank');
        setReceiptResourceId('');
        setReceiptDescription('');
        setReceiptDate(new Date());
        
        await Promise.all([
          fetchTransactions(),
          fetchAccounts(),
          fetchCashboxes()
        ]);

        setTimeout(() => {
          setReceiptSuccessMsg('');
        }, 3000);
      } else {
        const err = await res.json();
        alert(err.message || 'خطایی رخ داد');
      }
    } catch (error) {
      console.error('Error submitting receipt', error);
      alert('خطایی در ارتباط با سرور رخ داد');
    } finally {
      setSubmittingReceipt(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('آیا از حذف این سند اطمینان دارید؟ مانده حساب مربوطه اصلاح خواهد شد.')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await Promise.all([
          fetchTransactions(),
          fetchAccounts(),
          fetchCashboxes()
        ]);
      }
    } catch (error) {
      console.error('Error deleting transaction', error);
    }
  };

  const handleSubmitCashbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashboxName) return;
    setSubmittingCashbox(true);
    try {
      const isEdit = editingCashboxId !== null;
      const url = isEdit ? `/api/cashboxes/${editingCashboxId}` : '/api/cashboxes';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCashboxName,
          manager: newCashboxManager,
          balance: Number(newCashboxBalance) || 0
        })
      });
      if (res.ok) {
        await fetchCashboxes();
        setNewCashboxName('');
        setNewCashboxManager('');
        setNewCashboxBalance('');
        setEditingCashboxId(null);
        setIsCashboxModalOpen(false);
        setSuccessMsg(isEdit ? 'صندوق با موفقیت ویرایش شد' : 'صندوق با موفقیت ثبت شد');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error('Error saving cashbox', error);
    } finally {
      setSubmittingCashbox(false);
    }
  };

  const handleDeleteCashbox = async (id: number) => {
    if (!confirm('آیا از حذف این صندوق اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/cashboxes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCashboxes();
      }
    } catch (error) {
      console.error('Error deleting cashbox', error);
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setNewProductName(p.name);
    setNewProductPrice(p.price.toString());
    setNewProductType(p.type);
    setNewProductCategory(p.category);
    setIsProductModalOpen(true);
  };

  const handleEditPerson = (p: Person) => {
    setEditingPersonId(p.id);
    setNewPersonType(p.personType);
    setNewPersonFirstName(p.firstName || '');
    setNewPersonLastName(p.lastName || '');
    setNewPersonCompanyName(p.companyName || '');
    setNewPersonFatherName(p.fatherName || '');
    setNewPersonNationalId(p.nationalId || '');
    setNewPersonAddress(p.address || '');
    setNewPersonPhone(p.phone || '');
    setNewPersonRole(p.role);
    setIsPersonModalOpen(true);
  };

  const handleEditAccount = (acc: Account) => {
    setEditingAccountId(acc.id);
    setNewAccountBankName(acc.bankName);
    setNewAccountBranchName(acc.branchName || '');
    setNewAccountNumber(acc.accountNumber || '');
    setNewAccountCardNumber(acc.cardNumber || '');
    setNewAccountShebaNumber(acc.shebaNumber || '');
    setNewAccountBalance(acc.balance.toString());
    setNewAccountHolder(acc.accountHolder || '');
    setIsAccountModalOpen(true);
  };

  const handleEditCashbox = (box: Cashbox) => {
    setEditingCashboxId(box.id);
    setNewCashboxName(box.name);
    setNewCashboxManager(box.manager || '');
    setNewCashboxBalance(box.balance.toString());
    setIsCashboxModalOpen(true);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setStoreSettings(data);
        setSettingsForm(data);
        setInvoiceCurrency(data.currency || 'تومان');
        setExchangeRate(1);
        setExchangeRateInput('1');
      }
    } catch (error) {
      console.error('Error fetching settings', error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        await fetchSettings();
        setSuccessMsg('تنظیمات فروشگاه با موفقیت ذخیره شد');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings', error);
    } finally {
      setSubmittingSettings(false);
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    const oldRate = exchangeRate;
    const newRate = getDefaultExchangeRate(newCurrency, storeSettings.currency);
    setInvoiceCurrency(newCurrency);
    setExchangeRate(newRate);
    setExchangeRateInput(newRate.toString());
    
    if (oldRate > 0 && newRate > 0) {
      setItems(prevItems => 
        prevItems.map(item => {
          const updatedPrice = item.unitPrice * (oldRate / newRate);
          const subtotal = item.quantity * updatedPrice;
          const total = subtotal * (1 - (item.discountPercent / 100));
          return {
            ...item,
            unitPrice: Number(updatedPrice.toFixed(4)),
            totalPrice: Number(total.toFixed(4))
          };
        })
      );
    }
  };

  const handleExchangeRateChange = (newRate: number) => {
    const oldRate = exchangeRate;
    setExchangeRate(newRate);
    
    if (oldRate > 0 && newRate > 0) {
      setItems(prevItems => 
        prevItems.map(item => {
          const updatedPrice = item.unitPrice * (oldRate / newRate);
          const subtotal = item.quantity * updatedPrice;
          const total = subtotal * (1 - (item.discountPercent / 100));
          return {
            ...item,
            unitPrice: Number(updatedPrice.toFixed(4)),
            totalPrice: Number(total.toFixed(4))
          };
        })
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchPersons(),
          fetchProducts(),
          fetchAccounts(),
          fetchCashboxes(),
          fetchSettings(),
          fetchTransactions()
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
              const convertedPrice = exchangeRate > 0 ? (product.price / exchangeRate) : product.price;
              updatedItem.unitPrice = Number(convertedPrice.toFixed(4));
              const subtotal = convertedPrice * updatedItem.quantity;
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
      type: invoiceType,
      currency: invoiceCurrency,
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
          setInvoiceCurrency(storeSettings.currency || 'تومان');
          setExchangeRate(1);
          setExchangeRateInput('1');
          setInvoiceType('sale');
          setInvoiceTitle('فاکتور فروش کالا');
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

  const currencyLabel = (activeTab === 'create_sale' || activeTab === 'create_purchase') ? invoiceCurrency : storeSettings.currency;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const handleSystemUpdate = async () => {
    setUpdatingStr(true);
    setUpdateLog('در حال بررسی و دریافت تغییرات از گیت‌هاب...');
    try {
      const res = await fetch('/api/system/update', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setUpdateLog(`بروزرسانی با موفقیت انجام شد.\n\n${data.output || ''}`);
        // Optionally reload the page after short delay
        setTimeout(() => window.location.reload(), 3000);
      } else {
        setUpdateLog(`خطا در بروزرسانی:\n${data.error || data.message}`);
      }
    } catch (error) {
      setUpdateLog(`خطای شبکه هنگام ارتباط با سرور.`);
    } finally {
      setUpdatingStr(false);
    }
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
    <div className="min-h-screen flex bg-gray-50/50 font-sans" dir="rtl">
      
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-white border-l border-gray-100 flex flex-col fixed md:sticky top-0 h-screen z-30 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col p-6 border-b border-gray-100 bg-gray-50/30">
          <div className="flex items-center gap-3">
            {storeSettings.logoUrl ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white border border-gray-100">
                <img src={storeSettings.logoUrl} alt={storeSettings.name} className="w-full h-full object-contain" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-indigo-600');
                  e.currentTarget.parentElement!.innerHTML = '<svg class="w-6 h-6 text-white overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M3 18h6"/></svg>';
                }} />
              </div>
            ) : (
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
                <Receipt className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight truncate max-w-[130px]" title={storeSettings.name}>{storeSettings.name || 'سیستم فاکتور'}</h1>
              <p className="text-xs text-gray-500 mt-1 font-medium">{storeSettings.phone ? `تلفن: ${storeSettings.phone}` : 'مدیریت جامع فروش'}</p>
            </div>
            <button 
              className="md:hidden mr-auto p-1 text-gray-400 hover:text-gray-600"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto w-full py-6 px-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">عملیات اصلی</div>
          <button
            type="button"
            onClick={() => { setActiveTab('create_sale'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'create_sale' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-r-4 border-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <ShoppingCart className="w-5 h-5 text-indigo-500" />
            ثبت فاکتور فروش
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('create_purchase'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'create_purchase' 
                ? 'bg-amber-50 text-amber-700 shadow-sm border-r-4 border-amber-600' 
                : 'text-gray-600 hover:text-amber-700 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <Receipt className="w-5 h-5 text-amber-500" />
            ثبت فاکتور خرید
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('list_sale'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'list_sale' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-r-4 border-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <List className="w-5 h-5 text-indigo-500" />
            لیست فاکتورهای فروش
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('list_purchase'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'list_purchase' 
                ? 'bg-amber-50 text-amber-700 shadow-sm border-r-4 border-amber-600' 
                : 'text-gray-600 hover:text-amber-700 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <FileText className="w-5 h-5 text-amber-500" />
            لیست فاکتورهای خرید
          </button>

          <div className="w-full h-px bg-gray-100 my-4"></div>
          <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider text-right">خزانه‌داری و امور مالی</div>

          <button
            type="button"
            onClick={() => { setActiveTab('create_receive_receipt'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'create_receive_receipt' 
                ? 'bg-emerald-50 text-emerald-700 shadow-sm border-r-4 border-emerald-600' 
                : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <Wallet className="w-5 h-5 text-emerald-500" />
            صدور رسید دریافت
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('list_receive_receipt'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'list_receive_receipt' 
                ? 'bg-emerald-50 text-emerald-700 shadow-sm border-r-4 border-emerald-600' 
                : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <List className="w-5 h-5 text-emerald-500" />
            لیست رسیدهای دریافت
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('create_pay_receipt'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'create_pay_receipt' 
                ? 'bg-rose-50 text-rose-700 shadow-sm border-r-4 border-rose-600' 
                : 'text-gray-600 hover:text-rose-800 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <CreditCard className="w-5 h-5 text-rose-500" />
            صدور رسید پرداخت
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('list_pay_receipt'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'list_pay_receipt' 
                ? 'bg-rose-50 text-rose-700 shadow-sm border-r-4 border-rose-600' 
                : 'text-gray-600 hover:text-rose-800 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <FileText className="w-5 h-5 text-rose-500" />
            لیست رسیدهای پرداخت
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('financial_report'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'financial_report' 
                ? 'bg-blue-50 text-blue-700 shadow-sm border-r-4 border-blue-600' 
                : 'text-gray-600 hover:text-blue-800 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-blue-500" />
            گزارش مالی و تراز
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('person_ledger'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'person_ledger' 
                ? 'bg-violet-50 text-violet-700 shadow-sm border-r-4 border-violet-600' 
                : 'text-gray-600 hover:text-violet-800 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <User className="w-5 h-5 text-violet-500" />
            کارت حساب اشخاص
          </button>

          <div className="w-full h-px bg-gray-100 my-4"></div>
          <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider text-right">اطلاعات پایه</div>

          <button
            type="button"
            onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'products' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-r-4 border-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <Package className="w-5 h-5" />
            مدیریت کالا / خدمات
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('persons'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'persons' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-r-4 border-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <User className="w-5 h-5" />
            مدیریت اشخاص
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('accounts'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'accounts' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-r-4 border-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            مدیریت حساب‌های بانکی
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('cashboxes'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'cashboxes' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-r-4 border-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50 border-r-4 border-transparent'
            }`}
          >
            <Wallet className="w-5 h-5" />
            مدیریت صندوق‌ها و تنخواه
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'settings' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
            }`}
          >
            <Settings className="w-4 h-4" />
            تنظیمات فروشگاه
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('update'); setIsSidebarOpen(false); }}
            className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'update' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
            }`}
          >
            <Github className="w-4 h-4" />
            بروزرسانی از گیت‌هاب
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">سیستم فاکتور</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">

      {(activeTab === 'create_sale' || activeTab === 'create_purchase') ? (
      <form onSubmit={submitInvoice} className="space-y-6">
        
        {/* Document Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Invoice Title */}
            <div className="lg:col-span-4 pb-2 border-b border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                {invoiceType === 'sale' ? 'عنوان فاکتور فروش' : 'عنوان فاکتور خرید'}
              </label>
              <input
                type="text"
                value={invoiceTitle}
                onChange={(e) => setInvoiceTitle(e.target.value)}
                placeholder={invoiceType === 'sale' ? 'مثال: فاکتور فروش تجهیزات کامپیوتری' : 'مثال: فاکتور خرید مواد اولیه'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm bg-gray-50 focus:bg-white text-gray-900 text-lg font-medium"
                required
              />
            </div>
            
            {/* Customer Dropdown */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                {invoiceType === 'sale' ? 'مشتری / خریدار' : 'تأمین‌کننده / فروشنده'}
              </label>
              <Select
                isRtl
                isSearchable={true}
                value={customerId ? { value: customerId, label: persons.find(c => c.id === customerId)?.name } : null}
                onChange={(option: any) => setCustomerId(option ? option.value : '')}
                options={[...persons].sort((a, b) => {
                  const targetRole = invoiceType === 'sale' ? 'customer' : 'supplier';
                  if (a.role === targetRole && b.role !== targetRole) return -1;
                  if (a.role !== targetRole && b.role === targetRole) return 1;
                  return 0;
                }).map(c => ({ value: c.id, label: `${c.name} (${c.role === 'customer' ? 'مشتری' : c.role === 'supplier' ? 'تامین کننده' : 'کارمند'})` }))}
                placeholder={invoiceType === 'sale' ? "جستجو و انتخاب خریدار..." : "جستجو و انتخاب فروشنده..."}
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
            <div className="lg:col-span-4 pt-4 border-t border-gray-100 flex flex-col gap-4 text-right">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800">واحد پولی فاکتور</span>
                  <span className="text-xs text-gray-500">
                    واحد پولی که فاکتور با آن صادر می‌شود را انتخاب کنید (تنظیمات اصلی: <span className="font-semibold text-indigo-600">{storeSettings.currency}</span>)
                  </span>
                </div>
                
                <div className="flex flex-wrap bg-gray-50 border border-gray-200 p-1 rounded-xl w-fit gap-1" dir="rtl">
                  {Array.from(new Set([storeSettings.currency, 'تومان', 'ریال', 'دلار', 'یورو', 'درهم'].filter(Boolean))).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCurrencyChange(c)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border border-transparent ${
                        invoiceCurrency === c ? 'bg-white shadow-sm text-indigo-700 border-gray-200 font-semibold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {invoiceCurrency !== storeSettings.currency && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-right"
                >
                  <div className="flex flex-col msg-part">
                    <span className="text-sm font-semibold text-indigo-900">ضریب و نرخ تبدیل ارز</span>
                    <span className="text-xs text-indigo-700 mt-1">
                      هر ۱ {invoiceCurrency} برابر با چند {storeSettings.currency} است؟ تمام مبالغ کالاها و فاکتور بر این اساس تبدیل و ثبت می‌شوند.
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 self-end md:self-auto" dir="rtl">
                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap">هر ۱ {invoiceCurrency} =</span>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        value={exchangeRateInput}
                        onChange={e => {
                          const val = e.target.value;
                          setExchangeRateInput(val);
                          const num = parseFloat(val);
                          if (num > 0) {
                            handleExchangeRateChange(num);
                          }
                        }}
                        className="w-36 px-3 py-2 pr-2 text-left font-mono font-medium rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                        placeholder="نرخ تبدیل"
                        required
                        dir="ltr"
                      />
                    </div>
                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{storeSettings.currency}</span>
                  </div>
                </motion.div>
              )}
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
      ) : (activeTab === 'list_sale' || activeTab === 'list_purchase') ? (
        /* Invoice List */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {activeTab === 'list_sale' ? (
                <>
                  <List className="w-5 h-5 text-indigo-500" />
                  لیست فاکتورهای فروش ثبت شده
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 text-amber-500" />
                  لیست فاکتورهای خرید ثبت شده
                </>
              )}
            </h2>
          </div>
          
          <div className="p-0 overflow-x-auto">
            {invoices.filter(inv => {
              if (activeTab === 'list_sale') return inv.type !== 'purchase';
              if (activeTab === 'list_purchase') return inv.type === 'purchase';
              return true;
            }).length === 0 ? (
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
                    <th className="py-4 px-6 text-right">طرف حساب</th>
                    <th className="py-4 px-6 text-right">تعداد اقلام</th>
                    <th className="py-4 px-6 text-right">مبلغ پرداختی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices
                    .filter(inv => {
                      if (activeTab === 'list_sale') return inv.type !== 'purchase';
                      if (activeTab === 'list_purchase') return inv.type === 'purchase';
                      return true;
                    })
                    .map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-900 border-r-2 border-transparent">
                          <div className="flex items-center gap-2">
                            <span>{inv.title || 'فاکتور بدون عنوان'}</span>
                            {inv.type === 'purchase' ? (
                              <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-amber-100 flex items-center">
                                فاکتور خرید
                              </span>
                            ) : (
                              <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-indigo-100 flex items-center">
                                فاکتور فروش
                              </span>
                            )}
                          </div>
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
                          {formatCurrency(inv.totalAmount)} {showInvoiceCurrency(inv.currency)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : (activeTab === 'create_receive_receipt' || activeTab === 'create_pay_receipt') ? (
        /* Receipts & Payments creation form */
        <div className="space-y-6 text-right" dir="rtl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2.5">
                  {activeTab === 'create_receive_receipt' ? (
                    <>
                      <Wallet className="w-6 h-6 text-emerald-600" />
                      رسید دریافت جدید (ورود وجه)
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6 text-rose-600" />
                      رسید پرداخت جدید (خروج وجه)
                    </>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'create_receive_receipt' 
                    ? 'ثبت سند دریافت وجه نقد یا واریز به بانک از طرف حساب‌ها' 
                    : 'ثبت سند پرداخت وجه نقد یا واریز به بانک به طرف حساب‌ها'}
                </p>
              </div>

              {receiptSuccessMsg && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                    activeTab === 'create_receive_receipt' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                      : 'bg-rose-50 text-rose-800 border-rose-100'
                  }`}
                >
                  {receiptSuccessMsg}
                </motion.div>
              )}
            </div>

            <form onSubmit={(e) => handleSubmitReceipt(activeTab === 'create_receive_receipt' ? 'receive' : 'pay', e)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Contact Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    طرف حساب مربوطه <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    isRtl
                    value={receiptPersonId ? { value: receiptPersonId, label: persons.find(p => p.id === receiptPersonId)?.name } : null}
                    onChange={(option: any) => setReceiptPersonId(option ? option.value : '')}
                    options={persons.map(p => ({
                      value: p.id,
                      label: `${p.name} (${p.role === 'customer' ? 'مشتری' : p.role === 'supplier' ? 'تأمین‌کننده' : 'کارمند'})`
                    }))}
                    placeholder="انتخاب طرف حساب..."
                    noOptionsMessage={() => "شخصی یافت نشد"}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '0.75rem',
                        borderColor: '#E5E7EB',
                        padding: '2px',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#4F46E5' }
                      })
                    }}
                    required
                  />
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    تاریخ ثبت سند <span className="text-rose-500">*</span>
                  </label>
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={receiptDate}
                    onChange={(val) => setReceiptDate(val)}
                    inputClass="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-gray-900"
                    containerClassName="w-full"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    مبلغ تراکنش ({storeSettings.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={receiptAmount}
                      onChange={(e) => setReceiptAmount(e.target.value)}
                      placeholder="مثال: ۵۰۰۰۰۰۰"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-semibold text-left"
                      required
                      dir="ltr"
                    />
                  </div>
                  {receiptAmount && (
                    <span className="text-xs text-indigo-600 font-semibold mt-1 block">
                      {formatNumber(Number(receiptAmount))} {storeSettings.currency}
                    </span>
                  )}
                </div>

                {/* Resource Type Selection */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    روش تسویه / واریز <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptResourceType('bank');
                        setReceiptResourceId('');
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                        receiptResourceType === 'bank'
                          ? 'bg-white shadow-sm text-indigo-700 border border-gray-200 font-semibold'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      💳 حساب بانکی
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptResourceType('cashbox');
                        setReceiptResourceId('');
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                        receiptResourceType === 'cashbox'
                          ? 'bg-white shadow-sm text-indigo-700 border border-gray-200 font-semibold'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      💵 صندوق نقدی
                    </button>
                  </div>
                </div>

                {/* Specific Resource Select Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    {receiptResourceType === 'bank' ? (
                      <>
                        <CreditCard className="w-4 h-4 text-indigo-500" />
                        انتخاب حساب بانکی مقصد/مبدا <span className="text-rose-500">*</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 text-amber-500" />
                        انتخاب صندوق نقدی مقصد/مبدا <span className="text-rose-500">*</span>
                      </>
                    )}
                  </label>
                  <select
                    value={receiptResourceId}
                    onChange={(e) => setReceiptResourceId(Number(e.target.value) || '')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    required
                  >
                    <option value="">
                      {receiptResourceType === 'bank' ? '-- انتخاب حساب بانکی --' : '-- انتخاب صندوق نقدی --'}
                    </option>
                    {receiptResourceType === 'bank'
                      ? accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.bankName} - صاحب حساب: {acc.accountHolder || 'نامشخص'} (مانده فعلی: {formatNumber(acc.balance)} {storeSettings.currency})
                          </option>
                        ))
                      : cashboxes.map(cb => (
                          <option key={cb.id} value={cb.id}>
                            {cb.name} - مسئول: {cb.manager || 'نامشخص'} (مانده فعلی: {formatNumber(cb.balance)} {storeSettings.currency})
                          </option>
                        ))}
                  </select>
                </div>

                {/* Description input */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">توضیحات و بابت</label>
                  <textarea
                    value={receiptDescription}
                    onChange={(e) => setReceiptDescription(e.target.value)}
                    placeholder="مثال: بابت فروش یک دستگاه سرور و تجهیزات جانبی"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-right"
                    rows={2}
                  />
                </div>

              </div>

              {/* Submit button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingReceipt}
                  className={`w-full md:w-auto px-8 py-3.5 text-sm font-bold rounded-xl text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'create_receive_receipt' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-300' 
                      : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {submittingReceipt ? 'در حال ثبت سند...' : 'ثبت قطعی و صدور سند'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (activeTab === 'list_receive_receipt' || activeTab === 'list_pay_receipt') ? (
        /* Receipts & Payments list */
        <div className="space-y-6 text-right" dir="rtl">
          {/* List of Registered Receipts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <List className="w-5 h-5 text-indigo-500" />
                {activeTab === 'list_receive_receipt' ? 'لیست رسیدهای دریافت ثبت شده' : 'لیست رسیدهای پرداخت ثبت شده'}
              </h2>
            </div>

            <div className="overflow-x-auto">
              {transactions.filter(t => t.type === (activeTab === 'list_receive_receipt' ? 'receive' : 'pay')).length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>هیچ سندی در این دسته‌بندی یافت نشد.</p>
                </div>
              ) : (
                <table className="w-full text-right whitespace-nowrap min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-sm">
                      <th className="py-4 px-6 text-right">کد سند</th>
                      <th className="py-4 px-6 text-right">تاریخ</th>
                      <th className="py-4 px-6 text-right">طرف حساب</th>
                      <th className="py-4 px-6 text-right">نوع حساب دریافتی/پرداختی</th>
                      <th className="py-4 px-6 text-right">مبلغ ({storeSettings.currency})</th>
                      <th className="py-4 px-6 text-right">توضیحات</th>
                      <th className="py-4 px-6 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions
                      .filter(t => t.type === (activeTab === 'list_receive_receipt' ? 'receive' : 'pay'))
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-semibold text-gray-700">
                            #{t.id}
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {t.jalaliDate || t.date}
                          </td>
                          <td className="py-4 px-6 font-bold text-gray-900">
                            {t.personName}
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-700">
                            <div className="flex items-center gap-2">
                              {t.resourceType === 'bank' ? '💳 بانک: ' : '💵 صندوق: '}
                              <span className="text-indigo-600">{t.resourceName}</span>
                            </div>
                          </td>
                          <td className={`py-4 px-6 font-extrabold text-base ${activeTab === 'list_receive_receipt' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatNumber(t.amount)}
                          </td>
                          <td className="py-4 px-6 text-gray-500 text-sm whitespace-normal max-w-xs">
                            {t.description || '---'}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-all"
                              title="حذف سند"
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
          </div>
        </div>
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
              onClick={() => {
                setEditingProductId(null);
                setNewProductName('');
                setNewProductPrice('');
                setNewProductType('product');
                setNewProductCategory('');
                setIsProductModalOpen(true);
              }}
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
                        {formatCurrency(p.price)} <span className="text-xs font-normal mr-1">{storeSettings.currency}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditProduct(p)}
                            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                            title="ویرایش کالا"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            title="حذف کالا"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
              onClick={() => {
                setEditingPersonId(null);
                setNewPersonType('real');
                setNewPersonFirstName('');
                setNewPersonLastName('');
                setNewPersonCompanyName('');
                setNewPersonFatherName('');
                setNewPersonNationalId('');
                setNewPersonAddress('');
                setNewPersonPhone('');
                setNewPersonRole('customer');
                setIsPersonModalOpen(true);
              }}
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
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setLedgerPersonId(p.id);
                              setActiveTab('person_ledger');
                            }}
                            className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors inline-block"
                            title="مشاهده کارت حساب"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditPerson(p)}
                            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                            title="ویرایش شخص"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePerson(p.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            title="حذف شخص"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : activeTab === 'accounts' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              مدیریت حساب‌های بانکی
            </h2>
            <button
              onClick={() => {
                setEditingAccountId(null);
                setNewAccountBankName('');
                setNewAccountBranchName('');
                setNewAccountNumber('');
                setNewAccountCardNumber('');
                setNewAccountShebaNumber('');
                setNewAccountBalance('');
                setNewAccountHolder('');
                setIsAccountModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              ثبت حساب جدید
            </button>
          </div>
          
          {successMsg && (
            <div className="mx-6 mt-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 border border-green-100">
              <CheckCircle className="w-5 h-5" />
              {successMsg}
            </div>
          )}
          
          <div className="p-0 overflow-x-auto">
            {accounts.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-medium">
                هیچ حساب بانکی ثبت نشده است. برای شروع یک حساب جدید تعریف کنید.
              </div>
            ) : (
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                    <th className="py-4 px-6 font-semibold">ردیف</th>
                    <th className="py-4 px-6 font-semibold">نام بانک</th>
                    <th className="py-4 px-6 font-semibold">صاحب حساب</th>
                    <th className="py-4 px-6 font-semibold">شماره حساب</th>
                    <th className="py-4 px-6 font-semibold">شماره کارت</th>
                    <th className="py-4 px-6 font-semibold">شماره شبا</th>
                    <th className="py-4 px-6 font-semibold">شعبه</th>
                    <th className="py-4 px-6 font-semibold">موجودی (تومان)</th>
                    <th className="py-4 px-6 font-semibold text-center w-24">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {accounts.map((acc, index) => (
                    <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors text-gray-700">
                      <td className="py-4 px-6 font-medium text-gray-400">{index + 1}</td>
                      <td className="py-4 px-6 font-semibold text-gray-950">
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-500" />
                          {acc.bankName}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">{acc.accountHolder || '-'}</td>
                      <td className="py-4 px-6 text-sm font-mono text-left" dir="ltr">{acc.accountNumber || '-'}</td>
                      <td className="py-4 px-6 text-sm font-mono text-left" dir="ltr">{acc.cardNumber || '-'}</td>
                      <td className="py-4 px-6 text-sm font-mono text-left" dir="ltr">{acc.shebaNumber || '-'}</td>
                      <td className="py-4 px-6 text-sm">{acc.branchName || '-'}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-indigo-600 font-mono text-left" dir="ltr">
                        {formatNumber(acc.balance)} <span className="text-xs font-normal font-sans ml-1">{storeSettings.currency}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditAccount(acc)}
                            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                            title="ویرایش حساب"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            title="حذف حساب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : activeTab === 'cashboxes' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-500" />
              مدیریت صندوق‌ها و تنخواه
            </h2>
            <button
              onClick={() => {
                setEditingCashboxId(null);
                setNewCashboxName('');
                setNewCashboxManager('');
                setNewCashboxBalance('');
                setIsCashboxModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              ثبت صندوق جدید
            </button>
          </div>
          
          {successMsg && (
            <div className="mx-6 mt-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 border border-green-100">
              <CheckCircle className="w-5 h-5" />
              {successMsg}
            </div>
          )}
          
          <div className="p-0 overflow-x-auto">
            {cashboxes.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-medium">
                هیچ صندوق یا تنخواه‌گردانی ثبت نشده است. برای شروع یک مورد جدید ثبت کنید.
              </div>
            ) : (
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                    <th className="py-4 px-6 font-semibold">ردیف</th>
                    <th className="py-4 px-6 font-semibold">نام صندوق / تنخواه</th>
                    <th className="py-4 px-6 font-semibold">مسئول صندوق</th>
                    <th className="py-4 px-6 font-semibold">موجودی فعلی (تومان)</th>
                    <th className="py-4 px-6 font-semibold text-center w-24">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cashboxes.map((box, index) => (
                    <tr key={box.id} className="hover:bg-gray-50/50 transition-colors text-gray-700">
                      <td className="py-4 px-6 font-medium text-gray-400">{index + 1}</td>
                      <td className="py-4 px-6 font-semibold text-gray-950">
                        <span className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-indigo-500" />
                          {box.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">{box.manager || 'نامشخص'}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-teal-600 font-mono text-left" dir="ltr">
                        {formatNumber(box.balance)} <span className="text-xs font-normal font-sans ml-1">{storeSettings.currency}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditCashbox(box)}
                            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                            title="ویرایش صندوق"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCashbox(box.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            title="حذف صندوق"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : activeTab === 'financial_report' ? (
        /* Financial Report & Treasury View */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-right"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2.5">
                <BarChart3 className="w-6 h-6 text-indigo-600 font-bold" />
                گزارش مالی و تراز خزانه‌داری
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                نگاهی خلاصه به عملکرد خرید، فروش، نقدینگی صندوق‌ها و تراز کلی حساب‌های بانکی
              </p>
            </div>
            <button
              onClick={async () => {
                await Promise.all([
                  fetchInvoices(),
                  fetchTransactions(),
                  fetchAccounts(),
                  fetchCashboxes()
                ]);
              }}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl flex items-center gap-2 transition-all font-semibold text-sm border border-indigo-100 shadow-sm"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              بروزرسانی داده‌ها
            </button>
          </div>

          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sales Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
              <div className="p-3.5 bg-indigo-50 rounded-2xl text-indigo-600">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-400">مجموع کل فروش (فاکتورها)</h3>
                <span className="text-xl font-extrabold text-gray-900 block mt-1">
                  {formatNumber(
                    invoices
                      .filter(inv => inv.type !== 'purchase')
                      .reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0)
                  )}{' '}
                  <span className="text-xs font-medium text-gray-500">{storeSettings.currency}</span>
                </span>
                <span className="text-xs text-indigo-600 font-bold mt-1 block">
                  {formatNumber(invoices.filter(inv => inv.type !== 'purchase').length)} فاکتور فروش ثبت شده
                </span>
              </div>
            </div>

            {/* Purchases Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
              <div className="p-3.5 bg-amber-50 rounded-2xl text-amber-600">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-400">مجموع کل خرید (فاکتورها)</h3>
                <span className="text-xl font-extrabold text-gray-900 block mt-1">
                  {formatNumber(
                    invoices
                      .filter(inv => inv.type === 'purchase')
                      .reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0)
                  )}{' '}
                  <span className="text-xs font-medium text-gray-500">{storeSettings.currency}</span>
                </span>
                <span className="text-xs text-amber-600 font-bold mt-1 block">
                  {formatNumber(invoices.filter(inv => inv.type === 'purchase').length)} فاکتور خرید ثبت شده
                </span>
              </div>
            </div>

            {/* Net Difference Card */}
            {(() => {
              const salesVal = invoices
                .filter(inv => inv.type !== 'purchase')
                .reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);
              const purchasesVal = invoices
                .filter(inv => inv.type === 'purchase')
                .reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);
              const netVal = salesVal - purchasesVal;
              const isPositive = netVal >= 0;

              return (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden">
                  <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <div className={`p-3.5 rounded-2xl ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-gray-400">تفاضل معاملات (فروش - خرید)</h3>
                    <span className={`text-xl font-extrabold block mt-1 ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatNumber(netVal)}{' '}
                      <span className="text-xs font-medium text-gray-500">{storeSettings.currency}</span>
                    </span>
                    <span className={`text-xs font-bold mt-1 block ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? 'موازنه مثبت (سود تجاری ناخالص)' : 'موازنه منفی (زیان تجاری ناخالص)'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Grand Treasury Liquid Total Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-200">
                <Wallet className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">مجموع کل نقدینگی و تراز خزانه‌داری</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  مجموع مانده حساب‌های بانکی و موجودی واقعی صندوق‌های ثبت شده در سیستم
                </p>
              </div>
            </div>
            <div className="text-center md:text-left">
              <span className="text-xs text-emerald-700 font-semibold block mb-1">دارایی نقدی کل</span>
              <span className="text-3xl font-extrabold text-emerald-900 tracking-tight">
                {formatNumber(
                  accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0) +
                  cashboxes.reduce((sum, cb) => sum + (cb.balance || 0), 0)
                )}{' '}
                <span className="text-sm font-bold text-emerald-900">{storeSettings.currency}</span>
              </span>
            </div>
          </div>

          {/* Accounts vs Cashboxes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bank Accounts Segment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                تراز و مانده حساب‌های بانکی
              </h3>
              
              {accounts.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">هیچ حساب بانکی ثبت نشده است.</p>
              ) : (
                <div className="space-y-4">
                  {accounts.map(acc => (
                    <div key={acc.id} className="bg-gray-50 hover:bg-gray-100/70 py-3.5 px-4 rounded-xl border border-gray-100 transition-colors flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 block text-sm">{acc.bankName}</span>
                        <span className="text-xs text-gray-500 mt-0.5 block">
                          صاحب حساب: {acc.accountHolder || 'ثبت نشده'} | شماره کارت: {acc.cardNumber || '---'}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-extrabold text-indigo-600 block">
                          {formatNumber(acc.balance || 0)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">{storeSettings.currency}</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-dashed border-gray-200 pt-3 flex items-center justify-between text-gray-900">
                    <span className="text-sm font-bold">مجموع مانده بانک‌ها:</span>
                    <span className="text-base font-black text-indigo-700">
                      {formatNumber(accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0))} {storeSettings.currency}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Cashboxes Segment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-500" />
                تراز و موجودی صندوق‌ها
              </h3>
              
              {cashboxes.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">هیچ صندوق نقدی ثبت نشده است.</p>
              ) : (
                <div className="space-y-4">
                  {cashboxes.map(cb => (
                    <div key={cb.id} className="bg-gray-50 hover:bg-gray-100/70 py-3.5 px-4 rounded-xl border border-gray-100 transition-colors flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 block text-sm">{cb.name}</span>
                        <span className="text-xs text-gray-500 mt-0.5 block">
                          مسئول صندوق: {cb.manager || 'ثبت نشده'}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-extrabold text-amber-600 block">
                          {formatNumber(cb.balance || 0)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">{storeSettings.currency}</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-dashed border-gray-200 pt-3 flex items-center justify-between text-gray-900">
                    <span className="text-sm font-bold">مجموع موجودی صندوق‌ها:</span>
                    <span className="text-base font-black text-amber-700">
                      {formatNumber(cashboxes.reduce((sum, cb) => sum + (cb.balance || 0), 0))} {storeSettings.currency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cash Flow Summary for Transactions (Receipts & Payments) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              خلاصه گردش اسناد دریافت و پرداخت خزانه‌داری
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 flex justify-between items-center">
                <div>
                  <span className="text-xs text-emerald-800 font-bold block">مجموع دریافت‌ها (رسید دریافت)</span>
                  <span className="text-[10px] text-gray-500 font-semibold">(آمارهای حاصل از اسناد دریافتی صادره)</span>
                </div>
                <span className="text-lg font-black text-emerald-700 font-sans">
                  {formatNumber(transactions.filter(t => t.type === 'receive').reduce((sum, t) => sum + (t.amount || 0), 0))} {storeSettings.currency}
                </span>
              </div>
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 flex justify-between items-center">
                <div>
                  <span className="text-xs text-rose-800 font-bold block">مجموع پرداخت‌ها (رسید پرداخت)</span>
                  <span className="text-[10px] text-gray-500 font-semibold">(آمارهای حاصل از اسناد پرداختی صادره)</span>
                </div>
                <span className="text-lg font-black text-rose-700 font-sans">
                  {formatNumber(transactions.filter(t => t.type === 'pay').reduce((sum, t) => sum + (t.amount || 0), 0))} {storeSettings.currency}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              * ارقام مربوط به گردش اسناد براساس مبالغ ثبت شده در رسیدهای دریافت و پرداخت رسمی صادر شده در بخش خزانه‌داری محاسبه شده و مستقیماً روی تراز مالی صندوق‌ها و حساب‌های بانکی بالا اثرگذار بوده‌اند.
            </p>
          </div>
        </motion.div>
      ) : activeTab === 'person_ledger' ? (
        /* Contact/Person Ledger Card View (کارت حساب اشخاص) */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-right"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2.5">
                <User className="w-6 h-6 text-violet-600 font-bold" />
                کارت حساب و دفتر معین اشخاص
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                گزارش یکپارچه و به ترتیب زمان از تمام فاکتورهای فروش/خرید و رسیدهای دریافت/پرداخت هر یک از طرف حساب‌ها
              </p>
            </div>
            
            {/* Quick Refresh */}
            <button
              onClick={async () => {
                await Promise.all([
                  fetchInvoices(),
                  fetchTransactions(),
                  fetchPersons()
                ]);
              }}
              className="px-4 py-2 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-xl flex items-center gap-2 transition-all font-semibold text-sm border border-violet-100 shadow-sm"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              بروزرسانی اطلاعات
            </button>
          </div>

          {/* Selector Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="max-w-xl">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-violet-500" />
                شخص مورد نظر را انتخاب کنید:
              </label>
              <Select
                isRtl
                value={ledgerPersonId ? { value: ledgerPersonId, label: persons.find(p => p.id === Number(ledgerPersonId))?.name } : null}
                onChange={(option: any) => setLedgerPersonId(option ? option.value : '')}
                options={persons.map(p => ({
                  value: p.id,
                  label: `${p.name} (${p.role === 'customer' ? 'مشتری' : p.role === 'supplier' ? 'تأمین‌کننده' : 'کارمند'})`
                }))}
                placeholder="انتخاب یا جستجوی نام شخص..."
                noOptionsMessage={() => "شخصی یافت نشد"}
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    borderColor: '#E5E7EB',
                    padding: '3px',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#7C3AED' }
                  })
                }}
              />
            </div>
          </div>

          {/* Ledger Content */}
          {(() => {
            if (!ledgerPersonId) {
              return (
                <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
                  <User className="w-16 h-16 text-violet-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-700 mb-1">مکانیزم صدور صورتحساب هوشمند</h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    برای بررسی گردش مالی، ریز فاکتورها، واریزی‌ها و دریافت/پرداخت‌ها، لطفاً از کادر بالا یک شخص را انتخاب و بررسی کنید.
                  </p>
                </div>
              );
            }

            const selectedPerson = persons.find(p => p.id === Number(ledgerPersonId));
            if (!selectedPerson) {
              return (
                <div className="bg-white rounded-2xl p-8 text-center text-rose-500 border border-rose-100 shadow-sm">
                  شخص مورد نظر در سیستم یافت نشد.
                </div>
              );
            }

            // Calculations
            // Invoices
            const invoiceEntries = invoices
              .filter(inv => Number(inv.customerId) === Number(ledgerPersonId))
              .map(inv => {
                const isSale = inv.type !== 'purchase';
                const amount = (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency);
                return {
                  id: `inv-${inv.id}`,
                  refId: inv.invoiceNumber || `#${inv.id}`,
                  date: inv.date,
                  jalaliDate: inv.jalaliDate || new Date(inv.date).toLocaleDateString('fa-IR'),
                  type: inv.type === 'purchase' ? 'فاکتور خرید کالا' : 'فاکتور فروش کالا',
                  desc: inv.title || (inv.type === 'purchase' ? 'خرید طی فاکتور' : 'فروش طی فاکتور'),
                  debit: isSale ? amount : 0,  // Sale increases how much they owe us
                  credit: isSale ? 0 : amount, // Purchase decreases how much they owe us
                  rawItem: inv,
                  entryType: 'invoice'
                };
              });

            // Transactions
            const transactionEntries = transactions
              .filter(t => Number(t.personId) === Number(ledgerPersonId))
              .map(t => {
                const isReceive = t.type === 'receive';
                return {
                  id: `tx-${t.id}`,
                  refId: `سند #${t.id}`,
                  date: t.date,
                  jalaliDate: t.jalaliDate || new Date(t.date).toLocaleDateString('fa-IR'),
                  type: isReceive ? 'رسید دریافت وجه (وصول)' : 'رسید پرداخت وجه (پرداخت)',
                  desc: t.description || (isReceive ? 'بابت تسویه حساب مالی' : 'بابت پرداخت به طرف حساب'),
                  debit: isReceive ? 0 : t.amount,  // Paying them debits their account
                  credit: isReceive ? t.amount : 0, // Receiving from them credits their account
                  rawItem: t,
                  entryType: 'transaction'
                };
              });

            // Combine and sort chronologically
            const allEntries = [...invoiceEntries, ...transactionEntries].sort((a, b) => {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            });

            // Running progressive balance
            let runningSum = 0;
            const ledgerEntries = allEntries.map(entry => {
              runningSum += (entry.debit - entry.credit);
              return {
                ...entry,
                runningBalance: runningSum
              };
            });

            const totalDebits = allEntries.reduce((sum, entry) => sum + entry.debit, 0);
            const totalCredits = allEntries.reduce((sum, entry) => sum + entry.credit, 0);
            const finalBalance = totalDebits - totalCredits;

            return (
              <div className="space-y-6">
                
                {/* Person Summary KPI Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Persona Info Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          selectedPerson.role === 'customer' 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : selectedPerson.role === 'supplier' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-purple-50 text-purple-700'
                        }`}>
                          {selectedPerson.role === 'customer' ? 'مشتری' : selectedPerson.role === 'supplier' ? 'تأمین‌کننده' : 'کارمند'}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">کد شخص: #{selectedPerson.id}</span>
                      </div>
                      <h2 className="text-lg font-extrabold text-gray-900 mb-3">{selectedPerson.name}</h2>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {selectedPerson.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs font-semibold">تلفن تماس:</span>
                            <span className="font-mono text-gray-800 font-semibold" dir="ltr">{selectedPerson.phone}</span>
                          </div>
                        )}
                        {selectedPerson.nationalId && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs font-semibold">کد ملی / شناسه ملی:</span>
                            <span className="font-mono text-gray-800" dir="ltr">{selectedPerson.nationalId}</span>
                          </div>
                        )}
                        {selectedPerson.fatherName && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs font-semibold">نام پدر:</span>
                            <span className="text-gray-800 font-medium">{selectedPerson.fatherName}</span>
                          </div>
                        )}
                        {selectedPerson.address && (
                          <div className="pt-2 border-t border-gray-50 text-xs text-gray-500">
                            <span className="text-gray-400 block mb-1 font-semibold">نشانی:</span>
                            <span className="leading-relaxed block">{selectedPerson.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Operational Turns KPI Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-3 mb-3">آمار کارکرد و گردش حساب</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold text-gray-600 block">جمع کل بدهکار (فروش‌ها / مخارج پرداختی)</span>
                          <span className="text-[10px] text-gray-450">افزایش دارایی ما / افزایش تعهد شخص</span>
                        </div>
                        <span className="text-base font-black text-gray-900 font-sans">
                          {formatNumber(totalDebits)} <span className="text-xs font-normal text-gray-400">{storeSettings.currency}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                        <div>
                          <span className="text-sm font-semibold text-gray-600 block">جمع کل بستانکار (خریدها / دریافت‌ها)</span>
                          <span className="text-[10px] text-gray-450">کاهش تعهد شخص / افزایش تعهد ما</span>
                        </div>
                        <span className="text-base font-black text-gray-900 font-sans">
                          {formatNumber(totalCredits)} <span className="text-xs font-normal text-gray-400">{storeSettings.currency}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-455 mt-2 font-medium">
                       تعداد کل اسناد مرتبط: {formatNumber(allEntries.length)} سند (شامل {formatNumber(invoiceEntries.length)} فاکتور و {formatNumber(transactionEntries.length)} رسید مالی)
                    </div>
                  </div>

                  {/* Net Balanced Status Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    {(() => {
                      const isOwedToUs = finalBalance > 0;
                      const isClear = finalBalance === 0;
                      const borderStripe = isClear ? 'bg-emerald-500' : (isOwedToUs ? 'bg-amber-500' : 'bg-rose-500');
                      
                      return (
                        <>
                          <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${borderStripe}`}></div>
                          <div>
                            <span className="text-xs font-bold text-gray-400 block mb-2">وضعیت نهایی تراز حساب شخص</span>
                            <div className="py-2 font-semibold">
                              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md inline-block mb-2 ${
                                isClear 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : isOwedToUs 
                                    ? 'bg-amber-50 text-amber-700' 
                                    : 'bg-rose-50 text-rose-700'
                              }`}>
                                {isClear ? '✔ کاملاً تسویه شده' : isOwedToUs ? '🔺 بدهکار به فروشگاه' : '🔻 بستانکار از فروشگاه'}
                              </span>
                              
                              <span className={`text-2xl font-black block tracking-tight ${
                                isClear ? 'text-emerald-700' : isOwedToUs ? 'text-amber-700' : 'text-rose-700'
                              }`}>
                                {formatNumber(Math.abs(finalBalance))}{' '}
                                <span className="text-xs font-medium text-gray-500">{storeSettings.currency}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100/50 mt-2">
                            {isClear ? (
                              'هیچ بدهی یا طلبی بین ما و این شخص وجود ندارد.'
                            ) : isOwedToUs ? (
                              'شخص مبالغ فروشگاه را بدهکار است و باید دریافت شود.'
                            ) : (
                              'فروشگاه به این شخص تعهد مالی (بدهی) دارد یا پرداخت اضافه داشته است.'
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                </div>

                {/* Ledger Detail Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-gray-800 flex items-center gap-2">
                      <List className="w-5 h-5 text-violet-500" />
                      ریز و گردش جزئیات حساب معین (کارت حساب اشخاص)
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    {ledgerEntries.length === 0 ? (
                      <div className="p-12 text-center text-gray-400">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        هیچ گردش مالی یا سندی برای این شخص ثبت نشده است.
                      </div>
                    ) : (
                      <table className="w-full text-right whitespace-nowrap min-w-[900px] text-sm">
                        <thead>
                          <tr className="bg-gray-50/70 text-gray-500 border-b border-gray-100 font-semibold text-xs">
                            <th className="py-4 px-6 text-center w-14">ردیف</th>
                            <th className="py-4 px-6 text-right w-24">تاریخ ثبت</th>
                            <th className="py-4 px-6 text-right w-36">نوع مدرک</th>
                            <th className="py-4 px-6 text-right w-40">شماره ارجاع</th>
                            <th className="py-4 px-6 text-right">شرح و بابت</th>
                            <th className="py-4 px-6 text-left w-36">بدهکار (+ افزایش بدهی)</th>
                            <th className="py-4 px-6 text-left w-36">بستانکار (- کاهش بدهی)</th>
                            <th className="py-4 px-6 text-left w-40">مانده ردیف</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                          {ledgerEntries.map((entry, index) => {
                            const isDeb = entry.runningBalance > 0;
                            const isCred = entry.runningBalance < 0;
                            const isBalZero = entry.runningBalance === 0;

                            return (
                              <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-6 text-center text-gray-400 font-sans">
                                  {index + 1}
                                </td>
                                <td className="py-4 px-6 text-gray-600 font-sans">
                                  {entry.jalaliDate}
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                    entry.type.includes('فروش') 
                                      ? 'bg-blue-50 text-blue-700' 
                                      : entry.type.includes('خرید') 
                                        ? 'bg-amber-50 text-amber-700' 
                                        : entry.type.includes('دریافت')
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-rose-50 text-rose-700'
                                  }`}>
                                    {entry.type}
                                  </span>
                                </td>
                                <td className="py-4 px-6 font-mono font-bold text-gray-700">
                                  {entry.refId}
                                </td>
                                <td className="py-4 px-6 text-gray-500 whitespace-normal max-w-sm text-xs md:text-sm">
                                  {entry.desc}
                                </td>
                                <td className="py-4 px-6 text-left font-sans text-indigo-600 font-bold">
                                  {entry.debit > 0 ? formatNumber(entry.debit) : '---'}
                                </td>
                                <td className="py-4 px-6 text-left font-sans text-emerald-600 font-bold">
                                  {entry.credit > 0 ? formatNumber(entry.credit) : '---'}
                                </td>
                                <td className={`py-4 px-6 text-left font-sans font-extrabold ${
                                  isBalZero 
                                    ? 'text-emerald-600' 
                                    : isDeb 
                                      ? 'text-amber-700' 
                                      : 'text-rose-700'
                                }`}>
                                  {isBalZero ? (
                                    'تسویه'
                                  ) : (
                                    <>
                                      {formatNumber(Math.abs(entry.runningBalance))}
                                      <span className="text-[10px] font-bold mr-1">
                                        {isDeb ? 'بدهکار' : 'بستانکار'}
                                      </span>
                                    </>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            );
          })()}
        </motion.div>
      ) : activeTab === 'settings' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl mx-auto"
        >
          <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-500" />
              تنظیمات فروشگاه و کسب و کار
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              اطلاعات پایه از قبیل نام کسب و کار، آدرس، تلفن و واحد پولی را مدیریت کنید.
            </p>
          </div>

          {successMsg && (
            <div className="mx-6 mt-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 border border-green-100 mb-0">
              <CheckCircle className="w-5 h-5" />
              {successMsg}
            </div>
          )}

          <div className="p-6">
            <form id="settingsForm" onSubmit={handleSaveSettings} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full text-right md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام فروشگاه / شرکت</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={e => setSettingsForm({...settingsForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    required
                  />
                </div>
                
                <div className="w-full text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">واحد پولی سیستم</label>
                  <select
                    value={settingsForm.currency}
                    onChange={e => setSettingsForm({...settingsForm, currency: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="تومان">تومان</option>
                    <option value="ریال">ریال</option>
                    <option value="دلار">دلار (USD)</option>
                    <option value="یورو">یورو (EUR)</option>
                    <option value="درهم">درهم امارات (AED)</option>
                  </select>
                </div>

                <div className="w-full text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس پشتیبانی / فروشگاه</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    dir="ltr"
                  />
                </div>

                <div className="w-full text-right md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">آدرس</label>
                  <textarea
                    value={settingsForm.address}
                    onChange={e => setSettingsForm({...settingsForm, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    rows={3}
                  />
                </div>
                
                <div className="w-full text-right md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">آدرس لوگوی فروشگاه (URL)</label>
                  <input
                    type="url"
                    value={settingsForm.logoUrl}
                    onChange={e => setSettingsForm({...settingsForm, logoUrl: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-left"
                    dir="ltr"
                    placeholder="https://example.com/logo.png"
                  />
                  {settingsForm.logoUrl && (
                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
                      <img src={settingsForm.logoUrl} alt="Logo Preview" className="h-16 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-start border-t border-gray-100 pt-6 mt-2">
                <button
                  type="submit"
                  disabled={submittingSettings}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingSettings ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>ذخیره تنظیمات</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      ) : activeTab === 'update' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl mx-auto"
        >
          <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-500" />
              بروزرسانی سیستم از گیت‌هاب
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              این قسمت برای همگام‌سازی و بروزرسانی سورس‌کد پروژه با تغییرات جدید اعمال‌شده در مخزن گیت‌هاب استفاده می‌شود. توجه داشته باشید که پس از موفقیت‌آمیز بودن بروزرسانی، سیستم ممکن است برای لحظاتی متوقف شود تا تغییرات اعمال گردد.
            </p>
          </div>
          <div className="p-6 flex flex-col items-center">
            <div className="mb-8 p-6 bg-indigo-50 text-indigo-700 rounded-xl w-full text-sm leading-relaxed whitespace-pre-wrap flex items-start gap-4 border border-indigo-100">
              <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                <Github className="w-6 h-6" />
              </div>
              <div className="font-medium text-right font-mono self-center w-full" dir="ltr">
                 {updateLog ? updateLog : 'آماده بررسی تغییرات جدید سیستم...'}
              </div>
            </div>

            <button
              onClick={handleSystemUpdate}
              disabled={updatingStr}
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-[200px]"
            >
              {updatingStr ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  <span>در حال بروزرسانی...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>دریافت آخرین نسخه</span>
                </>
              )}
            </button>
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

        {isAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  ثبت حساب بانکی جدید
                </h3>
                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="accountForm" onSubmit={handleSubmitAccount} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام بانک <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAccountBankName}
                        onChange={(e) => setNewAccountBankName(e.target.value)}
                        placeholder="مثال: بانک ملی، بانک ملت"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                        required
                      />
                    </div>
                    
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام صاحب حساب <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAccountHolder}
                        onChange={(e) => setNewAccountHolder(e.target.value)}
                        placeholder="مثال: علی محمدی"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                        required
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره حساب
                      </label>
                      <input
                        type="text"
                        value={newAccountNumber}
                        onChange={(e) => setNewAccountNumber(e.target.value)}
                        placeholder="مثال: 0102030405"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900 text-left"
                        dir="ltr"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره کارت
                      </label>
                      <input
                        type="text"
                        value={newAccountCardNumber}
                        onChange={(e) => setNewAccountCardNumber(e.target.value)}
                        placeholder="16 رقمی"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900 text-left"
                        dir="ltr"
                      />
                    </div>

                    <div className="w-full text-right md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره شبا (IBAN)
                      </label>
                      <input
                        type="text"
                        value={newAccountShebaNumber}
                        onChange={(e) => setNewAccountShebaNumber(e.target.value)}
                        placeholder="مثال: IR12017000000000..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900 text-left"
                        dir="ltr"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام شعبه
                      </label>
                      <input
                        type="text"
                        value={newAccountBranchName}
                        onChange={(e) => setNewAccountBranchName(e.target.value)}
                        placeholder="مثال: شعبه مرکزی"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        موجودی اولیه (تومان)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newAccountBalance}
                        onChange={(e) => setNewAccountBalance(e.target.value)}
                        placeholder="مثال: 1000000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors shadow-sm"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="accountForm"
                  disabled={submittingAccount}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingAccount ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>ثبت حساب</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isCashboxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-md max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-indigo-500" />
                  ثبت صندوق یا تنخواه جدید
                </h3>
                <button
                  onClick={() => setIsCashboxModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="cashboxForm" onSubmit={handleSubmitCashbox} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4">
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام صندوق / تنخواه <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCashboxName}
                        onChange={(e) => setNewCashboxName(e.target.value)}
                        placeholder="مثال: صندوق اصلی، تنخواه دفتر"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                        required
                      />
                    </div>
                    
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام مسئول صندوق
                      </label>
                      <input
                        type="text"
                        value={newCashboxManager}
                        onChange={(e) => setNewCashboxManager(e.target.value)}
                        placeholder="مثال: سارا احمدی"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        موجودی اولیه (تومان)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newCashboxBalance}
                        onChange={(e) => setNewCashboxBalance(e.target.value)}
                        placeholder="مثال: 500000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsCashboxModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors shadow-sm"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="cashboxForm"
                  disabled={submittingCashbox}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingCashbox ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>ثبت صندوق</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

