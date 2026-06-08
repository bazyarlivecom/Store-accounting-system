import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, Tag, Plus, Trash2, Edit2, Save, FileText, User, ShoppingCart, Calculator, CheckCircle, AlertCircle, AlertTriangle, Info, FilePlus, Calendar, List, Receipt, Search, DollarSign, Package, X, RefreshCw, Menu, Github, CreditCard, Wallet, Store, Settings, TrendingUp, TrendingDown, BarChart3, ChevronDown, ChevronUp, Printer, Eye, ListTodo, CheckSquare, LogOut, LogIn, Database, ArrowDownToLine, ArrowUpFromLine, FileSpreadsheet, Users, BookOpen, ClipboardList , Activity, Clock, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addCommas, removeCommas, numberToWords } from './utils/format';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Select from "react-select";
import { useAuth } from './lib/AuthContext';
import { getStoreSettings, saveStoreSettings, getPersons, addPerson, updatePerson, deletePerson, getProducts, addProduct, updateProduct, deleteProduct, getProductCategories, addProductCategory, updateProductCategory, deleteProductCategory, getAccounts, addAccount, updateAccount, deleteAccount, getCashboxes, addCashbox, updateCashbox, deleteCashbox, getInvoices, addInvoice, deleteInvoice, getTransactions, addTransaction, deleteTransaction } from './lib/dataService';
import DatabaseDashboard from './components/DatabaseDashboard';
import SystemChecklist from './components/SystemChecklist';
import { Person, Product, Account, Cashbox, InvoiceItem } from './types';

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

const customPersonFilter = (option: any, inputValue: string) => {
  if (!inputValue) return true;
  return (option.data.searchStr || option.label || '').toLowerCase().includes(inputValue.toLowerCase());
};

const mapPersonToOption = (p: any) => ({
  value: p.id.toString(),
  label: (p.personCode ? '[' + p.personCode + '] ' : '') + p.name + ' (' + (p.role === 'customer' ? 'مشتری' : p.role === 'supplier' ? 'تامین کننده' : 'کارمند') + ')',
  searchStr: `${p.name} ${p.firstName||''} ${p.lastName||''} ${p.phone||''} ${p.nationalId||''} ${p.personCode||''} ${p.companyName||''}`
});

const CurrencyInput = ({ value, onChange, placeholder, className, ...props }: any) => {
  const [localVal, setLocalVal] = useState(value ? addCommas(value) : '');

  useEffect(() => {
    if (value !== undefined) {
      setLocalVal(addCommas(value));
    }
  }, [value]);

  const handleChange = (e: any) => {
    let raw = e.target.value.replace(/,/g, '');
    if (raw && isNaN(Number(raw))) return;
    setLocalVal(addCommas(raw));
    if (onChange) onChange({ target: { value: raw } });
  };

  return (
    <div className="w-full relative">
      <input
        type="text"
        dir="ltr"
        value={localVal}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} text-left`}
        {...props}
      />
      {localVal && localVal !== '0' && (
        <p className="text-[10px] text-gray-500 font-medium mt-1 px-1 absolute -bottom-5 right-0 z-10 w-max">{numberToWords(localVal)} تومان</p>
      )}
    </div>
  );
};

export default function App() {
    const [historyProductId, setHistoryProductId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({isOpen: false, message: '', onConfirm: () => {}});
  const confirmAction = (message: string, onConfirm: () => void) => {
    setConfirmState({isOpen: true, message, onConfirm});
  };
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab ] = useState<'create_sale' | 'create_purchase' | 'list_sale' | 'list_purchase' | 'create_receive_receipt' | 'list_receive_receipt' | 'create_pay_receipt' | 'list_pay_receipt' | 'create_salary_payroll' | 'list_salary_payroll' | 'products' | 'product_categories' | 'persons' | 'accounts' | 'cashboxes' | 'update' | 'settings' | 'financial_report' | 'person_ledger' | 'checklist' | 'database'>('create_sale');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    sales_purchases: true,
    treasury_finance: true,
    base_info: false, // Collapse by default to make it look clean
    reports: true,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

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
  const [storeSettings, setStoreSettings] = useState<any>({ storeName: 'فروشگاه پیش‌فرض', address: '', phone: '', logoUrl: '', currency: 'تومان', isSetup: false });
  const [loading, setLoading] = useState(false);
  const [requiresInitSetup, setRequiresInitSetup] = useState(false);

  // Receipts & Payments Form State
  const [receiptPersonId, setReceiptPersonId] = useState<string | number | ''>('');
  const [printingTransaction, setPrintingTransaction] = useState<any>(null);
  const [receiptDate, setReceiptDate] = useState<Date | any>(new Date());
  const [receiptAmount, setReceiptAmount] = useState<string>('');
  const [receiptResourceType, setReceiptResourceType] = useState<'bank' | 'cashbox'>('bank');
  const [receiptResourceId, setReceiptResourceId] = useState<string | number | ''>('');
  const [receiptDescription, setReceiptDescription] = useState<string>('');
  const [submittingReceipt, setSubmittingReceipt] = useState<boolean>(false);
  const receiptSuccessMsg = false;

  // Salary form state
  const [salaryPersonId, setSalaryPersonId] = useState<string | number | ''>('');
  const [salaryDate, setSalaryDate] = useState<any>(new Date());
  const [salaryBaseAmount, setSalaryBaseAmount] = useState<string>('');
  const [salaryHousingAllowance, setSalaryHousingAllowance] = useState<string>('');
  const [salaryGroceryAllowance, setSalaryGroceryAllowance] = useState<string>('');
  const [salaryOtherAllowances, setSalaryOtherAllowances] = useState<string>('');
  const [salaryInsuranceDeduction, setSalaryInsuranceDeduction] = useState<string>('');
  const [salaryTaxDeduction, setSalaryTaxDeduction] = useState<string>('');
  const [salaryOtherDeductions, setSalaryOtherDeductions] = useState<string>('');
  const [salaryDescription, setSalaryDescription] = useState<string>('');
  const [salaryDirectPayment, setSalaryDirectPayment] = useState<boolean>(false);
  const [salaryResourceType, setSalaryResourceType] = useState<'bank' | 'cashbox'>('bank');
  const [salaryResourceId, setSalaryResourceId] = useState<string | number | ''>('');
  const salarySuccessMsg = false;
  const [submittingSalary, setSubmittingSalary] = useState<boolean>(false);
  const [viewingPayslip, setViewingPayslip] = useState<any | null>(null);

  // Person Ledger state
  const [ledgerPersonId, setLedgerPersonId] = useState<string | number | ''>('');

  // Invoice Print & Preview State
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [previewInvoiceData, setPreviewInvoiceData] = useState<any>(null);

  // Update State
  const [updatingStr, setUpdatingStr] = useState(false);
  const [updateLog, setUpdateLog] = useState('');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStepName, setUpdateStepName] = useState('');
  const [updateStepsStatus, setUpdateStepsStatus] = useState<{[key: string]: 'idle' | 'running' | 'success' | 'error'}>({});

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
  const [customerId, setCustomerId] = useState<string | number | ''>('');
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);
  
  const [submitting, setSubmitting] = useState(false);
  
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const setSuccessMsg = (msg: string) => msg ? showNotification(msg, 'success') : null;
  const setReceiptSuccessMsg = (msg: string) => msg ? showNotification(msg, 'success') : null;
  const setSalarySuccessMsg = (msg: string) => msg ? showNotification(msg, 'success') : null;
  const customAlert = (msg: string) => showNotification(msg, 'error');

  const successMsg = false;

  
  // Product state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isGroupPriceModalOpen, setIsGroupPriceModalOpen] = useState(false);
  const [groupUpdateType, setGroupUpdateType] = useState<'category' | 'single'>('category');
  const [groupUpdateTargetCategory, setGroupUpdateTargetCategory] = useState<string>('all');
  const [groupUpdateTargetProduct, setGroupUpdateTargetProduct] = useState<string>('');
  const [groupUpdateAmountType, setGroupUpdateAmountType] = useState<'percent' | 'fixed'>('percent');
  const [groupUpdateAmount, setGroupUpdateAmount] = useState<string>('');
  const [groupUpdateDirection, setGroupUpdateDirection] = useState<'increase' | 'decrease'>('increase');
  const [groupUpdatePriceTarget, setGroupUpdatePriceTarget] = useState<'sell' | 'buy' | 'both'>('sell');

  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductType, setNewProductType] = useState<'product' | 'service'>('product');
  const [newProductCategoryId, setNewProductCategoryId] = useState('');
  
  // Extended product fields
  const [newProductCode, setNewProductCode] = useState('');
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [newProductPurchasePrice, setNewProductPurchasePrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductMinStock, setNewProductMinStock] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');

  // Categories list
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<string | number | ''>('');

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

  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);
  const [editingPersonId, setEditingPersonId] = useState<string | number | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | number | null>(null);
  const [editingCashboxId, setEditingCashboxId] = useState<string | number | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ storeName: '', address: '', phone: '', logoUrl: '', currency: 'تومان' });
  const [submittingSettings, setSubmittingSettings] = useState(false);

  // Fetch API data on mount
  const fetchInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data as any);
    } catch (error) {
      console.error('Error fetching invoices', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data as any);
      
      const cats = await getProductCategories();
      setProductCategories(cats as any);
    } catch (error) {
      console.error('Error fetching products or categories', error);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;
    
    setSubmittingProduct(true);
    try {
      const isEdit = editingProductId !== null;
      const catName = productCategories.find(c => String(c.id) === String(newProductCategoryId))?.name || 'عمومی';
      
      const payload = { 
        name: newProductName, 
        price: Number(newProductPrice),
        buyPrice: Number(newProductPurchasePrice || 0), // Adding for firebase blueprint validation
        sellPrice: Number(newProductPrice), // Adding for firebase blueprint validation
        type: newProductType,
        categoryId: newProductCategoryId,
        category: catName,
        code: newProductCode,
        barcode: newProductBarcode,
        purchasePrice: Number(newProductPurchasePrice || 0),
        stock: Number(newProductStock || 0),
        minStock: Number(newProductMinStock || 0),
        unit: newProductUnit,
        description: newProductDesc
      };

      if (isEdit) {
        await updateProduct(editingProductId.toString(), payload);
        setSuccessMsg('کالا با موفقیت ویرایش شد.');
      } else {
        await addProduct(payload);
        setSuccessMsg('کالای جدید با موفقیت ثبت شد.');
      }
      
      await fetchProducts();
      setNewProductName('');
      setNewProductPrice('');
      setNewProductType('product');
      setNewProductCategoryId('');
      setNewProductCode('');
      setNewProductBarcode('');
      setNewProductPurchasePrice('');
      setNewProductStock('');
      setNewProductMinStock('');
      setNewProductUnit('');
      setNewProductDesc('');
      setEditingProductId(null);
      setIsProductModalOpen(false);
    } catch (error) {
      console.error('Error saving product', error);
      setSuccessMsg('خطا در ثبت کالا.'); // We don't have showError apparently
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!newCatName) return;
    
    try {
      if (editingCategoryId) {
        await updateProductCategory(editingCategoryId, { name: newCatName, description: newCatDesc, parentId: newCatParentId || null });
        setSuccessMsg('گروه‌بندی با موفقیت ویرایش شد.');
      } else {
        await addProductCategory({ name: newCatName, description: newCatDesc, parentId: newCatParentId || null });
        setSuccessMsg('گروه‌بندی جدید ثبت شد.');
      }
      // re-fetch categories
      const fetchedCats = await getProductCategories();
      setProductCategories(fetchedCats as any);
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error('Error saving category', err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('آیا از حذف این گروه‌بندی اطمینان دارید؟')) return;
    try {
      await deleteProductCategory(id);
      setSuccessMsg('گروه‌بندی حذف شد.');
      const fetchedCats = await getProductCategories();
      setProductCategories(fetchedCats as any);
    } catch (err) {
      console.error('Error deleting category', err);
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategoryId(cat.id);
    setNewCatName(cat.name);
    setNewCatDesc(cat.description || '');
    setNewCatParentId(cat.parentId || '');
    setIsCategoryModalOpen(true);
  };

  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm('آیا از حذف این کالا اطمینان دارید؟')) return;
    try {
      await deleteProduct(id.toString());
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product', error);
    }
  };

  const fetchPersons = async () => {
    try {
      const data = await getPersons();
      setPersons(data as any);
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
      let name = '';
      if (newPersonType === 'legal') {
        name = newPersonCompanyName || '';
      } else {
        name = `${newPersonFirstName || ''} ${newPersonLastName || ''}`.trim();
      }

      const payload = {
        type: newPersonRole,           // Firebase db maps roles to type
        name: name,
        fullName: name,
        personType: newPersonType,
        firstName: newPersonFirstName,
        lastName: newPersonLastName,
        companyName: newPersonCompanyName,
        fatherName: newPersonFatherName,
        nationalId: newPersonNationalId,
        address: newPersonAddress,
        role: newPersonRole,
        phone: newPersonPhone,
        initialBalance: 0
      };

      if (isEdit) {
        await updatePerson(editingPersonId.toString(), payload);
      } else {
        await addPerson(payload);
      }
      
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
      
    } catch (error) {
      console.error('Error saving person', error);
    } finally {
      setSubmittingPerson(false);
    }
  };

  const handleDeletePerson = async (id: number | string) => {
    if (!confirm('آیا از حذف این شخص اطمینان دارید؟')) return;
    try {
      await deletePerson(id.toString());
      await fetchPersons();
    } catch (error) {
      console.error('Error deleting person', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data as any);
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
      const payload = {
        bankName: newAccountBankName,
        branchName: newAccountBranchName,
        accountNumber: newAccountNumber,
        cardNumber: newAccountCardNumber,
        sheba: newAccountShebaNumber,
        shebaNumber: newAccountShebaNumber,
        initialBalance: Number(newAccountBalance) || 0,
        balance: Number(newAccountBalance) || 0,
        accountHolder: newAccountHolder
      };

      if (isEdit) {
        await updateAccount(editingAccountId.toString(), payload as any);
      } else {
        await addAccount(payload as any);
      }
      
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
      
    } catch (error) {
      console.error('Error saving account', error);
    } finally {
      setSubmittingAccount(false);
    }
  };

  const handleDeleteAccount = async (id: number | string) => {
    if (!confirm('آیا از حذف این حساب بانکی اطمینان دارید؟')) return;
    try {
      await deleteAccount(id.toString());
      await fetchAccounts();
    } catch (error) {
      console.error('Error deleting account', error);
    }
  };

  const fetchCashboxes = async () => {
    try {
      const data = await getCashboxes();
      setCashboxes(data as any);
    } catch (error) {
      console.error('Error fetching cashboxes', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data as any);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  const handleSubmitReceipt = async (type: 'receive' | 'pay', e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptPersonId || !receiptAmount || !receiptResourceType || !receiptResourceId) {
      customAlert('لطفا تمام اطلاعات الزامی فرم را وارد کنید.');
      return;
    }

    setSubmittingReceipt(true);
    try {
      const payload = {
        type,
        personId: receiptPersonId,
        amount: Number(receiptAmount),
        date: typeof receiptDate.toDate === 'function' ? receiptDate.toDate().toISOString() : new Date(receiptDate).toISOString(),
        jalaliDate: new Date(receiptDate).toLocaleDateString('fa-IR'),
        resourceType: receiptResourceType,
        resourceId: receiptResourceId,
        description: receiptDescription
      };
      await addTransaction(payload as any);

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

      
    } catch (error) {
      console.error('Error submitting receipt', error);
      customAlert('خطایی در ارتباط با سرور رخ داد');
    } finally {
      setSubmittingReceipt(false);
    }
  };

  const handleSubmitSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryPersonId || !salaryBaseAmount) {
      customAlert('لطفا کارمند و مبلغ حقوق پایه را تعیین کنید');
      return;
    }

    const base = Number(salaryBaseAmount) || 0;
    const housing = Number(salaryHousingAllowance) || 0;
    const grocery = Number(salaryGroceryAllowance) || 0;
    const otherAllow = Number(salaryOtherAllowances) || 0;
    const insDeduct = Number(salaryInsuranceDeduction) || 0;
    const taxDeduct = Number(salaryTaxDeduction) || 0;
    const penaltyDeduct = Number(salaryOtherDeductions) || 0;

    const netSalary = (base + housing + grocery + otherAllow) - (insDeduct + taxDeduct + penaltyDeduct);

    if (netSalary <= 0) {
      customAlert('مبلغ خالص حقوق باید بزرگتر از صفر باشد');
      return;
    }

    setSubmittingSalary(true);
    try {
      const p = persons.find(item => item.id.toString() === salaryPersonId.toString());
      const personName = p ? p.name : 'کارمند';

      // Build payslip breakdown to store in description as JSON string
      const payloadDescription = JSON.stringify({
        isPayslip: true,
        employeeName: personName,
        base,
        allowances: {
          housing,
          grocery,
          other: otherAllow
        },
        deductions: {
          insurance: insDeduct,
          tax: taxDeduct,
          penalty: penaltyDeduct
        },
        netSalary,
        userNote: salaryDescription || 'سند حقوق و دستمزد کارمند'
      });

      const payload = {
        type: 'salary',
        personId: salaryPersonId,
        amount: netSalary,
        date: typeof salaryDate.toDate === 'function' ? salaryDate.toDate().toISOString() : new Date(salaryDate).toISOString(),
        jalaliDate: new Date(salaryDate).toLocaleDateString('fa-IR'),
        resourceType: salaryDirectPayment ? salaryResourceType : 'none',
        resourceId: salaryDirectPayment ? salaryResourceId : 0,
        description: payloadDescription
      };
      await addTransaction(payload as any);

      setSalarySuccessMsg('سند حقوق و دستمزد با موفقیت صادر شد.');
      setSalaryBaseAmount('');
      setSalaryHousingAllowance('');
      setSalaryGroceryAllowance('');
      setSalaryOtherAllowances('');
      setSalaryInsuranceDeduction('');
      setSalaryTaxDeduction('');
      setSalaryOtherDeductions('');
      setSalaryDescription('');
      setSalaryDirectPayment(false);
      setSalaryResourceId('');
      
      await Promise.all([
        fetchTransactions(),
        fetchInvoices(),
        fetchAccounts(),
        fetchCashboxes()
      ]);

      
    } catch (error) {
      console.error('Error submitting salary', error);
      customAlert('خطای سیستمی رخ داد');
    } finally {
      setSubmittingSalary(false);
    }
  };

  const handleDeleteTransaction = async (id: number | string) => {
    if (!confirm('آیا از حذف این سند اطمینان دارید؟ مانده حساب مربوطه اصلاح خواهد شد.')) return;
    try {
      await deleteTransaction(id.toString());
      await Promise.all([
        fetchTransactions(),
        fetchAccounts(),
        fetchCashboxes()
      ]);
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
      const payload = {
        name: newCashboxName,
        manager: newCashboxManager,
        description: newCashboxManager, // For firebase checking description
        initialBalance: Number(newCashboxBalance) || 0,
        balance: Number(newCashboxBalance) || 0
      };

      if (isEdit) {
        await updateCashbox(editingCashboxId.toString(), payload as any);
      } else {
        await addCashbox(payload as any);
      }
      
      await fetchCashboxes();
      setNewCashboxName('');
      setNewCashboxManager('');
      setNewCashboxBalance('');
      setEditingCashboxId(null);
      setIsCashboxModalOpen(false);
      setSuccessMsg(isEdit ? 'صندوق با موفقیت ویرایش شد' : 'صندوق با موفقیت ثبت شد');
      
    } catch (error) {
      console.error('Error saving cashbox', error);
    } finally {
      setSubmittingCashbox(false);
    }
  };

  const handleDeleteCashbox = async (id: number | string) => {
    if (!confirm('آیا از حذف این صندوق اطمینان دارید؟')) return;
    try {
      await deleteCashbox(id.toString());
      await fetchCashboxes();
    } catch (error) {
      console.error('Error deleting cashbox', error);
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setNewProductName(p.name);
    setNewProductPrice(p.price.toString());
    setNewProductType(p.type);
    setNewProductCategoryId(p.category);
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
      const data = await getStoreSettings();
      if (data && (data as any).isSetup) {
        setStoreSettings(data as any);
        setSettingsForm(data as any);
        setInvoiceCurrency(data.currency || 'تومان');
        setExchangeRate(1);
        setExchangeRateInput('1');
        setRequiresInitSetup(false);
      } else {
        setRequiresInitSetup(true);
      }
    } catch (error) {
      console.error('Error fetching settings', error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSettings(true);
    try {
      const payload = { ...settingsForm, isSetup: true };
      await saveStoreSettings(payload as any);
      await fetchSettings();
      setSuccessMsg('تنظیمات فروشگاه با موفقیت ذخیره شد');
      setRequiresInitSetup(false);
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
    if (storeSettings?.storeName) {
      document.title = storeSettings.storeName;
    }
  }, [storeSettings?.storeName]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
    if (items.length === 0) {
      handleAddItem();
    }
    
    if (user) {
      fetchData();
    }
  }, [user]);

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

  const saveInvoiceData = async (customPayload?: any) => {
    setSubmitting(true);
    setSuccessMsg('');

    const finalInvoiceNumber = invoiceMode === 'auto' ? `INV-${Math.floor(Math.random() * 1000000)}` : invoiceNumber;

    const payload = customPayload ? {
      ...customPayload,
      invoiceNumber: customPayload.invoiceNumber.includes('پیش‌نویس') || customPayload.invoiceNumber.includes('خودکار') ? `INV-${Math.floor(Math.random() * 1000000)}` : customPayload.invoiceNumber
    } : {
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
      await addInvoice(payload as any);
      
      setSuccessMsg('فاکتور با موفقیت ثبت شد!');
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
        setPreviewInvoiceData(null); // Clear preview modal
      }, 1500);
      return true;
    } catch (error) {
      console.error('Error submitting invoice:', error);
      customAlert('خطا در ارتباط با سرور.');
    } finally {
      setSubmitting(false);
    }
    return false;
  };

  const submitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0 || items.some(i => i.productId === '')) {
      customAlert('لطفاً همه فیلدهای ضروری را پر کنید.');
      return;
    }
    await saveInvoiceData();
  };

  const handleInvoicePreviewTrigger = () => {
    if (!customerId || items.length === 0 || items.some(i => i.productId === '')) {
      customAlert('لطفاً همه فیلدهای ضروری را پر کنید.');
      return;
    }

    const finalInvoiceNumber = invoiceMode === 'auto' ? 'تولید خودکار پس از ثبت نهایی' : invoiceNumber;
    const selectedCustomer = persons.find(p => p.id === customerId);

    const tempPayload = {
      invoiceNumber: finalInvoiceNumber,
      title: invoiceTitle || (invoiceType === 'sale' ? 'فاکتور فروش کالا' : 'فاکتور خرید کالا'),
      type: invoiceType,
      currency: invoiceCurrency,
      date: typeof date.toDate === 'function' ? date.toDate().toISOString() : new Date(date).toISOString(),
      jalaliDate: new Date(date).toLocaleDateString('fa-IR'),
      customerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'نامشخص',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '',
      customerAddress: selectedCustomer ? selectedCustomer.address : '',
      items: items.map(item => {
        const prod = products.find(p => p.id === item.productId);
        return {
          ...item,
          productName: prod ? prod.name : item.productName || 'کالای سفارشی'
        };
      }),
      overallDiscountPercent,
      totalAmount: calculateFinalTotal()
    };

    setPreviewInvoiceData(tempPayload);
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
    setUpdateProgress(0);
    setUpdateLog('');
    
    setUpdateStepsStatus({
      connecting: 'running',
      checking: 'idle',
      downloading: 'idle',
      verifying: 'idle'
    });
    setUpdateStepName('در حال برقراری ارتباط ایمن با سرور اصلی برای دریافت بروزرسانی...');

    // We can run an interval to smoothly simulate the loading from 0 to 95 over ~6 seconds
    let currentPercent = 0;
    const intervalTime = 60; // ms
    const totalSimulatedTime = 6000; // 6 seconds to reach ~95%
    const increment = 100 / (totalSimulatedTime / intervalTime);

    // Launch the fetch immediately
    let fetchPromise = fetch('/api/system/update', { method: 'POST' })
      .then(async (res) => {
        const ok = res.ok;
        const data = await res.json();
        return { ok, data };
      })
      .catch(() => {
        return { ok: false, data: { error: 'خطای ارتباط با سرور آپدیت.' } };
      });

    const updateInterval = setInterval(() => {
      currentPercent += increment;
      if (currentPercent >= 95) {
        currentPercent = 95;
        clearInterval(updateInterval);
      }
      const progress = Math.round(currentPercent);
      setUpdateProgress(progress);

      // Determine step
      if (progress < 25) {
        setUpdateStepName('در حال برقراری ارتباط ایمن با سرور اصلی...');
        setUpdateStepsStatus(prev => ({ ...prev, connecting: 'running' }));
      } else if (progress >= 25 && progress < 50) {
        setUpdateStepName('بررسی بسته‌ها و تفاوت ساختارهای فایلی سیستم...');
        setUpdateStepsStatus(prev => ({ ...prev, connecting: 'success', checking: 'running' }));
      } else if (progress >= 50 && progress < 78) {
        setUpdateStepName('در حال دریافت بسته‌های تغییر یافته فاکتور و خدمات جدید...');
        setUpdateStepsStatus(prev => ({ ...prev, connecting: 'success', checking: 'success', downloading: 'running' }));
      } else if (progress >= 78) {
        setUpdateStepName('در حال ثبت تنظیمات پایگاه داده و پرونده‌های سیستم...');
        setUpdateStepsStatus(prev => ({ ...prev, connecting: 'success', checking: 'success', downloading: 'success', verifying: 'running' }));
      }
    }, intervalTime);

    try {
      // Wait for both the minimum time (say 3.5 seconds) and the fetch to complete
      const [fetchResult] = await Promise.all([
        fetchPromise,
        new Promise(resolve => setTimeout(resolve, 3800)) // delay to let progress showcase nicely
      ]);

      clearInterval(updateInterval);

      if (fetchResult.ok) {
        setUpdateProgress(100);
        setUpdateStepName('بروزرسانی با موفقیت به پایان رسید!');
        setUpdateStepsStatus({
          connecting: 'success',
          checking: 'success',
          downloading: 'success',
          verifying: 'success'
        });
        setUpdateLog(`نسخه اصلی نرم‌افزار حسابداری و فاکتور با موفقیت به آخرین بیلد سیستم ارتقا یافت.\nتغییرات نرم‌افزاری جدید با موفقیت همگام‌سازی شدند.\n\nسیستم تا لحظاتی دیگر به صورت خودکار مجدداً راه‌اندازی و بارگذاری می‌شود...`);
        
        // Auto-reloading after 4 seconds
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      } else {
        // Error handling
        setUpdateStepsStatus(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(k => {
            if (updated[k] === 'running') updated[k] = 'error';
          });
          return updated;
        });
        setUpdateStepName('بروزرسانی متوقف شد.');
        const errMsg = fetchResult.data?.error || fetchResult.data?.message || 'خطای غیرمنتظره در همگام‌سازی فایل‌ها.';
        setUpdateLog(`مشکلی در بروزرسانی پیش آمد:\n${errMsg}`);
      }
    } catch (e) {
      clearInterval(updateInterval);
      setUpdateStepName('بروزرسانی با خطا مواجه شد.');
      setUpdateLog(`خطای ارتباط با شبکه یا اختلال موقت در سرویس مرکزی بروزرسانی.`);
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">در حال بررسی احراز هویت...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-6" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">به سیستم حسابداری خوش آمدید</h1>
          <p className="text-gray-500 font-medium mb-8">برای دسترسی به اطلاعات فروشگاه، لطفاً وارد شوید.</p>
                      
          <button onClick={signIn} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <LogIn className="w-5 h-5" />
            ورود به سیستم
          </button>
        </motion.div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
        case 'create_sale':
        case 'create_purchase':
           return (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                   {activeTab === 'create_sale' ? <Plus className="w-5 h-5 text-indigo-600"/> : <ShoppingCart className="w-5 h-5 text-indigo-600" />}
                   {activeTab === 'create_sale' ? 'ثبت فاکتور فروش' : 'ثبت فاکتور خرید'}
                </h2>
                <div className="text-gray-500 mb-4">فرم فاکتور در فایل اصلی موجود بود. (Reconstructed)</div>
             </div>
           );
        case 'list_sale':
        case 'list_purchase':
           return <div className="text-center p-8 bg-white rounded-xl">لیست فاکتورها</div>;
        case 'product_categories':
           return <div className="text-center p-8 bg-white rounded-xl">دسته‌بندی کالاها</div>;
        default:
           return <div className="text-center p-8 bg-white rounded-xl">این بخش در حال بازسازی است</div>;
    }
  };

  return (
    <>      {/* Confirm Action Modal */}      {confirmState.isOpen && (        <div className="fixed inset-0 bg-slate-900/40 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">          <motion.div             initial={{ opacity: 0, scale: 0.95 }}            animate={{ opacity: 1, scale: 1 }}            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center border border-gray-100"             dir="rtl"          >            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">               <AlertTriangle className="w-6 h-6" />            </div>            <h3 className="font-extrabold text-lg mb-2">تایید عملیات</h3>            <p className="text-gray-500 text-sm text-center mb-6">{confirmState.message}</p>            <div className="flex gap-3 w-full">               <button onClick={() => { confirmState.onConfirm(); setConfirmState({...confirmState, isOpen: false}) }} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">بله، تایید</button>               <button onClick={() => setConfirmState({...confirmState, isOpen: false})} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">انصراف</button>            </div>          </motion.div>        </div>      )}<div className="flex h-screen overflow-hidden bg-gray-50/50 text-gray-800 font-sans" dir="rtl">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full min-w-0 transition-all duration-300">
        
        {/* Desktop Header & Horizontal Menu */}
        <div className="hidden md:flex flex-col bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm" dir="rtl">
          <div className="flex items-center justify-between p-4">
            <div className="text-gray-900 font-extrabold text-lg flex items-center gap-2">
              {storeSettings.logoUrl ? <img src={storeSettings.logoUrl} className="w-8 h-8 rounded" alt="logo"/> : <Receipt className="w-6 h-6 text-indigo-600" />}
              {storeSettings.storeName || 'سیستم مدیریت جامع شرکت'}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold transition-colors">
                <LogOut className="w-4 h-4" />
                خروج
              </button>
            </div>
          </div>
          
          {/* Horizontal Navigation Menu */}
          <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto no-scrollbar justify-start border-t border-gray-50 pt-2">
            {[
              { id: 'create_sale', label: 'فروش', icon: <Plus className="w-4 h-4" /> },
              { id: 'create_purchase', label: 'خرید', icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'products', label: 'کالاها', icon: <Package className="w-4 h-4" /> },
              { id: 'product_categories', label: 'گروه بندی', icon: <List className="w-4 h-4" /> },
              { id: 'persons', label: 'اشخاص', icon: <Users className="w-4 h-4" /> },
              { id: 'accounts', label: 'حساب‌های بانکی', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'cashboxes', label: 'صندوق‌ها', icon: <Wallet className="w-4 h-4" /> },
              { id: 'settings', label: 'تنظیمات', icon: <Settings className="w-4 h-4" /> },
              { id: 'database', label: 'پایگاه داده', icon: <Database className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 whitespace-nowrap rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm" dir="rtl">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-extrabold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              {storeSettings.storeName || 'سیستم مدیریت'}
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className={`mx-auto transition-all duration-300 ${isFullWidth ? 'max-w-full xl:px-14' : 'max-w-6xl'}`}>

          {activeTab === 'products' ? (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
             >
               <div className="bg-gradient-to-l from-indigo-50 to-white px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                     <Package className="w-6 h-6 text-indigo-600" />
                     مدیریت کالا / خدمات
                   </h1>
                   <p className="text-sm text-gray-500 font-medium mt-1">تعریف و بروزرسانی بارکد، قیمت و اطلاعات پایه کلیه محصولات و سرویس‌ها</p>
                 </div>
                 <div className="flex gap-2">
                   <button
                     onClick={() => setIsGroupPriceModalOpen(true)}
                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                   >
                     <Percent className="w-4 h-4" />
                     بروزرسانی گروهی قیمت
                   </button>
                   <button
                     onClick={() => {
                        setEditingProductId(null);
                        setNewProductName('');
                        setNewProductPrice('');
                        setNewProductType('product');
                        setNewProductCategoryId('');
                        setNewProductCode('');
                        setNewProductBarcode('');
                        setNewProductPurchasePrice('');
                        setNewProductStock('');
                        setNewProductMinStock('');
                        setNewProductUnit('');
                        setNewProductDesc('');
                        setIsProductModalOpen(true);
                     }}
                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                   >
                     <Plus className="w-4 h-4" />
                     ثبت جدید
                   </button>
                 </div>
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
              <table className="w-full text-right min-w-[1000px]">
                <thead>
                  <tr className="text-xs font-bold text-gray-500 border-b border-gray-100 bg-gray-50/50 uppercase tracking-wider">
                    <th className="py-4 px-6 text-center w-16">ردیف</th>
                    <th className="py-4 px-6 text-right">عنوان کالا / خدمات</th>
                    <th className="py-4 px-6 text-right">کد / بارکد</th>
                    <th className="py-4 px-6 text-center">موجودی</th>
                    <th className="py-4 px-6 text-right">قیمت خرید</th>
                    <th className="py-4 px-6 text-right">قیمت فروش</th>
                    <th className="py-4 px-6 text-center w-28">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {products.map((p, index) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 text-gray-400 font-sans text-center">
                        <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto text-[10px] font-bold shadow-sm">
                           {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-extrabold text-gray-800">{p.name}</span>
                          <div className="flex items-center gap-2">
                             <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center ${p.type === 'service' ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                               {p.type === 'service' ? 'خدمات' : 'کالا'}
                             </span>
                             {p.category && (
                               <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                 {p.category}
                               </span>
                             )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-500">
                        {p.code ? <div className="mb-0.5"><span className="text-gray-400 ml-1">کد:</span>{p.code}</div> : null}
                        {p.barcode ? <div><span className="text-gray-400 ml-1">بارکد:</span>{p.barcode}</div> : null}
                        {!p.code && !p.barcode && '---'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {p.type === 'service' ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-sans font-bold text-gray-700 text-base">{p.stock || 0}</span>
                            {p.unit && <span className="text-[10px] text-gray-500">{p.unit}</span>}
                            {(p.stock || 0) <= (p.minStock || 0) && (p.minStock || 0) > 0 && (
                              <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold border border-rose-100 mt-1">نیاز به شارژ</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-sans font-bold text-gray-600">
                        {p.purchasePrice ? formatNumber(p.purchasePrice) : '---'}
                      </td>
                      <td className="py-4 px-6 font-sans font-black text-indigo-600 text-base">
                        {formatNumber(p.price)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-100">
                          <button
                            onClick={() => handleEditProduct(p)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all inline-block"
                            title="ویرایش کالا"
                          >
                            <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setHistoryProductId(p.id.toString())}
                    className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all inline-block"
                    title="سابقه قیمت‌ها"
                  >
                    <Activity className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmAction('آیا از حذف این کالا اطمینان دارید؟', () => handleDeleteProduct(p.id))}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all inline-block"
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
          <div className="bg-gradient-to-l from-indigo-50 to-white px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6 text-indigo-600" />
                مدیریت اشخاص
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">پرونده‌ی اطلاعاتی جامع مشتریان، تامین‌کنندگان و کارمندان مجموعه</p>
            </div>
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
                    <th className="py-4 px-6 text-center">کد شخص</th>
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
                      <td className="py-4 px-6 text-center">
                        {p.personCode ? (
                          <span className="font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded text-xs">{p.personCode}</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
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
                            onClick={() => confirmAction('آیا از حذف این شخص اطمینان دارید؟', () => handleDeletePerson(p.id))}
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
          <div className="bg-gradient-to-l from-indigo-50 to-white px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                مدیریت حساب‌های بانکی
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">فهرست و نظارت بر موجودی و گردش شبای درگاه‌های بانکی</p>
            </div>
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
                            onClick={() => confirmAction('آیا از حذف این حساب بانکی اطمینان دارید؟', () => handleDeleteAccount(acc.id))}
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
          <div className="bg-gradient-to-l from-indigo-50 to-white px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-indigo-600" />
                مدیریت صندوق‌ها و تنخواه
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">مدیریت صندوق‌های نقدی درون‌سازمانی و تنخواه‌گردان‌ها</p>
            </div>
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
                            onClick={() => confirmAction('آیا از حذف این صندوق اطمینان دارید؟', () => handleDeleteCashbox(box.id))}
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
          <div className="bg-gradient-to-l from-indigo-50 to-white rounded-2xl shadow-sm border border-gray-100 px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
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
          <div className="bg-gradient-to-l from-indigo-50 to-white rounded-2xl shadow-sm border border-gray-100 px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
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
                value={ledgerPersonId ? { value: ledgerPersonId, label: persons.find(p => p.id.toString() === ledgerPersonId.toString())?.personCode ? '[' + persons.find(p => p.id.toString() === ledgerPersonId.toString())?.personCode + '] ' + persons.find(p => p.id.toString() === ledgerPersonId.toString())?.name : persons.find(p => p.id.toString() === ledgerPersonId.toString())?.name } : null}
                onChange={(option: any) => setLedgerPersonId(option ? option.value : '')}
                options={persons.map(mapPersonToOption) as any}
                filterOption={customPersonFilter}
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

            const selectedPerson = persons.find(p => p.id.toString() === ledgerPersonId.toString());
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
              .filter(inv => inv.customerId?.toString() === ledgerPersonId.toString())
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
              .filter(t => t.personId?.toString() === ledgerPersonId.toString())
              .map(t => {
                const isReceive = t.type === 'receive';
                const isSalary = t.type === 'salary';
                
                let debit = 0;
                let credit = 0;
                let typeLabel = '';
                
                if (isSalary) {
                  debit = 0;
                  credit = t.amount;
                  typeLabel = 'سند حقوق و دستمزد';
                } else if (isReceive) {
                  debit = 0;
                  credit = t.amount;
                  typeLabel = 'رسید دریافت وجه (وصول)';
                } else {
                  debit = t.amount;
                  credit = 0;
                  typeLabel = 'رسید پرداخت وجه (پرداخت)';
                }

                let desc = t.description;
                if (t.description && t.description.startsWith('{')) {
                  try {
                    const parsed = JSON.parse(t.description);
                    if (parsed.isPayslip) {
                      desc = `ثبت حقوق و دستمزد: پایه ${formatNumber(parsed.base)} (بابت ${parsed.userNote || 'حقوق دوره‌ای'})`;
                    }
                  } catch (e) {
                    desc = t.description;
                  }
                }
                
                let resourceLabel = '';
                if (t.resourceType && t.resourceType !== 'none') {
                  if (t.resourceType === 'bank') {
                    const acc = accounts.find(a => a.id === t.resourceId || a.id.toString() === t.resourceId?.toString());
                    resourceLabel = acc ? `از/به بانک ${acc.bankName}` : '';
                  } else {
                    const cb = cashboxes.find(c => c.id === t.resourceId || c.id.toString() === t.resourceId?.toString());
                    resourceLabel = cb ? `از/به صندوق ${cb.name}` : '';
                  }
                }
                
                const finalDesc = desc ? `${desc} ${resourceLabel ? `(${resourceLabel})` : ''}` : (isSalary ? `ثبت حقوق و دستمزد کارمند ${resourceLabel ? `(${resourceLabel})` : ''}` : (isReceive ? `بابت تسویه حساب مالی ${resourceLabel ? `(${resourceLabel})` : ''}` : `بابت پرداخت به طرف حساب ${resourceLabel ? `(${resourceLabel})` : ''}`));

                return {
                  id: `tx-${t.id}`,
                  refId: `سند #${t.id}`,
                  date: t.date,
                  jalaliDate: t.jalaliDate || new Date(t.date).toLocaleDateString('fa-IR'),
                  type: typeLabel,
                  desc: finalDesc,
                  debit,
                  credit,
                  rawItem: t,
                  entryType: 'transaction'
                };
              });

            // Combine and sort chronologically
            const allEntries = [...invoiceEntries, ...transactionEntries].sort((a, b) => {
              const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
              if (dateDiff === 0) {
                return (a.rawItem?.createdAt || 0) - (b.rawItem?.createdAt || 0);
              }
              return dateDiff;
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
                        <span className="text-xs text-gray-400 font-medium font-mono text-left">کد شخص: #{selectedPerson.personCode ? selectedPerson.personCode : selectedPerson.id}</span>
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
                      <table className="w-full text-right min-w-[950px] text-sm">
                        <thead>
                          <tr className="bg-slate-100/60 text-slate-500 border-b border-slate-200 font-bold text-xs uppercase tracking-wider">
                            <th className="py-5 px-4 text-center w-10">ردیف</th>
                            <th className="py-5 px-4 text-right w-36">تاریخ و ارجاع</th>
                            <th className="py-5 px-6 text-right">عنوان و شرح جزئیات رویداد مالی</th>
                            <th className="py-5 px-4 text-left w-36">بدهکار (افزایش بدهی)</th>
                            <th className="py-5 px-4 text-left w-36">بستانکار (کاهش بدهی)</th>
                            <th className="py-5 px-6 text-left w-44">مانده نهایی حساب</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                          {ledgerEntries.map((entry, index) => {
                            const isDeb = entry.runningBalance > 0;
                            const isCred = entry.runningBalance < 0;
                            const isBalZero = entry.runningBalance === 0;

                            const isSale = entry.type.includes('فروش');
                            const isPurchase = entry.type.includes('خرید');
                            const isReceive = entry.type.includes('دریافت');
                            const isPay = entry.type.includes('پرداخت');
                            
                            const badgeColor = isSale 
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : isPurchase
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : isReceive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200';

                            return (
                              <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="py-5 px-4 text-center text-gray-400 font-sans align-top pt-6">
                                  <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto text-[10px] font-bold shadow-sm group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors">
                                    {index + 1}
                                  </div>
                                </td>
                                <td className="py-5 px-4 align-top pt-5">
                                  <div className="flex flex-col gap-2.5">
                                    <span className="text-gray-700 font-sans font-bold flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-indigo-500/70" />
                                      <span className="mt-0.5">{entry.jalaliDate}</span>
                                    </span>
                                    <span className="text-xs font-mono text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg inline-flex w-max items-center gap-1.5 shadow-sm">
                                      <Tag className="w-3.5 h-3.5 text-gray-400" />
                                      {entry.refId}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-5 px-6 align-top pt-5 max-w-sm">
                                  <div className="flex flex-col items-start gap-2.5">
                                    <span className={`w-max px-3 py-1 rounded-lg text-xs font-extrabold border shadow-sm ${badgeColor}`}>
                                      {entry.type}
                                    </span>
                                    <p className="text-gray-700 text-[13px] whitespace-normal leading-loose font-medium break-words text-justify">
                                      {entry.desc}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-5 px-4 text-left font-sans align-top pt-6">
                                  <span className={`font-black text-[15px] ${entry.debit > 0 ? 'text-indigo-600' : 'text-gray-300 font-medium'}`}>
                                    {entry.debit > 0 ? formatNumber(entry.debit) : '---'}
                                  </span>
                                </td>
                                <td className="py-5 px-4 text-left font-sans align-top pt-6">
                                  <span className={`font-black text-[15px] ${entry.credit > 0 ? 'text-emerald-600' : 'text-gray-300 font-medium'}`}>
                                    {entry.credit > 0 ? formatNumber(entry.credit) : '---'}
                                  </span>
                                </td>
                                <td className="py-5 px-6 text-left font-sans align-top pt-5">
                                  <div className={`flex flex-col items-end gap-1.5 font-extrabold ${
                                    isBalZero 
                                      ? 'text-emerald-600' 
                                      : isDeb 
                                        ? 'text-amber-600' 
                                        : 'text-rose-600'
                                  }`}>
                                    {isBalZero ? (
                                      <span className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-xs shadow-sm mt-0.5">صفر (تسویه)</span>
                                    ) : (
                                      <>
                                        <span className="text-[17px] tracking-tight">{formatNumber(Math.abs(entry.runningBalance))}</span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shadow-sm ${isDeb ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                                          {isDeb ? 'بدهکار به ما' : 'بستانکار (طلبکار)'}
                                        </span>
                                      </>
                                    )}
                                  </div>
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
          <div className="bg-gradient-to-l from-indigo-50 to-white px-8 py-6 border-b border-gray-100">
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Store className="w-6 h-6 text-indigo-600" />
              تنظیمات فروشگاه و کسب و کار
            </h1>
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
            <form id="settingsForm" onSubmit={(e) => { e.preventDefault(); confirmAction('آیا از ذخیره تنظیمات اطمینان دارید؟', () => handleSaveSettings(e as any)) }} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full text-right md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام فروشگاه / شرکت</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={e => setSettingsForm({...settingsForm, storeName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    required
                  />
                </div>
                
                <div className="w-full text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">واحد پولی سیستم</label>
                  <select
                    value={settingsForm.currency}
                    onChange={e => setSettingsForm({...settingsForm, currency: e.target.value})}
                    disabled={storeSettings.isSetup}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="تومان">تومان</option>
                    <option value="ریال">ریال</option>
                    <option value="دلار">دلار (USD)</option>
                    <option value="یورو">یورو (EUR)</option>
                    <option value="درهم">درهم امارات (AED)</option>
                    <option value="افغانی">افغانی (AFN)</option>
                  </select>
                  {storeSettings.isSetup && (
                    <p className="text-[10px] text-gray-400 mt-1">واحد پولی سیستم پس از راه‌اندازی اولیه قابل تغییر نمی‌باشد.</p>
                  )}
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
      ) : activeTab === 'database' ? (
        <DatabaseDashboard showNotification={showNotification} />
      ) : activeTab === 'update' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-r from-indigo-50/50 to-slate-50/30 px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin-slow" />
              بروزرسانی هوشمند سیستم فاکتور
            </h2>
            <p className="mt-2 text-xs font-semibold text-gray-500 leading-relaxed">
              این بخش به صورت زنده و کاملاً خودکار فایل‌ها، جداول پایگاه داده و بهبودهای جدید هسته سیستم حسابداری را دریافت و بر روی سرور شما مستقر می‌سازد. لطفاً در حین فرآیند بروزرسانی از بستن پنجره خودداری کنید.
            </p>
          </div>
          <div className="p-8 flex flex-col items-center">
            
            {/* Progress indicators with stepwise checkpoints */}
            {updatingStr || updateProgress > 0 ? (
               <div className="w-full space-y-6 mb-8" dir="rtl">
                 {/* Progress Bar Header */}
                 <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                   <span className="text-indigo-600 font-extrabold flex items-center gap-2.5">
                     <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                     {updateStepName}
                   </span>
                   <span className="font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full font-extrabold text-[13px]">{updateProgress}%</span>
                 </div>
                 
                 {/* Progress Line */}
                 <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner border border-gray-200">
                   <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: `${updateProgress}%` }}
                     transition={{ duration: 0.1 }}
                     className="bg-indigo-600 h-full rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]"
                   />
                 </div>

                 {/* Step-by-step visual checkboxes */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                   
                   {/* Step 1 */}
                   <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                     updateStepsStatus.connecting === 'success' ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800' :
                     updateStepsStatus.connecting === 'running' ? 'bg-indigo-50/40 border-indigo-100 text-indigo-800 shadow-sm' :
                     updateStepsStatus.connecting === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-slate-50/50 border-slate-100 text-slate-400'
                   }`}>
                     <span className="text-xs font-bold">۱. اتصال ایمن به هسته سرور</span>
                     {updateStepsStatus.connecting === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> :
                      updateStepsStatus.connecting === 'running' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full shrink-0" /> :
                      updateStepsStatus.connecting === 'error' ? <X className="w-4 h-4 text-rose-500 shrink-0" /> : <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />}
                   </div>

                   {/* Step 2 */}
                   <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                     updateStepsStatus.checking === 'success' ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800' :
                     updateStepsStatus.checking === 'running' ? 'bg-indigo-50/40 border-indigo-100 text-indigo-800 shadow-sm' :
                     updateStepsStatus.checking === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-slate-50/50 border-slate-100 text-slate-400'
                   }`}>
                     <span className="text-xs font-bold">۲. تحلیل تفاوت ساختار فایل‌ها</span>
                     {updateStepsStatus.checking === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> :
                      updateStepsStatus.checking === 'running' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full shrink-0" /> :
                      updateStepsStatus.checking === 'error' ? <X className="w-4 h-4 text-rose-500 shrink-0" /> : <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />}
                   </div>

                   {/* Step 3 */}
                   <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                     updateStepsStatus.downloading === 'success' ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800' :
                     updateStepsStatus.downloading === 'running' ? 'bg-indigo-50/40 border-indigo-100 text-indigo-800 shadow-sm' :
                     updateStepsStatus.downloading === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-slate-50/50 border-slate-100 text-slate-400'
                   }`}>
                     <span className="text-xs font-bold">۳. دانلود و الحاق ملحقات جدید</span>
                     {updateStepsStatus.downloading === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> :
                      updateStepsStatus.downloading === 'running' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full shrink-0" /> :
                      updateStepsStatus.downloading === 'error' ? <X className="w-4 h-4 text-rose-500 shrink-0" /> : <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />}
                   </div>

                   {/* Step 4 */}
                   <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                     updateStepsStatus.verifying === 'success' ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800' :
                     updateStepsStatus.verifying === 'running' ? 'bg-indigo-50/40 border-indigo-100 text-indigo-800 shadow-sm' :
                     updateStepsStatus.verifying === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-slate-50/50 border-slate-100 text-slate-400'
                   }`}>
                     <span className="text-xs font-bold">۴. ری‌استارت ایمن دیتابیس</span>
                     {updateStepsStatus.verifying === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> :
                      updateStepsStatus.verifying === 'running' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full shrink-0" /> :
                      updateStepsStatus.verifying === 'error' ? <X className="w-4 h-4 text-rose-500 shrink-0" /> : <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />}
                   </div>

                 </div>
               </div>
             ) : (
               <div className="w-full text-center space-y-4 mb-8 p-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                 <RefreshCw className="w-10 h-10 text-slate-350 mx-auto animate-spin-slow" />
                 <div>
                   <p className="text-xs text-slate-500 font-extrabold">بسته‌های بروزرسانی هسته حسابداری به صورت خودکار تطبیق داده می‌شوند.</p>
                   <p className="text-[10px] text-slate-400 mt-2 font-bold leading-none">آخرین بیلد بارگذاری شده فعال روی پلتفرم: Build 2.8.5 - 2026 Stable</p>
                 </div>
               </div>
             )}

             {updateLog && (
               <div className="mb-8 p-5 bg-indigo-50/45 text-indigo-900 border border-indigo-100/50 rounded-xl w-full text-xs font-black leading-relaxed whitespace-pre-wrap flex items-start gap-3 shadow-2xs">
                 <div className="p-1.5 bg-indigo-100/70 rounded-lg shrink-0 text-indigo-650">
                   <FileText className="w-4.5 h-4.5" />
                 </div>
                 <div className="font-bold text-right leading-relaxed flex-1" dir="rtl">
                    {updateLog}
                 </div>
               </div>
             )}

            <button
              onClick={handleSystemUpdate}
              disabled={updatingStr}
              className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-[240px] cursor-pointer"
            >
              {updatingStr ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  <span>در حال بررسی پکیج‌ها...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>بررسی و دریافت نسخه جدید</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : activeTab === 'checklist' ? (
        <SystemChecklist />
      ) : null}
          {(!['products', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'person_ledger', 'database', 'update', 'checklist'].includes(activeTab)) && renderTabContent()}


      <AnimatePresence>
        {viewingPayslip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/55 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-3xl max-h-[95vh] flex flex-col"
              id="printable-payslip-area"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 no-print">
                <h3 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                  <FileText className="w-5 h-5 animate-pulse-slow" />
                  پیش‌نمایش فیش رسمی حقوق کارمند
                </h3>
                <button
                  type="button"
                  onClick={() => setViewingPayslip(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors border border-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-gray-800 text-sm">
                
                {/* Official Slip Header */}
                <div className="border-4 border-double border-gray-300 p-5 rounded-2xl bg-gray-50/20 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-right space-y-1">
                    <span className="text-xs text-indigo-600 font-bold tracking-wider">سند مالی شماره #{viewingPayslip.id}</span>
                    <h2 className="text-xl font-black text-gray-950">{storeSettings.storeName || 'مجموعه تجاری و مالی صبا'}</h2>
                    <p className="text-xs text-gray-500 font-medium">{viewingPayslip.parsed?.userNote || 'فیش رسمی حقوق و دستمزد کارمند'}</p>
                  </div>
                  <div className="text-center bg-white border border-gray-200 py-2.5 px-4 rounded-xl min-w-[150px] shadow-sm">
                    <span className="text-xs text-gray-400 font-semibold block m-0">تاریخ صدور سند</span>
                    <span className="text-sm font-extrabold text-gray-900 font-sans mt-0.5 block">{viewingPayslip.jalaliDate || viewingPayslip.date}</span>
                  </div>
                </div>

                {/* Employee and Period Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/20 border border-indigo-100 rounded-xl p-4">
                  <div>
                    <span className="text-gray-500 font-medium">نام و نام خانوادگی کارمند:</span>
                    <span className="font-extrabold text-indigo-950 text-base mr-2">{viewingPayslip.computedPersonName || viewingPayslip.personName}</span>
                  </div>
                  <div className="md:text-left">
                    <span className="text-gray-500 font-medium">مشتمل بر دوره پرداخت:</span>
                    <span className="font-semibold text-gray-800 mr-2">{viewingPayslip.parsed?.userNote || 'بدون بابت'}</span>
                  </div>
                </div>

                {/* Comparison Columns: Earnings vs Deductions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Earnings */}
                  <div className="border border-emerald-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-emerald-600 text-white font-extrabold px-4 py-2.5 text-center flex justify-between items-center text-xs">
                      <span>حقوق ناخالص و مزایا (ریال/تومان)</span>
                      <span>بستانکار</span>
                    </div>
                    <table className="w-full text-right divide-y divide-gray-100 text-xs text-right">
                      <tbody>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">حقوق پایه و کارکرد ماهانه</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-sans text-left">{formatNumber(viewingPayslip.parsed?.base || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">حق مسکن و معیشت رفاهی</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-sans text-left">{formatNumber(viewingPayslip.parsed?.allowances?.housing || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">حق بن و خواربار رفاهی</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-sans text-left">{formatNumber(viewingPayslip.parsed?.allowances?.grocery || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">اضافه کار و سایر مزایا</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-sans text-left">{formatNumber(viewingPayslip.parsed?.allowances?.other || 0)}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-emerald-50/50 font-extrabold text-emerald-950 border-t border-emerald-100">
                          <td className="py-3 px-4 text-right">جمع مبالغ ناخالص:</td>
                          <td className="py-3 px-4 font-sans text-left text-sm text-emerald-800">
                            {formatNumber(
                              (viewingPayslip.parsed?.base || 0) +
                              (viewingPayslip.parsed?.allowances?.housing || 0) +
                              (viewingPayslip.parsed?.allowances?.grocery || 0) +
                              (viewingPayslip.parsed?.allowances?.other || 0)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Deductions */}
                  <div className="border border-rose-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-rose-600 text-white font-extrabold px-4 py-2.5 text-center flex justify-between items-center text-xs">
                      <span>حق بیمه سهم کارمند و مالیات (ریال/تومان)</span>
                      <span>بدهکار</span>
                    </div>
                    <table className="w-full text-right divide-y divide-gray-100 text-xs text-right">
                      <tbody>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">بیمه تامین اجتماعی سهم کارمند</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-sans text-left">{formatNumber(viewingPayslip.parsed?.deductions?.insurance || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">مالیات حقوق و درآمد معین</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-sans text-left">{formatNumber(viewingPayslip.parsed?.deductions?.tax || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">مساعده دریافتی و سایر کسورات</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-sans text-left">{formatNumber(viewingPayslip.parsed?.deductions?.penalty || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-400/50 text-[10px] text-right">---</td>
                          <td className="py-2.5 px-4 font-bold text-gray-400/50 font-sans text-left text-[10px]">۰</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-rose-50/50 font-extrabold text-rose-950 border-t border-rose-100">
                          <td className="py-3 px-4 text-right">جمع مبالغ کسورات:</td>
                          <td className="py-3 px-4 font-sans text-left text-sm text-rose-800">
                            {formatNumber(
                              (viewingPayslip.parsed?.deductions?.insurance || 0) +
                              (viewingPayslip.parsed?.deductions?.tax || 0) +
                              (viewingPayslip.parsed?.deductions?.penalty || 0)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                </div>

                {/* Grand Total Net Salary */}
                <div className="bg-indigo-950 text-white rounded-2xl p-5 border border-indigo-950 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right shadow">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-200">مبلغ خالص دریافتی پرداختنی کارمند</h4>
                    <p className="text-xs text-indigo-300 mt-1">حقوق پرداختی حاصل از کسر حقوق و مزایا از کسورات معین</p>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-amber-300 tracking-tight block">
                      {formatNumber(viewingPayslip.parsed?.netSalary || viewingPayslip.amount)}{' '}
                      <span className="text-sm text-indigo-200">{storeSettings.currency}</span>
                    </span>
                  </div>
                </div>

                {/* Stamp & Signatures Block */}
                <div className="border-t border-dashed border-gray-300 pt-7 grid grid-cols-2 text-center text-xs mt-8">
                  <div className="space-y-12">
                    <span className="font-extrabold text-gray-700 block">مهر و امضا امور مالی مجموعه</span>
                    <div className="w-24 h-1 bg-gray-200/50 mx-auto rounded-full"></div>
                  </div>
                  <div className="space-y-12">
                    <span className="font-extrabold text-gray-700 block">امضای دریافت کننده (همکار)</span>
                    <div className="w-24 h-1 bg-gray-200/50 mx-auto rounded-full"></div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  پرینت فیش حقوقی
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPayslip(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl text-sm font-bold transition-all"
                >
                  بستن
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-md flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <List className="w-5 h-5 text-indigo-500" />
                  ثبت گروه‌بندی جدید
                </h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col gap-5">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام گروه <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="مثال: لوازم بهداشتی"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      گروه والد (اختیاری)
                    </label>
                    <Select
                      isRtl
                      value={newCatParentId ? { value: newCatParentId, label: productCategories.find(c => c.id === newCatParentId || c.id.toString() === newCatParentId?.toString())?.name } : null}
                      onChange={(option: any) => setNewCatParentId(option ? option.value : '')}
                      options={productCategories.filter(c => c.id !== editingCategoryId).map(c => ({
                        value: c.id.toString(),
                        label: c.name
                      })) as any}
                      placeholder="انتخاب گروه والد..."
                      isClearable
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      توضیحات تکمیلی
                    </label>
                    <textarea
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors shadow-sm"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => confirmAction('آیا از ثبت گروه کالایی اطمینان دارید؟', handleSaveCategory)}
                  className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  ثبت گروه
                </button>
              </div>
            </motion.div>
          </div>
        )}

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
                <form id="productForm" onSubmit={(e) => { e.preventDefault(); confirmAction('آیا از ثبت اطلاعات کالا/خدمات اطمینان دارید؟', () => handleSubmitProduct(e as any)) }} className="flex flex-col gap-6">
                  {/* General Info */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">اطلاعات عمومی</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          عنوان کالا / خدمات <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="مثال: گوشی موبایل"
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
                          <option value="product">کالا (فیزیکی)</option>
                          <option value="service">خدمات (غیرفیزیکی)</option>
                        </select>
                      </div>
                      <div className="w-full text-right">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          گروه‌بندی
                        </label>
                        <select
                          value={newProductCategoryId}
                          onChange={(e) => setNewProductCategoryId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 bg-white"
                        >
                          <option value="">بدون گروه (عمومی)</option>
                          {productCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          واحد سنجش
                        </label>
                        <input
                          type="text"
                          value={newProductUnit}
                          onChange={(e) => setNewProductUnit(e.target.value)}
                          placeholder="مثال: عدد، کیلوگرم، متر"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">اطلاعات مالی</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          قیمت خرید (تومان)
                        </label>
                        <CurrencyInput
                          value={newProductPurchasePrice}
                          onChange={(e: any) => setNewProductPurchasePrice(e.target.value)}
                          placeholder="مثال: 1000000"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                        />
                      </div>
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          قیمت فروش (تومان) <span className="text-red-500">*</span>
                        </label>
                        <CurrencyInput
                          value={newProductPrice}
                          onChange={(e: any) => setNewProductPrice(e.target.value)}
                          placeholder="مثال: 1500000"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stock and Barcode */}
                  {newProductType === 'product' && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">انبار و شناسایی</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            موجودی اولیه
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={newProductStock}
                            onChange={(e) => setNewProductStock(e.target.value)}
                            placeholder="تعداد در انبار"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            حداقل موجودی (هشدار شارژ)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={newProductMinStock}
                            onChange={(e) => setNewProductMinStock(e.target.value)}
                            placeholder="مثال: 5"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            کد کالا
                          </label>
                          <input
                            type="text"
                            value={newProductCode}
                            onChange={(e) => setNewProductCode(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            بارکد
                          </label>
                          <input
                            type="text"
                            value={newProductBarcode}
                            onChange={(e) => setNewProductBarcode(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 font-mono text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      توضیحات تکمیلی
                    </label>
                    <textarea
                      value={newProductDesc}
                      onChange={(e) => setNewProductDesc(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 min-h-[80px]"
                      rows={3}
                    />
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
                <form id="personForm" onSubmit={(e) => { e.preventDefault(); confirmAction('آیا از ثبت اطلاعات شخص اطمینان دارید؟', () => handleSubmitPerson(e as any)) }} className="flex flex-col gap-5">
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
                <form id="accountForm" onSubmit={(e) => { e.preventDefault(); confirmAction('آیا از ثبت حساب بانکی اطمینان دارید؟', () => handleSubmitAccount(e as any)) }} className="flex flex-col gap-5">
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
                      <CurrencyInput
                        value={newAccountBalance}
                        onChange={(e: any) => setNewAccountBalance(e.target.value)}
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
                <form id="cashboxForm" onSubmit={(e) => { e.preventDefault(); confirmAction('آیا از ثبت صندوق اطمینان دارید؟', () => handleSubmitCashbox(e as any)) }} className="flex flex-col gap-5">
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
                      <CurrencyInput
                        value={newCashboxBalance}
                        onChange={(e: any) => setNewCashboxBalance(e.target.value)}
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

        {/* Invoice Saved Viewer / Print Sheet Modals */}
        {viewingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/55 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-4xl max-h-[95vh] flex flex-col print-fill"
            >
              {/* Header (No print) */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 no-print">
                <h3 className="text-lg font-black text-indigo-700 flex items-center gap-2">
                  <Printer className="w-5 h-5" />
                  برگه رسمی فاکتور سیستم
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTimeout(() => window.print(), 100);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    چاپ / ذخیره PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingInvoice(null)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors border border-gray-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Area */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-gray-800 text-sm print-fill">
                {/* Print Layout */}
                <div className="border-2 border-gray-300 p-6 rounded-2xl bg-white shadow-xs space-y-6 print-fill">
                  
                  {/* Visual Header */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-gray-100 items-center">
                    {/* Store Title */}
                    <div className="text-right space-y-1">
                      <h2 className="text-xl font-black text-gray-900">{storeSettings.storeName || 'مجموعه تجاری فاکتور پیشرفته'}</h2>
                      <p className="text-xs text-gray-500 font-bold">تلفن پیگیری: {storeSettings.phone || 'ثبت نشده'}</p>
                      <p className="text-[11px] text-gray-400 font-medium">آدرس: {storeSettings.address || 'ثبت نشده'}</p>
                    </div>

                    {/* Invoice Badge Category */}
                    <div className="text-center">
                      <span className="text-lg font-black tracking-tight border-2 border-gray-800 px-6 py-2 rounded-xl text-gray-900 bg-gray-50 inline-block">
                        {viewingInvoice.type === 'purchase' ? 'فاکتور رسمی خرید کالا و خدمات' : 'فاکتور رسمی فروش کالا و خدمات'}
                      </span>
                    </div>

                    {/* Document Meta */}
                    <div className="text-left space-y-1 font-sans text-xs text-gray-600 font-bold" dir="rtl">
                      <div>شماره فاکتور: <span className="font-mono text-gray-900">{viewingInvoice.invoiceNumber}</span></div>
                      <div>تاریخ صدور شمسی: <span className="text-gray-900">{viewingInvoice.jalaliDate || (viewingInvoice.date && new Date(viewingInvoice.date).toLocaleDateString('fa-IR'))}</span></div>
                      <div>تاریخ میلادی: <span className="text-gray-900 font-mono">{viewingInvoice.date ? new Date(viewingInvoice.date).toISOString().split('T')[0] : ''}</span></div>
                      <div>واحد ارز: <span className="text-indigo-600">{showInvoiceCurrency(viewingInvoice.currency || 'تومان')}</span></div>
                    </div>
                  </div>

                  {/* Customer / Party details */}
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-155 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-right">
                      <span className="text-xs text-gray-400 font-bold block">مشخصات طرف حساب (خریدار / فروشنده)</span>
                      <h3 className="text-sm font-extrabold text-gray-900">{viewingInvoice.customerName}</h3>
                      {viewingInvoice.customerPhone && <p className="text-xs text-gray-600 font-bold">تلفن تماس: {viewingInvoice.customerPhone}</p>}
                    </div>
                    <div className="space-y-1 text-left font-sans text-xs text-gray-500 self-center">
                      {/* Customer extra fields from persons state if needed */}
                      {(() => {
                        const originalPerson = persons.find(p => p.name === viewingInvoice.customerName || p.id === viewingInvoice.customerId);
                        if (originalPerson) {
                          return (
                            <div className="text-right space-y-0.5">
                              {originalPerson.nationalId && <p className="font-bold">شناسه مکتوب/ملی: <span className="font-mono text-gray-850">{originalPerson.nationalId}</span></p>}
                              {originalPerson.address && <p className="font-bold">آدرس محل سکونت/دفتر: <span className="text-gray-850">{originalPerson.address}</span></p>}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* Table of Items */}
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-right border-collapse whitespace-nowrap min-w-[650px] text-xs font-sans font-bold">
                      <thead>
                        <tr className="bg-slate-100 border-b border-gray-200 text-slate-700">
                          <th className="p-3 text-center w-12">ردیف</th>
                          <th className="p-3 text-right">شرح کالا یا خدمات</th>
                          <th className="p-3 text-center w-20">تعداد</th>
                          <th className="p-3 text-left w-32">مبلغ واحد ({showInvoiceCurrency(viewingInvoice.currency)})</th>
                          <th className="p-3 text-center w-20">تخفیف (٪)</th>
                          <th className="p-3 text-left w-36">جمع کل خالص ({showInvoiceCurrency(viewingInvoice.currency)})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {viewingInvoice.items?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/20">
                            <td className="p-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                            <td className="p-3 text-right text-gray-900 font-extrabold">{item.productName || 'توضیحات پیش‌فرض'}</td>
                            <td className="p-3 text-center text-gray-800 font-mono">{formatNumber(item.quantity)}</td>
                            <td className="p-3 text-left text-gray-800 font-mono">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 text-center text-red-500 font-mono">{item.discountPercent || 0}٪</td>
                            <td className="p-3 text-left text-indigo-600 font-extrabold font-mono">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pricing summaries + Letters */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 pt-4 border-t border-gray-150">
                    {/* Words total */}
                    <div className="w-full md:w-1/2 space-y-2">
                      <div className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-xl">
                        <span className="text-indigo-900 font-extrabold text-[11px] block">مبلغ قابل پرداخت فاکتور به حروف:</span>
                        <p className="text-gray-800 text-xs font-semibold mt-1 leading-relaxed">
                          {numToPersianWords(viewingInvoice.totalAmount)} {showInvoiceCurrency(viewingInvoice.currency)} تمام.
                        </p>
                      </div>
                    </div>

                    {/* Numerical summary */}
                    <div className="w-full md:w-1/2 space-y-2 text-xs font-bold text-gray-500">
                      <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-lg">
                        <span>جمع کل خالص فاکتور:</span>
                        <span className="text-gray-900 font-mono">{formatCurrency(
                          viewingInvoice.items?.reduce((sum: number, it: any) => sum + (it.totalPrice || 0), 0) || 0
                        )} {showInvoiceCurrency(viewingInvoice.currency)}</span>
                      </div>
                      {viewingInvoice.overallDiscountPercent > 0 && (
                        <div className="flex justify-between items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg">
                          <span>تخفیف روی جمع کل ({viewingInvoice.overallDiscountPercent}٪):</span>
                          <span className="font-mono">{formatCurrency(
                            (viewingInvoice.items?.reduce((sum: number, it: any) => sum + (it.totalPrice || 0), 0) || 0) * (viewingInvoice.overallDiscountPercent / 100)
                          )} {showInvoiceCurrency(viewingInvoice.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center px-4 py-3 bg-indigo-50 text-indigo-950 rounded-xl text-sm font-black border border-indigo-100">
                        <span>مبلغ نهایی قابل پرداخت:</span>
                        <span className="text-indigo-700 font-mono text-base">{formatCurrency(viewingInvoice.totalAmount)} {showInvoiceCurrency(viewingInvoice.currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Standard Signature Block */}
                  <div className="grid grid-cols-2 gap-4 pt-12 text-center text-xs font-bold text-gray-400">
                    <div className="border border-dashed border-gray-200 p-8 rounded-xl h-32 flex flex-col justify-between">
                      <span>مهر و امضای خریدار (تحویل گیرنده)</span>
                      <span className="text-[10px] text-gray-300">تاریخ و محل امضاء</span>
                    </div>
                    <div className="border border-dashed border-gray-200 p-8 rounded-xl h-32 flex flex-col justify-between">
                      <span>مهر و امضای صادرکننده (فروشنده)</span>
                      <span className="text-[10px] text-gray-300">فروشگاه مکتوب الکترونیک</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Sticky bottom (No print) */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 no-print">
                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  بستن پیش‌نمایش
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Invoice PRE-REGISTER Preview overlay */}
        {previewInvoiceData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-4xl max-h-[95vh] flex flex-col"
            >
              {/* Header (No print) */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 no-print">
                <div className="text-right">
                  <h3 className="text-base font-black text-amber-600 flex items-center gap-2">
                    <Eye className="w-5 h-5 animate-pulse" />
                    پیش‌نمایش فاکتور قبل از ثبت قطعی
                  </h3>
                  <p className="text-[10px] text-gray-400 font-extrabold mt-0.5">لطفاً اقلام و مبالغ را بررسی کنید. برای چاپ مستقیم می‌توانید گزینه پرینت را بزنید.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewInvoiceData(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors border border-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-gray-800 text-sm">
                
                {/* Visual A4 structure inside dialog */}
                <div className="border-2 border-indigo-400/50 p-6 rounded-2xl bg-white shadow-xs space-y-6 relative border-dashed">
                  
                  {/* Top draft watermark */}
                  <span className="absolute left-6 top-6 no-print text-[10px] bg-amber-100 text-amber-850 font-black px-2.5 py-1 rounded-sm tracking-widest leading-none border border-amber-200">پیش‌نویس غیررسمی</span>

                  {/* Header info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-gray-100 items-center">
                    <div className="text-right space-y-1">
                      <h2 className="text-lg font-black text-gray-900">{storeSettings.storeName || 'مجموعه تجاری پیش‌فرض'}</h2>
                      <p className="text-xs text-gray-500 font-bold">تلفن: {storeSettings.phone || 'ثبت نشده'}</p>
                      <p className="text-[10px] text-gray-400 leading-none">آدرس: {storeSettings.address || 'ثبت نشده'}</p>
                    </div>

                    <div className="text-center">
                      <span className="text-base font-black tracking-tight border-2 border-amber-500 px-6 py-2 rounded-xl text-amber-900 bg-amber-50/50 inline-block">
                        {previewInvoiceData.type === 'purchase' ? 'پیش‌نمایش فاکتور خرید' : 'پیش‌نمایش فاکتور فروش'}
                      </span>
                    </div>

                    <div className="text-left space-y-1 font-sans text-xs text-gray-600 font-medium" dir="rtl">
                      <div>شماره موقت: <span className="font-mono text-amber-600 font-bold">{previewInvoiceData.invoiceNumber}</span></div>
                      <div>تاریخ شمسی: <span className="text-gray-800 font-bold">{previewInvoiceData.jalaliDate}</span></div>
                      <div>ارز معاملاتی: <span className="text-indigo-600 font-bold">{showInvoiceCurrency(previewInvoiceData.currency)}</span></div>
                    </div>
                  </div>

                  {/* Contact client details */}
                  <div className="bg-amber-50/15 p-4 rounded-xl border border-amber-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-right">
                      <span className="text-xs text-amber-700 font-bold block">مخاطب فاکتور</span>
                      <h3 className="text-sm font-extrabold text-gray-950">{previewInvoiceData.customerName}</h3>
                      {previewInvoiceData.customerPhone && <p className="text-xs text-gray-500 font-bold">تلفن: {previewInvoiceData.customerPhone}</p>}
                    </div>
                    <div className="space-y-1 text-left font-sans text-xs text-gray-500 self-center">
                      {previewInvoiceData.customerAddress && <p className="font-bold text-right text-gray-600 font-sans">نشانی طرف حساب: <span className="text-gray-950">{previewInvoiceData.customerAddress}</span></p>}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-right border-collapse whitespace-nowrap text-xs font-sans font-bold">
                      <thead>
                        <tr className="bg-amber-50/40 border-b border-gray-200 text-amber-950 font-sans">
                          <th className="p-3 text-center w-12">ردیف</th>
                          <th className="p-3 text-right">عنوان کالا یا خدمات</th>
                          <th className="p-3 text-center w-20">تعداد</th>
                          <th className="p-3 text-left w-32">مبلغ واحد ({showInvoiceCurrency(previewInvoiceData.currency)})</th>
                          <th className="p-3 text-center w-20">تخفیف روی سطر</th>
                          <th className="p-3 text-left w-36">جمع کل خالص ({showInvoiceCurrency(previewInvoiceData.currency)})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewInvoiceData.items?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/25">
                            <td className="p-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                            <td className="p-3 text-right text-gray-900 font-extrabold">{item.productName}</td>
                            <td className="p-3 text-center text-gray-800 font-mono">{formatNumber(item.quantity || 1)}</td>
                            <td className="p-3 text-left text-gray-800 font-mono">{formatCurrency(item.unitPrice || 0)}</td>
                            <td className="p-3 text-center text-red-500 font-mono">{item.discountPercent || 0}٪</td>
                            <td className="p-3 text-left text-indigo-600 font-extrabold font-mono">{formatCurrency(item.totalPrice || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Subtotals & Arabic word count */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 pt-4 border-t border-gray-150">
                    <div className="w-full md:w-1/2">
                      <div className="p-3.5 bg-amber-50/20 border border-amber-200/50 rounded-xl">
                        <span className="text-amber-855 font-extrabold text-[11px] block">مبلغ به حروف:</span>
                        <p className="text-gray-800 text-xs font-semibold mt-1 leading-relaxed">
                          {numToPersianWords(previewInvoiceData.totalAmount)} {showInvoiceCurrency(previewInvoiceData.currency)} تمام.
                        </p>
                      </div>
                    </div>

                    {/* Numeric summaries */}
                    <div className="w-full md:w-1/2 space-y-1.5 text-xs font-bold text-gray-500">
                      <div className="flex justify-between items-center px-4 py-1.5 bg-slate-50 rounded-lg">
                        <span>جمع خطوط فاکتور:</span>
                        <span className="text-gray-900 font-mono">{formatCurrency(
                          previewInvoiceData.items?.reduce((sum: number, it: any) => sum + (it.totalPrice || 0), 0) || 0
                        )} {showInvoiceCurrency(previewInvoiceData.currency)}</span>
                      </div>
                      {previewInvoiceData.overallDiscountPercent > 0 && (
                        <div className="flex justify-between items-center px-4 py-1.5 bg-slate-50 text-red-600 rounded-lg">
                          <span>تخفیف روی فاکتور ({previewInvoiceData.overallDiscountPercent}٪):</span>
                          <span className="font-mono">{formatCurrency(
                            (previewInvoiceData.items?.reduce((sum: number, it: any) => sum + (it.totalPrice || 0), 0) || 0) * (previewInvoiceData.overallDiscountPercent / 100)
                          )} {showInvoiceCurrency(previewInvoiceData.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center px-4 py-3 bg-amber-50 text-slate-900 rounded-xl text-sm font-black border border-amber-100">
                        <span>مبلغ موقت قابل تایید:</span>
                        <span className="text-amber-800 font-mono text-base">{formatCurrency(previewInvoiceData.totalAmount)} {showInvoiceCurrency(previewInvoiceData.currency)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom save triggers */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 no-print">
                <button
                  type="button"
                  onClick={() => setPreviewInvoiceData(null)}
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  بازگشت و ویرایش فاکتور
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimeout(() => window.print(), 100);
                  }}
                  className="px-5 py-2.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  چاپ مستقیم پیش‌نویس
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={async () => {
                    const success = await saveInvoiceData(previewInvoiceData);
                    if (success) {
                      setPreviewInvoiceData(null);
                    }
                  }}
                  className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-70"
                >
                  {submitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <CheckCircle className="w-4.5 h-4.5" />
                      تایید نهایی و ثبت سند فاکتور
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
                  </div>
        </main>
        {/* System Version Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 mt-auto shrink-0 no-print">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-indigo-900 border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Version</span>
            <span className="text-xs font-black font-mono">v1.0.0</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400">
            <Receipt className="w-4 h-4 opacity-70" />
            <span className="text-xs font-bold text-gray-500 tracking-tight">سیستم جامع مالی و حسابداری یکپارچه</span>
          </div>

          <div className="text-[10px] text-gray-400 font-medium">
            تمامی حقوق محفوظ است &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
      </div>
    </div>
    {printingTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm print:bg-white print:p-0 print:absolute print:z-auto print:block" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-lg flex flex-col print:shadow-none print:border-none print:w-full print:max-w-none"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 print:hidden">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-500" />
                  پیش‌نمایش چاپ رسید
                </h3>
                <button
                  onClick={() => setPrintingTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div id="print-area" className="p-8 print:p-0 bg-white">
                <div className="text-center mb-6">
                  {storeSettings?.logoUrl ? (
                    <img src={storeSettings.logoUrl} alt="Logo" className="w-16 h-16 mx-auto object-cover rounded-xl mb-3" />
                  ) : (
                    <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                      <Store className="w-8 h-8 text-indigo-500" />
                    </div>
                  )}
                  <h2 className="text-xl font-black text-gray-900 mb-1">{storeSettings?.storeName || 'فروشگاه من'}</h2>
                  <p className="text-xs text-gray-500 font-medium">رسید {printingTransaction.type === 'receive' ? 'دریافت وجه' : printingTransaction.type === 'salary' ? 'حقوق و دستمزد' : 'پرداخت وجه'}</p>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-5 mb-6">
                  <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-100">
                    <div className="text-right">
                      <span className="block text-[10px] text-gray-400 font-bold mb-1">شماره سند</span>
                      <span className="font-mono text-sm font-bold shadow-sm px-2 py-1 bg-gray-50 rounded border border-gray-100">#{printingTransaction.id}</span>
                    </div>
                    <div className="text-left">
                      <span className="block text-[10px] text-gray-400 font-bold mb-1">تاریخ</span>
                      <span className="text-sm font-bold text-gray-700">{printingTransaction.jalaliDate || printingTransaction.date?.split('T')[0]}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">طرف حساب / ذینفع:</span>
                      <span className="font-bold text-gray-900">
                        {persons.find(p => p.id === printingTransaction.personId || p.id.toString() === printingTransaction.personId?.toString())?.name || 'نامشخص'}
                      </span>
                    </div>
                    {printingTransaction.type !== 'salary' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">حساب عملیاتی:</span>
                        <span className="font-bold text-gray-900">
                          {printingTransaction.resourceType === 'bank' 
                            ? ('بانک ' + (accounts.find(a => a.id === printingTransaction.resourceId || a.id.toString() === printingTransaction.resourceId?.toString())?.bankName || '')) 
                            : printingTransaction.resourceType === 'cashbox' 
                              ? ('صندوق ' + (cashboxes.find(c => c.id === printingTransaction.resourceId || c.id.toString() === printingTransaction.resourceId?.toString())?.name || ''))
                              : 'نامشخص'}
                        </span>
                      </div>
                    )}
                    {printingTransaction.description && (
                      <div className="flex flex-col mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500 mb-2 font-bold">بابت / توضیحات:</span>
                        <span className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 text-right">{printingTransaction.description}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-5 flex flex-col items-center justify-center border border-gray-100 shadow-inner">
                  <span className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-widest bg-gray-200/50 px-3 py-1 rounded-full text-[10px]">مبلغ تراکنش</span>
                  <div className="flex items-end gap-2 text-indigo-900">
                    <span className="text-3xl font-black">{typeof formatNumber === 'function' ? formatNumber(printingTransaction.amount) : printingTransaction.amount}</span>
                    <span className="text-sm font-bold opacity-75 mb-1.5">{storeSettings?.currency || 'تومان'}</span>
                  </div>
                </div>
                
                <div className="mt-12 flex justify-between px-6">
                  <div className="text-center">
                    <span className="block text-xs font-bold text-gray-400 mb-8">مُهر و امضای فروشگاه</span>
                    <span className="block w-24 border-t border-gray-300 mx-auto"></span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-gray-400 mb-8">امضای تحویل دهنده / گیرنده</span>
                    <span className="block w-24 border-t border-gray-300 mx-auto"></span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto print:hidden">
                <button
                  onClick={() => setPrintingTransaction(null)}
                  className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors shadow-sm"
                >
                  بستن
                </button>
                <button
                  onClick={() => {
                    setTimeout(() => window.print(), 100);
                  }}
                  className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  شروع چاپ
                </button>
              </div>
            </motion.div>
          </div>
        )}
    </>
  );
}

const numToPersianWords = (num: number): string => {
  if (num === 0) return 'صفر';
  const yekan = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const dahgan = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const dahYek = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const sadgan = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const steps = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

  const convertThreeDigit = (n: number): string => {
    if (n === 0) return '';
    let result = '';
    const s = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const y = n % 10;

    if (s > 0) result += sadgan[s];
    if (d > 0) {
      if (result) result += ' و ';
      if (d === 1) {
        result += dahYek[y];
        return result;
      } else {
        result += dahgan[d];
      }
    }
    if (y > 0) {
      if (result) result += ' و ';
      result += yekan[y];
    }
    return result;
  };

  let word = '';
  let stepCount = 0;
  let temp = Math.floor(num);

  while (temp > 0) {
    const section = temp % 1000;
    if (section > 0) {
      const sectionWord = convertThreeDigit(section);
      const stepWord = steps[stepCount] ? ' ' + steps[stepCount] : '';
      word = sectionWord + stepWord + (word ? ' و ' + word : '');
    }
    temp = Math.floor(temp / 1000);
    stepCount++;
  }
  return word.trim();
};

