import React, { useState, useEffect, useMemo } from 'react';
import Barcode from 'react-barcode';
import { ScanLine, Shield, Key, Maximize, Minimize, Tag, Plus, Trash2, Edit2, Image,  Save, FileText, User, ShoppingCart, Calculator, CheckCircle, AlertCircle, AlertTriangle, Info, FilePlus, Calendar, List, Receipt, Search, DollarSign, Package, X, RefreshCw, Menu, Github, CreditCard, Wallet, Store, Settings, TrendingUp, TrendingDown, BarChart3, ChevronDown, ChevronUp, Printer, Eye, ListTodo, CheckSquare, LogOut, LogIn, Database, ArrowDownToLine, ArrowUpFromLine, FileSpreadsheet, Users, BookOpen, ClipboardList, Activity, Clock, History, ArrowRightLeft, Percent, LayoutList, GripHorizontal, Box , CornerDownLeft, CornerUpRight, Banknote, PackagePlus, Copy, LayoutDashboard, Phone, MapPin, PlusCircle, MinusCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Line, ComposedChart, Cell } from 'recharts';
import { addCommas, removeCommas, numberToWords, getBaseValueInToman, getDefaultExchangeRate, showInvoiceCurrency, numToPersianWords } from './utils/format';
import DatePickerModule from "react-multi-date-picker";
const DatePicker = (DatePickerModule as any).default || DatePickerModule;
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Select from "react-select";
import { useAuth } from './context/AuthContext';
import { generateId, getUsers, addUser, updateUser, deleteUser, getCheckbooks, addCheckbook, updateCheckbook, deleteCheckbook, getIssuedChecks, addIssuedCheck, updateIssuedCheck, deleteIssuedCheck, getReceivedChecks, addReceivedCheck, updateReceivedCheck, deleteReceivedCheck, getStoreSettings, saveStoreSettings, getPersonGroups, addPersonGroup, updatePersonGroup, deletePersonGroup, getPersonRoles, addPersonRole, updatePersonRole, deletePersonRole, getPersons, addPerson, updatePerson, deletePerson, getProducts, addProduct, updateProduct, deleteProduct, getProductCategories, addProductCategory, updateProductCategory, deleteProductCategory, getAccounts, addAccount, updateAccount, deleteAccount, getCashboxes, addCashbox, updateCashbox, deleteCashbox, getWarehouses, addWarehouse, updateWarehouse, deleteWarehouse, getInvoices, addInvoice, updateInvoice, deleteInvoice, getTransactions, addTransaction, updateTransaction, deleteTransaction, getWarehouseStocks, recalculateAllWarehouseStocks, getFinancialYears, getActiveFinancialYear, addFinancialYear, closeFinancialYear } from './services/dataService';
import ModuleSelector from './components/ui/ModuleSelector';
import DatabaseDashboard from './components/admin/DatabaseDashboard';
import SystemChecklist from './components/admin/SystemChecklist';
import SystemLogs from './components/admin/SystemLogs';

import ProductCardModal from './components/modals/ProductCardModal';
import QuickPriceInquiry from './components/inventory/QuickPriceInquiry';
import CheckManagement from './components/financial/CheckManagement';
import InvoiceAllocation from './components/financial/InvoiceAllocation';

import SearchableSelect from './components/ui/SearchableSelect';
import BarcodeScannerModal from './components/modals/BarcodeScannerModal';
import EditReceiptModal from './components/modals/EditReceiptModal';
import FinancialTransfer from './components/financial/FinancialTransfer';
import QuickRefund from './components/financial/QuickRefund';
import UserManager from './components/admin/UserManager';
import InventoryReport from './components/reports/InventoryReport';
import StocktakingManager from './components/inventory/StocktakingManager';
import AnalyticalDashboard from './components/reports/AnalyticalDashboard';
import DebtsCreditsReport from './components/reports/DebtsCreditsReport';
import LoansManager from './components/loans/LoansManager';
import ChartOfAccounts from './components/accounting/ChartOfAccounts';
import AccountingDocsList from './components/accounting/AccountingDocsList';
import AccountingDocCreate from './components/accounting/AccountingDocCreate';
import AccountingDocView from './components/accounting/AccountingDocView';
import AccountingAutoSync from './components/accounting/AccountingAutoSync';
import AccountingVerification from './components/accounting/AccountingVerification';
import FinancialYearManager from './components/accounting/FinancialYearManager';
import { Person, PersonGroup, Product, Account, Cashbox, Warehouse, InvoiceItem, WarehouseStock } from './types';
import appVersion from './version.json';



const customPersonFilter = (option: any, inputValue: string) => {
  if (!inputValue) return true;
  const terms = inputValue.toLowerCase().split(' ').filter(Boolean);
  const searchable = (option.data.searchStr || option.label || '').toLowerCase();
  return terms.every(term => searchable.includes(term));
};



const CurrencyInput = ({ value, onChange, placeholder, className, hideWords, currencyLabel, ...props }: any) => {
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
      {!hideWords && localVal && localVal !== '0' && (
        <p className="text-[10px] text-gray-500 font-medium mt-1 px-1 absolute -bottom-5 right-0 z-10 w-max">{numberToWords(localVal)} {currencyLabel || 'تومان'}</p>
      )}
    </div>
  );
};

const FastBarcodeScanner = ({ onScan }: { onScan: (code: string) => void }) => {
  return (
    <div className="relative flex-1 md:max-w-[280px] min-w-[200px]">
      <ScanLine className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="ورود بارکد / کد کالا (Enter)"
        className="w-full pr-10 pl-3 p-[11px] bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-left outline-none text-sm shadow-sm transition-colors"
        dir="ltr"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val) {
              onScan(val);
              e.currentTarget.value = '';
            }
          }
        }}
      />
    </div>
  );
};

export default function App() {
  const [activeFinancialYear, setActiveFinancialYearState] = useState<any>(null);
  const [hasCheckedFinancialYears, setHasCheckedFinancialYears] = useState(false);

  const fetchFinancialYearInfo = async () => {
    try {
      const years = await getFinancialYears();
      const active = years.find((y: any) => y.status === 'open') || null;
      setActiveFinancialYearState(active);
      setHasCheckedFinancialYears(true);
    } catch (e) {
      console.error('fetchFinancialYearInfo error', e);
    }
  };

  const [historyProductId, setHistoryProductId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({isOpen: false, message: '', onConfirm: () => {}});
  const confirmAction = (message: string, onConfirm: () => void) => {
    setConfirmState({isOpen: true, message, onConfirm});
  };
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab ] = useState<'create_sale' | 'debts_credits' | 'create_purchase' | 'list_sale' | 'list_purchase' | 'create_receive_receipt' | 'list_receive_receipt' | 'create_pay_receipt' | 'list_pay_receipt' | 'create_salary_payroll' | 'list_salary_payroll' | 'create_warehouse_doc' | 'list_warehouse_docs' | 'products' | 'product_view' | 'product_categories' | 'persons' | 'person_groups' | 'person_roles' | 'accounts' | 'cashboxes' | 'warehouses' | 'update' | 'settings' | 'financial_report' | 'analytical_dashboard' | 'person_ledger' | 'inventory_report' | 'checklist' | 'database' | 'users_manager' | 'checkbooks' | 'issued_checks' | 'received_checks' | 'check_calendar' | 'check_charts' | 'transfer' | 'invoice_allocation' | 'quick_refund' | 'quick_price_inquiry' | 'create_sale_return' | 'create_purchase_return' | 'list_sale_return' | 'list_purchase_return' | 'loans' | 'system_logs' | 'stocktaking' | 'financial_years' | 'chart_of_accounts' | 'accounting_docs_list' | 'accounting_doc_create' | 'accounting_doc_view' | 'accounting_auto_sync' | 'accounting_verification'>('financial_report');
  const [systemModule, setSystemModule] = useState<'selector' | 'all' | 'commerce' | 'inventory' | 'accounting' | 'admin'>(() => {
    try { const saved = localStorage.getItem('app_systemModule'); return saved ? JSON.parse(saved) : 'selector'; } catch { return 'selector'; }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState<boolean>(() => {
    try { const saved = localStorage.getItem('app_isFullWidth'); return saved ? JSON.parse(saved) : false; } catch { return false; }
  });
  const [menuLayout, setMenuLayout] = useState<'vertical' | 'horizontal'>(() => {
    try { const saved = localStorage.getItem('app_menuLayout'); return saved ? JSON.parse(saved) : 'vertical'; } catch { return 'vertical'; }
  });
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>(() => {
    try { const saved = localStorage.getItem('app_expandedGroups'); return saved ? JSON.parse(saved) : {
      sales_operations: true,
      purchase_operations: false,
      receipts_payments: false,
      checks_management: false,
      loans_management: false,
      base_info: false,
      reports: true,
      settings: false
    }; } catch {
      return {
        sales_operations: true,
        purchase_operations: false,
        receipts_payments: false,
        checks_management: false,
        loans_management: false,
        base_info: false,
        reports: true,
        settings: false
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('app_systemModule', JSON.stringify(systemModule));
  }, [systemModule]);

  useEffect(() => {
    localStorage.setItem('app_isFullWidth', JSON.stringify(isFullWidth));
  }, [isFullWidth]);

  useEffect(() => {
    localStorage.setItem('app_menuLayout', JSON.stringify(menuLayout));
  }, [menuLayout]);

  useEffect(() => {
    localStorage.setItem('app_expandedGroups', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const allSidebarGroups = [
    {
      id: 'reports',
      label: 'داشبورد و گزارشات',
      icon: <BarChart3 className="w-5 h-5" />,
      items: [
        { id: 'financial_report', label: 'داشبورد مالی', roles: ['admin', 'accountant'] },
        { id: 'analytical_dashboard', label: 'داشبورد تحلیلی', roles: ['admin', 'accountant', 'viewer'] },
        { id: 'person_ledger', label: 'دفتر کل اشخاص', roles: ['admin', 'accountant', 'viewer'] },
        { id: 'debts_credits', label: 'بدهکاران و بستانکاران', roles: ['admin', 'accountant', 'viewer'] },
        { id: 'inventory_report', label: 'کاردکس و موجودی کالا', roles: ['admin', 'accountant', 'viewer'] },
        { id: 'stocktaking', label: 'انبارگردانی', roles: ['admin', 'manager'] },
      ]
    },
    {
      id: 'sales_operations',
      label: 'عملیات فروش',
      icon: <ShoppingCart className="w-5 h-5" />,
      items: [
        { id: 'create_sale', label: 'ثبت فاکتور فروش', roles: ['admin', 'cashier', 'accountant'] },
        { id: 'create_sale_return', label: 'برگشت از فروش', roles: ['admin', 'cashier', 'accountant'] },
        { id: 'list_sale', label: 'لیست فاکتورهای فروش', roles: ['admin', 'cashier', 'accountant'] },
        { id: 'list_sale_return', label: 'لیست برگشتی‌های فروش', roles: ['admin', 'cashier', 'accountant'] },
      ]
    },
    {
      id: 'purchase_operations',
      label: 'عملیات خرید',
      icon: <PackagePlus className="w-5 h-5" />,
      items: [
        { id: 'create_purchase', label: 'ثبت فاکتور خرید', roles: ['admin', 'accountant'] },
        { id: 'create_purchase_return', label: 'برگشت از خرید', roles: ['admin', 'accountant'] },
        { id: 'list_purchase', label: 'لیست فاکتورهای خرید', roles: ['admin', 'accountant'] },
        { id: 'list_purchase_return', label: 'لیست برگشتی‌های خرید', roles: ['admin', 'accountant'] },
      ]
    },
    {
      id: 'products_management',
      label: 'کالا و خدمات',
      icon: <Package className="w-5 h-5" />,
      items: [
        { id: 'products', label: 'مدیریت کالا و خدمات', roles: ['admin', 'accountant'] },
        { id: 'quick_price_inquiry', label: 'استعلام سریع قیمت', roles: ['admin', 'accountant', 'cashier', 'viewer'] },
        { id: 'product_view', label: 'کارت کالا', roles: ['admin', 'accountant'] },
        { id: 'product_categories', label: 'گروه‌بندی کالاها', roles: ['admin', 'accountant'] },
      ]
    },
    {
      id: 'warehousing',
      label: 'انبارداری',
      icon: <Box className="w-5 h-5" />,
      items: [
        { id: 'warehouses', label: 'انبارها', roles: ['admin', 'accountant'] },
        { id: 'create_warehouse_doc', label: 'صدور رسید پایانه انبار', roles: ['admin', 'accountant'] },
        { id: 'list_warehouse_docs', label: 'لیست اسناد انبار', roles: ['admin', 'accountant'] },
      ]
    },
    {
      id: 'banking',
      label: 'بانکداری',
      icon: <CreditCard className="w-5 h-5" />,
      items: [
        { id: 'accounts', label: 'حساب‌های بانکی', roles: ['admin', 'accountant'] },
        { id: 'cashboxes', label: 'صندوق‌ها', roles: ['admin', 'accountant', 'cashier'] },
        { id: 'transfer', label: 'انتقال بین حساب‌ها', roles: ['admin', 'accountant'] },
        { id: 'checkbooks', label: 'دسته چک‌ها', roles: ['admin', 'accountant'] },
      ]
    },
    {
      id: 'accounting_core',
      label: 'حسابداری دوبل',
      icon: <Calculator className="w-5 h-5" />,
      items: [
        { id: 'financial_years', label: 'مدیریت سال‌های مالی', roles: ['admin', 'accountant'] },
        { id: 'accounting_verification', label: 'تراز آزمایشی و بررسی اسناد', roles: ['admin', 'accountant'] },
        { id: 'chart_of_accounts', label: 'کدینگ حساب‌ها (جدول حساب)', roles: ['admin', 'accountant'] },
        { id: 'accounting_docs_list', label: 'اسناد حسابداری', roles: ['admin', 'accountant'] },
        { id: 'accounting_doc_create', label: 'صدور سند حسابداری', roles: ['admin', 'accountant'] },
        { id: 'accounting_auto_sync', label: 'تولید اسناد معوقه', roles: ['admin', 'accountant'] },
      ]
    },
    {
      id: 'receipts_payments',
      label: 'دریافت و پرداخت',
      icon: <ArrowRightLeft className="w-5 h-5" />,
      items: [
        { id: 'create_receive_receipt', label: 'ثبت رسید دریافت', roles: ['admin', 'accountant', 'cashier'] },
        { id: 'list_receive_receipt', label: 'لیست رسید دریافت', roles: ['admin', 'accountant'] },
        { id: 'create_pay_receipt', label: 'ثبت رسید پرداخت', roles: ['admin', 'accountant'] },
        { id: 'list_pay_receipt', label: 'لیست رسید پرداخت', roles: ['admin', 'accountant'] },
        { id: 'quick_refund', label: 'استرداد سریع متفرقه', roles: ['admin', 'accountant', 'cashier'] },
        { id: 'invoice_allocation', label: 'تخصیص اسناد به فاکتور', roles: ['admin', 'accountant'] },
      ]
    },
    {
      id: 'checks_management',
      label: 'چک و اسناد',
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        { id: 'received_checks', label: 'چک‌های دریافتی', roles: ['admin', 'accountant'] },
        { id: 'issued_checks', label: 'چک‌های پرداختی', roles: ['admin', 'accountant'] },
        { id: 'check_calendar', label: 'تقویم چک‌ها', roles: ['admin', 'accountant', 'manager'] },
        { id: 'check_charts', label: 'داشبورد و وضعیت چک‌ها', roles: ['admin', 'accountant', 'manager'] },
      ]
    },
    {
      id: 'loans_management',
      label: 'وام و تسهیلات',
      icon: <Percent className="w-5 h-5" />,
      items: [
        { id: 'loans', label: 'مدیریت وام و اقساط', roles: ['admin', 'accountant'] },
      ]
    },
    {
      id: 'salary',
      label: 'حقوق و دستمزد',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      items: [
        { id: 'create_salary_payroll', label: 'ثبت فیش حقوقی', roles: ['admin', 'accountant'] },
        { id: 'list_salary_payroll', label: 'لیست فیش‌های حقوقی', roles: ['admin', 'accountant'] },
      ]
    },
    {
      id: 'persons',
      label: 'اشخاص',
      icon: <Users className="w-5 h-5" />,
      items: [
        { id: 'persons', label: 'اشخاص و شرکت‌ها', roles: ['admin', 'accountant'] },
        { id: 'person_groups', label: 'گروه‌بندی اشخاص', roles: ['admin', 'accountant'] },
        { id: 'person_roles', label: 'نقش‌های ارتباطی (کدینگ)', roles: ['admin'] },
      ]
    },
    {
      id: 'settings',
      label: 'تنظیمات و نگهداری',
      icon: <Settings className="w-5 h-5" />,
      items: [
        { id: 'users_manager', label: 'کاربران سیستم', roles: ['admin'] },
        { id: 'settings', label: 'تنظیمات پایه‌ای', roles: ['admin'] },
        { id: 'system_logs', label: 'لاگ سیستم', roles: ['admin'] },
        { id: 'database', label: 'پایگاه داده', roles: ['admin'] },
        { id: 'update', label: 'به‌روزرسانی نرم‌افزار', roles: ['admin'] },
        { id: 'checklist', label: 'چک‌لیست راه‌اندازی', roles: ['admin'] },
      ]
    }
  ];

  const sidebarGroups = allSidebarGroups.filter(g => {
    if (systemModule === 'all' || systemModule === 'selector') return true;
    if (systemModule === 'commerce') {
      return ['reports', 'sales_operations', 'purchase_operations', 'persons', 'products_management'].includes(g.id);
    }
    if (systemModule === 'inventory') {
      return ['reports', 'products_management', 'warehousing'].includes(g.id);
    }
    if (systemModule === 'accounting') {
      return ['reports', 'banking', 'accounting_core', 'receipts_payments', 'checks_management', 'loans_management', 'salary', 'persons'].includes(g.id);
    }
    if (systemModule === 'admin') {
      return ['reports', 'settings'].includes(g.id);
    }
    return true;
  }).map(g => {
    if (g.id === 'reports' && systemModule !== 'all' && systemModule !== 'selector') {
      return {
        ...g,
        items: g.items.filter(item => {
          if (systemModule === 'commerce') return ['analytical_dashboard'].includes(item.id);
          if (systemModule === 'inventory') return ['inventory_report', 'stocktaking'].includes(item.id);
          if (systemModule === 'accounting') return ['financial_report', 'analytical_dashboard', 'person_ledger', 'debts_credits'].includes(item.id);
          if (systemModule === 'admin') return true;
          return true;
        })
      };
    }
    return g;
  });

  const filteredSidebarGroups = useMemo(() => {
    if (hasCheckedFinancialYears && !activeFinancialYear) {
      return [
        {
          id: 'financial_years_setup',
          label: 'راه‌اندازی سال مالی',
          icon: <Calendar className="w-5 h-5" />,
          items: [
            { id: 'financial_years', label: 'تعریف و مدیریت سال مالی', roles: ['admin', 'accountant'] },
            { id: 'settings', label: 'تنظیمات پایه‌ای (تعیین تقویم)', roles: ['admin'] }
          ]
        }
      ];
    }
    return sidebarGroups;
  }, [sidebarGroups, hasCheckedFinancialYears, activeFinancialYear]);

  useEffect(() => {
    setLastCreatedReceipt(null);
    if (activeTab === 'create_sale') {
      setInvoiceType('sale');
      setInvoiceTitle('فاکتور فروش کالا');
    } else if (activeTab === 'create_sale_return') {
      setInvoiceType('sale_return');
      setInvoiceTitle('فاکتور برگشت از فروش');
    } else if (activeTab === 'create_purchase_return') {
      setInvoiceType('purchase_return');
      setInvoiceTitle('فاکتور برگشت از خرید');
    } else if (activeTab === 'create_purchase') {
      setInvoiceType('purchase');
      setInvoiceTitle('فاکتور خرید کالا');
    } else if (activeTab === 'create_warehouse_doc') {
      setInvoiceType('warehouse_receipt');
      setInvoiceTitle('اسناد انبار (ورود/خروج)');
      setWarehouseWizardStep(1);
      setWarehouseOperationType('purchase_invoice');
    }
  }, [activeTab]);
  
  const [persons, setPersons] = useState<Person[]>([]);
  const [personGroups, setPersonGroups] = useState<PersonGroup[]>([]);
  const [personRoles, setPersonRoles] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
    const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [loans, setLoans] = useState<import('./types').Loan[]>([]);
  const [installments, setInstallments] = useState<import('./types').Installment[]>([]);
  const [warehouseSubTab, setWarehouseSubTab] = useState<'list' | 'stocks'>('list');
  const [recalculating, setRecalculating] = useState(false);
  const [personSearchTerm, setPersonSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [whStockSearch, setWhStockSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');
  const [selectedPersonGroup, setSelectedPersonGroup] = useState<string>('all');
  const [selectedPersonRole, setSelectedPersonRole] = useState<string>('all');
  const [personCurrentPage, setPersonCurrentPage] = useState<number>(1);
  const [personPageSize, setPersonPageSize] = useState<number>(10);
  const [productCurrentPage, setProductCurrentPage] = useState<number>(1);
  const [productPageSize, setProductPageSize] = useState<number>(10);
  const [newPersonGroupName, setNewPersonGroupName] = useState('');
  const [newPersonGroupColor, setNewPersonGroupColor] = useState('indigo');
  const [editingPersonGroupId, setEditingPersonGroupId] = useState<string | null>(null);

  const [newPersonRoleName, setNewPersonRoleName] = useState('');
  const [newPersonRoleCode, setNewPersonRoleCode] = useState('');
  const [editingPersonRoleId, setEditingPersonRoleId] = useState<string | null>(null);

  const getRoleName = (roleId?: string) => {
    if (!roleId) return 'نامشخص';
    const role = personRoles.find(r => r.id === roleId);
    return role ? role.name : roleId === 'customer' ? 'مشتری' : roleId === 'supplier' ? 'تامین کننده' : roleId === 'employee' ? 'کارمند' : 'نامشخص';
  };

  const getRoleBadgeClasses = (roleId?: string) => {
    const role = personRoles.find(r => r.id === roleId);
    if (role && role.color) return role.color;
    return roleId === 'customer' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : roleId === 'supplier' ? 'bg-orange-50 text-orange-850 border-orange-100' : 'bg-purple-50 text-purple-800 border-purple-100';
  };

  const mapPersonToOption = (p: any) => ({
    value: p.id.toString(),
    label: (p.personCode ? '[' + p.personCode + '] ' : '') + (p.alias || p.name) + ' (' + (getRoleName(p.role)) + ')',
    searchStr: `${p.alias||''} ${p.name||''} ${p.title||''} ${p.firstName||''} ${p.lastName||''} ${p.phone||''} ${p.nationalId||''} ${p.personCode||''} ${p.companyName||''}`
  });

  const filteredPersons = persons.filter(p => {
    // 0. Role Filter
    if (selectedPersonRole !== 'all' && p.role !== selectedPersonRole) {
      return false;
    }

    // 1. Group Filter
    if (selectedPersonGroup !== 'all') {
      if (selectedPersonGroup === 'none') {
        if (p.group && p.group.trim() !== '') return false;
      } else {
        if (p.group !== selectedPersonGroup) return false;
      }
    }

    // 2. Search Filter
    if (!personSearchTerm) return true;
    const terms = personSearchTerm.toLowerCase().split(' ').filter(Boolean);
    const grp = personGroups.find(g => g.id === p.group);
    const searchable = `${p.name || ''} ${p.firstName || ''} ${p.lastName || ''} ${p.phone || ''} ${p.nationalId || ''} ${p.personCode || ''} ${p.accountingCode || ''} ${grp?.name || ''}`.toLowerCase();
    return terms.every(term => searchable.includes(term));
  });

  // Reset page when filters change
  useEffect(() => {
    setPersonCurrentPage(1);
  }, [personSearchTerm, selectedPersonGroup, personPageSize]);

  useEffect(() => {
    setProductCurrentPage(1);
  }, [productSearchTerm, selectedProductCategory, productPageSize]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [checkbooks, setCheckbooks] = useState<any[]>([]);
  const [issuedChecks, setIssuedChecks] = useState<any[]>([]);
  const [receivedChecks, setReceivedChecks] = useState<any[]>([]);

  const [storeSettings, setStoreSettings] = useState<any>({ storeName: 'فروشگاه پیش‌فرض', address: '', phone: '', logoUrl: '', currency: 'تومان', isSetup: false, fontFamily: 'Vazirmatn' });
  const [loading, setLoading] = useState(false);
  const [requiresInitSetup, setRequiresInitSetup] = useState(false);

  // Notification Utility
  const sendNotification = (message, personPhone, method) => {
    if (!method || method === 'none' || !personPhone) return;
    setTimeout(() => {
      let icon = '💬';
      if (method === 'sms') icon = '📱';
      if (method === 'whatsapp') icon = '🟢';
      if (method === 'gsm') icon = '📡';
      
      const toastId = Math.random().toString(36).substring(7);
      console.log(prev => [...prev, { id: toastId, message: icon + ' پیامک/اطلاع‌رسانی به ' + personPhone + ' ارسال شد.', type: 'info' }]);
    }, 1500);
  };

  // Receipts & Payments Form State
  const [receiptPersonId, setReceiptPersonId] = useState<string | number | ''>('');
  const [receiptPersonSearchText, setReceiptPersonSearchText] = useState('');
  const [isReceiptPersonDropdownOpen, setIsReceiptPersonDropdownOpen] = useState(false);
  const [printingTransaction, setPrintingTransaction] = useState<any>(null);
  const [receiptDate, setReceiptDate] = useState<Date | any>(new Date());
  const [receiptAmount, setReceiptAmount] = useState<string>('');
  const [receiptResourceType, setReceiptResourceType] = useState<'bank' | 'cashbox'>('bank');
  const [receiptMethod, setReceiptMethod] = useState<'cash' | 'check'>('cash');
  const [receiptCheckNumber, setReceiptCheckNumber] = useState('');
  const [receiptCheckDueDate, setReceiptCheckDueDate] = useState<Date | any>(new Date());
  const [receiptCheckBankName, setReceiptCheckBankName] = useState('');
  const [receiptCheckbookId, setReceiptCheckbookId] = useState<string | number | ''>('');
  const [receiptResourceId, setReceiptResourceId] = useState<string | number | ''>('');
  const [receiptDescription, setReceiptDescription] = useState<string>('');
  const [receiptLinkedInvoices, setReceiptLinkedInvoices] = useState<Record<string, number>>({});
  const [submittingReceipt, setSubmittingReceipt] = useState<boolean>(false);
  const receiptSuccessMsg = false;

  // Salary form state
  const [salaryPersonId, setSalaryPersonId] = useState<string | number | ''>('');
  const [salaryDate, setSalaryDate] = useState<any>(new Date());
  const [salaryPeriodMonth, setSalaryPeriodMonth] = useState<string>('1');
  const [salaryPeriodYear, setSalaryPeriodYear] = useState<string>('1403');
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
  const [printingPersonLedger, setPrintingPersonLedger] = useState<any | null>(null);
  const [printingBarcodeProduct, setPrintingBarcodeProduct] = useState<any | null>(null);

  // Person Ledger state
  const [ledgerPersonId, setLedgerPersonId] = useState<string | number | ''>('');
  const [drawerPersonId, setDrawerPersonId] = useState<string | number | ''>('');

  // Invoice Print & Preview State
      // For financial report
      const [reportDateRange, setReportDateRange] = useState<Date[]>([]);
      const [viewingInvoice, setViewingInvoice] = useState<any>(null);
      const [viewingAccountingDoc, setViewingAccountingDoc] = useState<any>(null);
      const [pricingWizardInvoice, setPricingWizardInvoice] = useState<any>(null);
      const [pricingWizardItems, setPricingWizardItems] = useState<any[]>([]);
      const [pricingPrintMode, setPricingPrintMode] = useState<'list' | 'labels'>('list');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceGroupMode, setInvoiceGroupMode] = useState<'none' | 'month' | 'season'>('none');
  
  const [previewInvoiceData, setPreviewInvoiceData] = useState<any>(null);
  const [previewReceiptData, setPreviewReceiptData] = useState<any>(null);
  const [editingReceipt, setEditingReceipt] = useState<any>(null);
  const [isEditReceiptModalOpen, setIsEditReceiptModalOpen] = useState(false);
  const [lastCreatedReceipt, setLastCreatedReceipt] = useState<any>(null);
  const [showProductBarcodesList, setShowProductBarcodesList] = useState(false);

  // Update State
  const [updatingStr, setUpdatingStr] = useState(false);
  const [updateLog, setUpdateLog] = useState('');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStepName, setUpdateStepName] = useState('');
  const [updateStepsStatus, setUpdateStepsStatus] = useState<{[key: string]: 'idle' | 'running' | 'success' | 'error'}>({});
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [latestCommits, setLatestCommits] = useState<any[]>([]);
  const [latestGithubSha, setLatestGithubSha] = useState<string | null>(null);
  const [checkingUpdateVersion, setCheckingUpdateVersion] = useState(false);
  const [hasPromptedUpdate, setHasPromptedUpdate] = useState(false);
  const [didConfirmUpdate, setDidConfirmUpdate] = useState(false);

  useEffect(() => {
    if (!checkingUpdateVersion && !hasPromptedUpdate) {
      const fetchLatestVersion = async () => {
        setCheckingUpdateVersion(true);
        try {
          const timestamp = new Date().getTime();
          const [resVer, resCom] = await Promise.all([
            fetch(`https://api.github.com/repos/bazyarlivecom/Store-accounting-system/releases/latest?t=${timestamp}`, { cache: 'no-store' }),
            fetch(`https://api.github.com/repos/bazyarlivecom/Store-accounting-system/commits?per_page=10&t=${timestamp}`, { cache: 'no-store' })
          ]);
          let fetchedVer = 'Build 2.9.0';

          if (resVer.ok) {
            const data = await resVer.json();
            fetchedVer = data.tag_name || data.name || 'Build 2.9.0';
            setLatestVersion(fetchedVer);
          } else {
            setLatestVersion('Build 2.9.0');
          }
          if (resCom.ok) {
            const commits = await resCom.json();
            if (commits.length > 0) {
               setLatestGithubSha(commits[0].sha);
               let currentLocalSha = localStorage.getItem('localCommitSha');
               if (!currentLocalSha && commits.length > 2) {
                  currentLocalSha = commits[2].sha;
                  localStorage.setItem('localCommitSha', currentLocalSha);
               }
               const newCommits = [];
               for (const c of commits) {
                  if (c.sha === currentLocalSha) break;
                  newCommits.push(c);
               }
               setLatestCommits(newCommits);
            }
          }
        } catch (error) {
          setLatestVersion('Build 2.9.0');
        } finally {
          setCheckingUpdateVersion(false);
          setHasPromptedUpdate(true);
        }
      };
      fetchLatestVersion();
    }
  }, [checkingUpdateVersion, hasPromptedUpdate]);

  useEffect(() => {
     if (latestCommits.length > 0 && hasPromptedUpdate && !didConfirmUpdate) {
       setDidConfirmUpdate(true);
       setTimeout(() => {
         confirmAction('نسخه جدید سیستم (آپدیت جدید) در دسترس است! آیا مایلید سیستم اکنون به طور خودکار بروزرسانی‌ها را نصب نماید؟', () => {
            setActiveTab('update');
            setTimeout(() => {
               const btn = document.getElementById('auto-update-btn');
               if (btn) btn.click();
            }, 500);
         });
       }, 2000);
     }
  }, [latestCommits, hasPromptedUpdate, didConfirmUpdate]);

  // Form State
  const [invoiceType, setInvoiceType] = useState<'sale' | 'purchase' | 'warehouse_receipt' | 'warehouse_remittance' | 'proforma' | 'sale_return' | 'purchase_return'>('sale');
  const [listFilter, setListFilter] = useState<any>('all');
  const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'received' | 'pending'>('all');
  const [invoiceMode, setInvoiceMode] = useState<'auto' | 'manual'>('auto');
  const [invoiceTitle, setInvoiceTitle] = useState('فاکتور فروش کالا');
  const [warehouseWizardStep, setWarehouseWizardStep] = useState(1);
  const [warehouseOperationType, setWarehouseOperationType] = useState('purchase_invoice');
  const [deletePreviousDocs, setDeletePreviousDocs] = useState(false);
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [invoiceWarehouseId, setInvoiceWarehouseId] = useState<string | number | ''>('');
  const [invoiceCurrency, setInvoiceCurrency] = useState<string>('تومان');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [exchangeRateInput, setExchangeRateInput] = useState<string>('1');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [sellerInvoiceNumber, setSellerInvoiceNumber] = useState('');
  const [date, setDate] = useState<Date | any>(new Date());
  const [customerId, setCustomerId] = useState<string | number | ''>('');
  const [sourceInvoiceId, setSourceInvoiceId] = useState<string | number | ''>('');
  

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);
  const [invoicePaymentStatus, setInvoicePaymentStatus] = useState<'paid' | 'unpaid' | 'partial'>('unpaid');
  const [invoicePaidAmount, setInvoicePaidAmount] = useState<number>(0);

  const [hasDraft, setHasDraft] = useState<boolean>(false);

  // Inter-warehouse Auto-transfer Proposal State
  const [transferProposal, setTransferProposal] = useState<{
    show: boolean;
    items: {
      productId: string | number;
      productName: string;
      unit: string;
      required: number;
      availableInTarget: number;
      deficit: number;
      remainingDeficit: number;
      transfers: { fromWarehouseId: string | number; fromWarehouseName: string; toWarehouseId: string | number; toWarehouseName: string; qty: number }[];
    }[];
    payload: any;
  } | null>(null);
  
  // Auto-save effect
  useEffect(() => {
    if ((['create_sale', 'create_purchase', 'create_warehouse_doc', 'create_sale_return', 'create_purchase_return'].includes(activeTab))) {
       const draft = {
         invoiceMode,
         invoiceNumber,
         sellerInvoiceNumber,
         customerId,
         sourceInvoiceId,
         items,
         overallDiscountPercent,
         invoiceCurrency,
         exchangeRate,
         exchangeRateInput,
         invoiceType,
         invoiceTitle,
         invoiceDescription,
         activeTab,
       };
       if (items.length > 0 || customerId) {
         localStorage.setItem('invoice_draft', JSON.stringify(draft));
         setHasDraft(true);
       } else {
         localStorage.removeItem('invoice_draft');
         setHasDraft(false);
       }
    }
  }, [items, customerId, invoiceNumber, sellerInvoiceNumber, sourceInvoiceId, overallDiscountPercent, invoiceCurrency, exchangeRate, invoiceMode, invoiceType, invoiceTitle, invoiceDescription, activeTab]);
  
  useEffect(() => {
    if (localStorage.getItem('invoice_draft')) {
       setHasDraft(true);
    }
  }, []);
  
  const restoreDraft = () => {
    const d = localStorage.getItem('invoice_draft');
    if (d) {
      try {
        const parsed = JSON.parse(d);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        setInvoiceMode(parsed.invoiceMode || 'auto');
        setInvoiceNumber(parsed.invoiceNumber || '');
        setSellerInvoiceNumber(parsed.sellerInvoiceNumber || '');
        setCustomerId(parsed.customerId || '');
        setSourceInvoiceId(parsed.sourceInvoiceId || '');
        setItems(parsed.items || []);
        setOverallDiscountPercent(parsed.overallDiscountPercent || 0);
        setInvoiceCurrency(parsed.invoiceCurrency || 'تومان');
        setExchangeRate(parsed.exchangeRate || 1);
        setExchangeRateInput(parsed.exchangeRateInput || '1');
        setInvoiceDescription(parsed.invoiceDescription || '');
        
        // Timeout to let activeTab's effect finish, then override
        setTimeout(() => {
          setInvoiceType(parsed.invoiceType || 'sale');
          setInvoiceTitle(parsed.invoiceTitle || '');
        }, 50);
        
        showNotification('وضعیت ثبت نشده فاکتور، بازیابی شد.', 'info');
      } catch (e) {}
    }
  };
  
  const clearDraft = () => {
    localStorage.removeItem('invoice_draft');
    setHasDraft(false);
    setCustomerId('');
    setItems([]);
    setOverallDiscountPercent(0);
    setSourceInvoiceId('');
    setSellerInvoiceNumber('');
    if (invoiceMode === 'manual') setInvoiceNumber('');
    setEditingInvoiceId(null);
  };
  
  const [submitting, setSubmitting] = useState(false);

  // Redirect to financial_years if no active financial year is set
  useEffect(() => {
    if (hasCheckedFinancialYears && !activeFinancialYear) {
      if (activeTab !== 'financial_years' && activeTab !== 'settings') {
        setActiveTab('financial_years');
      }
    }
  }, [hasCheckedFinancialYears, activeFinancialYear, activeTab]);

  // Re-fetch financial year info when tab changes to 'financial_years' or 'settings'
  useEffect(() => {
    if (activeTab === 'financial_years') {
      fetchFinancialYearInfo();
    }
  }, [activeTab]);
  
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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const handleBarcodeScan = (code: string) => {
    setIsScannerOpen(false);
    const product = products.find(p => p.barcode === code);
    if (product) {
      handleFastAddProduct(String(product.id));
      showNotification('کالا با موفقیت اضافه شد', 'success');
    } else {
      showNotification('کالا با این بارکد یافت نشد', 'error');
    }
  };
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
  const [newProductWarehouseId, setNewProductWarehouseId] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductMinStock, setNewProductMinStock] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('');
  const [newProductSecondaryUnit, setNewProductSecondaryUnit] = useState('');
  const [newProductUnitRatio, setNewProductUnitRatio] = useState('');
  const [productFormTab, setProductFormTab] = useState<'general' | 'financial' | 'inventory' | 'history'>('general');
  const [newProductDesc, setNewProductDesc] = useState('');

  // Categories list
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<string | number | ''>('');
  const [categorySearch, setCategorySearch] = useState('');

  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Person state
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [newPersonType, setNewPersonType] = useState<'real' | 'legal'>('real');
  const [newPersonTitle, setNewPersonTitle] = useState('');
  const [newPersonAlias, setNewPersonAlias] = useState('');
  const [newPersonFirstName, setNewPersonFirstName] = useState('');
  const [newPersonLastName, setNewPersonLastName] = useState('');
  const [newPersonCompanyName, setNewPersonCompanyName] = useState('');
  const [newPersonFatherName, setNewPersonFatherName] = useState('');
  const [newPersonNationalId, setNewPersonNationalId] = useState('');
  const [newPersonAddress, setNewPersonAddress] = useState('');
  const [newPersonRole, setNewPersonRole] = useState<string>('');
  const [newPersonAccountingCode, setNewPersonAccountingCode] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  const [newPersonGroup, setNewPersonGroup] = useState('');
  const [newPersonProvince, setNewPersonProvince] = useState('');
  const [newPersonCity, setNewPersonCity] = useState('');
  const [newPersonIsActive, setNewPersonIsActive] = useState(true);
  const [newPersonRegistrationDate, setNewPersonRegistrationDate] = useState<Date | any>(new Date());
  const [newPersonInitialBalance, setNewPersonInitialBalance] = useState('');
  const [newPersonInitialBalanceType, setNewPersonInitialBalanceType] = useState<'debtor' | 'creditor' | 'settled'>('settled');
  
  const [submittingPerson, setSubmittingPerson] = useState(false);
  const [personModalActiveTab, setPersonModalActiveTab] = useState<'basic' | 'contact' | 'financial' | 'settings'>('basic');
  const [isPersonExtraModalOpen, setIsPersonExtraModalOpen] = useState(false);
  const [personExtraId, setPersonExtraId] = useState<string|number|null>(null);
  const [personBankName, setPersonBankName] = useState('');
  const [personBankAcc, setPersonBankAcc] = useState('');
  const [personCard, setPersonCard] = useState('');
  const [personSheba, setPersonSheba] = useState('');
  const [personNotes, setPersonNotes] = useState('');

  // Persons Import/Export Modal states
  const [isPersonIOModalOpen, setIsPersonIOModalOpen] = useState(false);
  const [personIOAction, setPersonIOAction] = useState<'import' | 'export'>('export');
  const [personsIOFileType, setPersonsIOFileType] = useState<'excel_pasted' | 'json' | 'csv'>('excel_pasted');
  const [pastedPersonsText, setPastedPersonsText] = useState('');
  const [importSelectedFile, setImportSelectedFile] = useState<File | null>(null);
  
  // Custom CSV / Pasted Excel Parsing state
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [detectedDelimiter, setDetectedDelimiter] = useState('\t');
  const [isFirstRowHeader, setIsFirstRowHeader] = useState(true);
  const [personIOMappings, setPersonIOMappings] = useState<Record<string, number>>({
    name: -1,
    personType: -1,
    nationalId: -1,
    role: -1,
    phone: -1,
    fatherName: -1,
    companyName: -1,
    address: -1,
    bankName: -1,
    bankAccountNumber: -1,
    cardNumber: -1,
    shebaNumber: -1,
    additionalNotes: -1,
    personCode: -1
  });


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

  // Warehouse modal & form state
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [newWarehouseManager, setNewWarehouseManager] = useState('');
  const [newWarehouseLocation, setNewWarehouseLocation] = useState('');
  const [newWarehouseIsActive, setNewWarehouseIsActive] = useState(true);
  const [submittingWarehouse, setSubmittingWarehouse] = useState(false);

  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);
  const [editingPersonId, setEditingPersonId] = useState<string | number | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | number | null>(null);
  const [editingCashboxId, setEditingCashboxId] = useState<string | number | null>(null);
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | number | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<any>({ 
    storeName: '', address: '', phone: '', logoUrl: '', currency: 'تومان', fontFamily: 'Vazirmatn',
    allowNegativeStock: false, requireWarehouse: false,
    prefix_warehouse_receipt: 'REC-', prefix_warehouse_remittance: 'REM-',
    prefix_purchase: 'PUR-', prefix_sale: 'INV-',
    prefix_receive_receipt: 'RD-', prefix_pay_receipt: 'PD-',
    prefix_proforma: 'PF-', prefix_salary: 'PAY-',
    print_footer_note: '', print_signature_1: '', print_signature_2: '', print_signature_3: ''
  });
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'numbering' | 'features' | 'printing' | 'notification'>('general');

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

  const handleExportProductsData = () => {
    const worksheet = XLSX.utils.json_to_sheet(products.map(p => {
       const mapped = { ...p };
       delete mapped.priceHistory;
       return mapped;
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const filename = `products_export_${new Date().toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, filename);
    customAlert('خروجی اکسل کالاها با موفقیت دریافت شد.');
  };

  const handleImportProductsData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const imported = XLSX.utils.sheet_to_json(worksheet);
          
          if (!Array.isArray(imported) || imported.length === 0) {
            customAlert('فایل نامعتبر یا خالی است.');
            return;
          }
          if (!confirm(`تعداد ${imported.length} کالا آماده درون‌ریزی است. ادامه می‌دهید؟`)) return;
          
          setSubmittingProduct(true);
          for (const p of (imported as any[])) {
             const payload = { ...p };
             delete payload.id;
             delete payload.createdAt;
             delete payload.updatedAt;
             await addProduct(payload);
          }
          await fetchProducts();
          setSubmittingProduct(false);
          customAlert('کالاها با موفقیت درون‌ریزی شدند.');
        } catch (err) {
          console.error(err);
          customAlert('خطا در خواندن فایل اکسل!');
          setSubmittingProduct(false);
        }
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };

  const handleGenerateDemoData = async () => {
    if (!confirm('آیا از ایجاد اطلاعات نمونه (دسته‌بندی و کالا) اطمینان دارید؟ اطلاعات فعلی شما دست‌نخورده باقی می‌ماند.')) return;
    
    setSubmittingProduct(true);
    try {
      const cat1 = await addProductCategory({
        name: 'نوشیدنی‌ها',
        description: 'انواع نوشیدنی‌های گرم و سرد',
      });
      const cat2 = await addProductCategory({
        name: 'تنقلات',
        description: 'چیپس، پفک، بیسکویت...',
      });

      await addProduct({
        name: 'نوشابه خانواده کوکاکولا',
        type: 'product',
        categoryId: cat1.id,
        category: 'نوشیدنی‌ها',
        price: 25000,
        purchasePrice: 20000,
        buyPrice: 20000,
        sellPrice: 25000,
        stock: 50,
        unit: 'بطری',
        secondaryUnit: 'باکس',
        unitRatio: 6,
      });

      await addProduct({
        name: 'آب معدنی کوچک دماوند',
        type: 'product',
        categoryId: cat1.id,
        category: 'نوشیدنی‌ها',
        price: 5000,
        purchasePrice: 3500,
        buyPrice: 3500,
        sellPrice: 5000,
        stock: 120,
        unit: 'بطری',
        secondaryUnit: 'باکس',
        unitRatio: 12,
      });

      await addProduct({
        name: 'چیپس نمکی مزمز',
        type: 'product',
        categoryId: cat2.id,
        category: 'تنقلات',
        price: 35000,
        purchasePrice: 28000,
        buyPrice: 28000,
        sellPrice: 35000,
        stock: 45,
        unit: 'بسته',
        secondaryUnit: 'کارتن',
        unitRatio: 10,
      });

      await fetchProducts();
    } catch (err) {
      console.error('Error generating demo data', err);
      alert('خطا در ایجاد دیتای نمونه');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;
    
    setSubmittingProduct(true);
    try {
      const isEdit = editingProductId !== null;
      const catName = productCategories.find(c => String(c.id) === String(newProductCategoryId))?.name || 'عمومی';
      
      let finalCode = newProductCode;
      if (!isEdit && !finalCode) {
         const cat = productCategories.find(c => String(c.id) === String(newProductCategoryId));
         let catCode = cat?.code;
         if (!catCode) {
            catCode = "GEN";
         }
         const existingProducts = products.filter(p => typeof p.code === 'string' && p.code.startsWith(catCode));
         const maxCode = existingProducts.map(p => parseInt((p.code).replace(catCode, ''), 10))
                                       .filter(n => !isNaN(n))
                                       .reduce((a, b) => Math.max(a, b), 0);
         finalCode = `${catCode}${String(maxCode + 1).padStart(4, '0')}`;
      }

      const payload = { 
        name: newProductName, 
        price: Number(newProductPrice || 0),
        buyPrice: Number(newProductPurchasePrice || 0),
        sellPrice: Number(newProductPrice || 0),
        type: newProductType,
        categoryId: newProductCategoryId,
        category: catName,
        code: finalCode,
        barcode: newProductBarcode,
        purchasePrice: Number(newProductPurchasePrice || 0),
        stock: Number(newProductStock || 0),
        warehouseId: newProductWarehouseId,
        minStock: Number(newProductMinStock || 0),
        unit: newProductUnit || 'عدد',
        secondaryUnit: newProductSecondaryUnit,
        unitRatio: Number(newProductUnitRatio || 1),
        description: newProductDesc
      };

      if (isEdit) {
        await updateProduct(editingProductId.toString(), payload);
        setSuccessMsg('کالا با موفقیت ویرایش شد.');
      } else {
        const addedProduct = await addProduct(payload);
        setSuccessMsg('کالای جدید با موفقیت ثبت شد.');
        
        if (['create_sale', 'create_purchase', 'create_warehouse_doc'].includes(activeTab)) {
            handleFastAddProduct(addedProduct.id.toString(), addedProduct);
            setNotification({ message: 'کالا به عنوان ردیف جدید به فاکتور اضافه شد.', type: 'info' });
            setTimeout(() => setNotification(null), 3000);
        }
      }
      
      await fetchProducts();
      setNewProductName('');
      setNewProductPrice('');
      setNewProductType('product');
      setNewProductCategoryId('');
      setNewProductCode('');
      setNewProductBarcode('');
      setNewProductPurchasePrice('');
      setNewProductWarehouseId('');
      setNewProductStock('');
      setNewProductMinStock('');
      setNewProductUnit('');
      setNewProductSecondaryUnit('');
      setNewProductUnitRatio('');
      setNewProductDesc('');
      setProductFormTab('general');
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
        const codechars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let newCode = "";
        for (let i = 0; i < 3; i++) {
           newCode += codechars.charAt(Math.floor(Math.random() * codechars.length));
        }
        await addProductCategory({ code: newCode, name: newCatName, description: newCatDesc, parentId: newCatParentId || null });
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
    const isUsedInInvoices = invoices.some(inv => inv.items && inv.items.some((item: any) => item.productId?.toString() === id.toString()));
    if (isUsedInInvoices) {
      alert('این کالا در فاکتورها استفاده شده است و قابل حذف نمی‌باشد.');
      return;
    }
    if (!confirm('آیا از حذف این کالا اطمینان دارید؟')) return;
    try {
      await deleteProduct(id.toString());
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product', error);
    }
  };

  const fetchPersonGroups = async () => {
    try {
      const data = await getPersonGroups();
      setPersonGroups(data as any);
    } catch (error) {
      console.error('Error fetching person groups', error);
    }
  };

  const fetchPersonRoles = async () => {
    try {
      const data = await getPersonRoles();
      setPersonRoles(data as any);
    } catch (error) {
      console.error('Error fetching person roles', error);
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
      let generatedAlias = '';
      if (newPersonType === 'legal') {
        name = newPersonCompanyName || '';
        generatedAlias = newPersonAlias || newPersonCompanyName || '';
      } else {
        name = `${newPersonFirstName || ''} ${newPersonLastName || ''}`.trim();
        generatedAlias = newPersonAlias || `${newPersonTitle ? newPersonTitle + ' ' : ''}${name}`.trim();
      }

      const duplicateNationalId = newPersonNationalId ? persons.find(p => p.nationalId === newPersonNationalId && (!isEdit || p.id.toString() !== editingPersonId.toString())) : null;
      const duplicatePhone = newPersonPhone ? persons.find(p => p.phone === newPersonPhone && (!isEdit || p.id.toString() !== editingPersonId.toString())) : null;
      const duplicateAlias = generatedAlias ? persons.find(p => (p.alias === generatedAlias || p.name === generatedAlias) && (!isEdit || p.id.toString() !== editingPersonId.toString())) : null;

      let warningMessage = '';
      if (duplicateAlias) warningMessage += 'نام مستعار یا نام وارد شده تکراری است (مربوط به: ' + (duplicateAlias.name || duplicateAlias.alias) + ').\n';
      if (duplicateNationalId) warningMessage += 'کد/شناسه ملی وارد شده تکراری است (مربوط به: ' + duplicateNationalId.name + ').\n';
      if (duplicatePhone) warningMessage += 'شماره تماس وارد شده تکراری است (مربوط به: ' + duplicatePhone.name + ').\n';

      if (warningMessage) {
         if (!window.confirm(warningMessage + '\nآیا مطمئن هستید که می‌خواهید این شخص را با اطلاعات تکراری ثبت کنید؟')) {
             setSubmittingPerson(false);
             return;
         }
      }

      const payload = {
        type: newPersonRole,           // Firebase db maps roles to type
        name: name,
        fullName: name,
        title: newPersonTitle,
        alias: generatedAlias,
        personType: newPersonType,
        firstName: newPersonFirstName,
        lastName: newPersonLastName,
        companyName: newPersonCompanyName,
        fatherName: newPersonFatherName,
        nationalId: newPersonNationalId,
        accountingCode: newPersonAccountingCode,
        address: newPersonAddress,
        role: newPersonRole,
        phone: newPersonPhone,
        initialBalance: Number(newPersonInitialBalance || 0),
        initialBalanceType: newPersonInitialBalanceType,
        group: newPersonGroup,
        province: newPersonProvince,
        city: newPersonCity,
        isActive: newPersonIsActive,
        registrationDate: typeof newPersonRegistrationDate.toDate === 'function' ? newPersonRegistrationDate.toDate().toISOString() : new Date(newPersonRegistrationDate).toISOString()
      };

      if (isEdit) {
        await updatePerson(editingPersonId.toString(), payload as any);
      } else {
        await addPerson(payload as any);
      }
      
      await fetchPersons();
      setNewPersonTitle('');
      setNewPersonAlias('');
      setNewPersonFirstName('');
      setNewPersonLastName('');
      setNewPersonCompanyName('');
      setNewPersonFatherName('');
      setNewPersonNationalId('');
      setNewPersonAccountingCode('');
      setNewPersonAddress('');
      setNewPersonPhone('');
      setNewPersonGroup('');
      setNewPersonProvince('');
      setNewPersonCity('');
      setNewPersonIsActive(true);
      setNewPersonRegistrationDate(new Date());
      setNewPersonRole('customer');
      setNewPersonInitialBalance('');
      setNewPersonInitialBalanceType('settled');
      setPersonModalActiveTab('basic');
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
    const isUsedInInvoices = invoices.some(inv => inv.customerId?.toString() === id.toString());
    if (isUsedInInvoices) {
      alert('این شخص در فاکتورها استفاده شده است و قابل حذف نمی‌باشد.');
      return;
    }
    const isUsedInTransactions = transactions.some(tx => tx.personId?.toString() === id.toString());
    if (isUsedInTransactions) {
      alert('برای این شخص در تراکنش‌های مالی سابقه ثبت شده است و قابل حذف نمی‌باشد.');
      return;
    }
    const isUsedInIssuedChecks = issuedChecks.some(chk => chk.payeeId?.toString() === id.toString());
    const isUsedInReceivedChecks = receivedChecks.some(chk => chk.payerId?.toString() === id.toString());
    if (isUsedInIssuedChecks || isUsedInReceivedChecks) {
      alert('این شخص دارای چک ثبت شده است و قابل حذف نمی‌باشد.');
      return;
    }
    if (!confirm('آیا از حذف این شخص اطمینان دارید؟')) return;
    try {
      await deletePerson(id.toString());
      await fetchPersons();
    } catch (error) {
      console.error('Error deleting person', error);
    }
  };

  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const handleGenerateMissingAccountingCodes = async () => {
    setIsGeneratingCodes(true);
    try {
      const personsWithoutCode = persons.filter(p => !p.accountingCode || String(p.accountingCode).trim() === '');
      if (personsWithoutCode.length === 0) {
        alert('تمام اشخاص در حال حاضر دارای کد حسابداری هستند.');
        setIsGeneratingCodes(false);
        return;
      }
      
      let generated = 0;
      for (const p of personsWithoutCode) {
         await updatePerson(p.id as string, p);
         generated++;
      }
      
      setSuccessMsg(`کد حسابداری برای ${generated} شخص با موفقیت صادر شد.`);
      await fetchPersons();
    } catch (error) {
      console.error(error);
      alert('خطا در صدور کدهای حسابداری');
    } finally {
      setIsGeneratingCodes(false);
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

  const fetchWarehouses = async () => {
    try {
      const data = await getWarehouses();
      setWarehouses(data as any);
      
      const stocks = await getWarehouseStocks();
      setWarehouseStocks(stocks as any);
    } catch (error) {
      console.error('Error fetching warehouses', error);
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

  const handleSubmitReceipt = (type: 'receive' | 'pay', e: React.FormEvent) => {
    e.preventDefault();
    if (receiptMethod === 'cash') {
      if (!receiptPersonId || !receiptAmount || !receiptResourceType || !receiptResourceId) {
        customAlert('لطفا تمام اطلاعات الزامی فرم را وارد کنید.');
        return;
      }
    } else {
      if (!receiptPersonId || !receiptAmount || !receiptCheckNumber || !receiptCheckDueDate || (type === 'receive' && !receiptCheckBankName) || (type === 'pay' && !receiptCheckbookId)) {
        customAlert('لطفا تمام اطلاعات الزامی فرم چک را وارد کنید.');
        return;
      }
    }
    
    // Validate allocated amounts
    const totalAllocated = Object.values(receiptLinkedInvoices).reduce((a, b) => a + b, 0);
    if (totalAllocated > Number(receiptAmount)) {
       customAlert(`جمع مبالغ تخصیص داده شده (${totalAllocated}) از مبلغ کل رسید (${receiptAmount}) بیشتر است.`);
       return;
    }
    
    // Generate simple receipt number for review
    const typeKey = type === 'receive' ? 'receive_receipt' : 'pay_receipt';
    const defaultPrefix = type === 'receive' ? 'RD-' : 'PD-';
    const receiptPrefix = typeof storeSettings[`prefix_${typeKey}`] !== 'undefined' 
      ? storeSettings[`prefix_${typeKey}`] 
      : defaultPrefix;
      
    const existingRelated = transactions.filter((t: any) => t.type === type && t.receiptNumber);
    
    // Calculate sequential number based on settings
    const startNumStr = storeSettings[`start_${typeKey}`] || storeSettings.invoiceStartNumber || '1000';
    const lenStr = storeSettings[`len_${typeKey}`] || storeSettings.invoiceNumberLength || '6';
    
    const startNum = parseInt(startNumStr, 10);
    const numLength = Math.max(1, parseInt(lenStr, 10));
    
    let maxNum = startNum - 1;
    
    if (existingRelated.length > 0) {
      const nums = existingRelated.map((t: any) => {
        let numStr = String(t.receiptNumber);
        if (numStr.startsWith(receiptPrefix)) {
          numStr = numStr.substring(receiptPrefix.length);
        }
        const match = numStr.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      });
      const maxExisting = Math.max(...nums);
      if (maxExisting > maxNum) maxNum = maxExisting;
    }
    const nextNum = maxNum + 1;
    const formattedNum = String(nextNum).padStart(numLength, '0');
    const receiptNumber = `${receiptPrefix}${formattedNum}`;
    
    const basePayload: any = {
        type,
        method: receiptMethod,
        personId: receiptPersonId,
        amount: Number(receiptAmount),
        date: typeof receiptDate.toDate === 'function' ? receiptDate.toDate().toISOString() : new Date(receiptDate).toISOString(),
        jalaliDate: typeof receiptDate.toDate === 'function' ? new Date(receiptDate.toDate().toISOString()).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR') : new Date(receiptDate).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'),
        description: receiptDescription,
        receiptNumber: receiptNumber
    };

    if (receiptMethod === 'cash') {
      basePayload.resourceType = receiptResourceType;
      basePayload.resourceId = receiptResourceId;
    } else {
      basePayload.checkNumber = receiptCheckNumber;
      basePayload.checkDueDate = typeof receiptCheckDueDate.toDate === 'function' ? new Date(receiptCheckDueDate.toDate().toISOString()).toLocaleDateString('fa-IR') : new Date(receiptCheckDueDate).toLocaleDateString('fa-IR');
      if (type === 'receive') {
        basePayload.checkBankName = receiptCheckBankName;
      } else {
        basePayload.checkbookId = receiptCheckbookId;
      }
    }
    
    setPreviewReceiptData(basePayload);
  };
  
  const confirmReceiptSubmit = async () => {
    if (!previewReceiptData) return;
    setSubmittingReceipt(true);
    try {
      const txPayload = { ...previewReceiptData, linkedInvoices: receiptLinkedInvoices };
      let createdReceiptObj: any = { ...previewReceiptData };
      if (previewReceiptData.method === 'check') {
         if (previewReceiptData.type === 'receive') {
           const savedCheck = await addReceivedCheck({
             checkNumber: previewReceiptData.checkNumber,
             bankName: previewReceiptData.checkBankName,
             branchName: '',
             amount: previewReceiptData.amount,
             payerId: previewReceiptData.personId,
             receiveDate: previewReceiptData.jalaliDate,
             dueDate: previewReceiptData.checkDueDate,
             status: 'received',
             description: previewReceiptData.description || `چک دریافتی شماره ${previewReceiptData.checkNumber} (سررسید ${previewReceiptData.checkDueDate}) بابت رسید ${previewReceiptData.receiptNumber}`,
             receiptNumber: previewReceiptData.receiptNumber
           });
           createdReceiptObj.id = savedCheck.id;
         } else {
           const savedCheck = await addIssuedCheck({
             checkbookId: previewReceiptData.checkbookId,
             checkNumber: previewReceiptData.checkNumber,
             amount: previewReceiptData.amount,
             payeeId: previewReceiptData.personId,
             issueDate: previewReceiptData.jalaliDate,
             dueDate: previewReceiptData.checkDueDate,
             status: 'issued',
             description: previewReceiptData.description || `چک صادره شماره ${previewReceiptData.checkNumber} (سررسید ${previewReceiptData.checkDueDate}) بابت رسید ${previewReceiptData.receiptNumber}`,
             receiptNumber: previewReceiptData.receiptNumber
           });
         }
         const savedTx = await addTransaction(txPayload as any);
         createdReceiptObj = savedTx;
      } else {
         const savedTx = await addTransaction(txPayload as any);
         createdReceiptObj = savedTx;
      }
      
      // Update actual invoices payment status and paid amount out of linkedInvoices
      for (const [invId, amount] of Object.entries(receiptLinkedInvoices)) {
         const inv = invoices.find(i => i.id.toString() === invId);
         if (inv && amount > 0) {
            const newPaid = (inv.paidAmount || 0) + amount;
            const newStatus = newPaid >= (inv.totalAmount || 0) ? 'paid' : 'partial';
            await updateInvoice(inv.id, { ...inv, paidAmount: newPaid, paymentStatus: newStatus });
         }
      }
      
      const typeTmp = previewReceiptData.type;
      
      setReceiptPersonId('');
      setReceiptAmount('');
      setReceiptResourceType('bank');
      setReceiptResourceId('');
      setReceiptCheckNumber('');
      setReceiptCheckBankName('');
      setReceiptCheckbookId('');
      setReceiptCheckDueDate(new Date());
      setReceiptMethod('cash');
      setReceiptDescription('');
      setReceiptDate(new Date());
      setReceiptLinkedInvoices({});
      setPreviewReceiptData(null);
      setReceiptPersonSearchText('');

      await Promise.all([
        fetchTransactions(),
        import('./services/dataService').then(({ getLoans, getInstallments }) => Promise.all([getLoans().then(setLoans), getInstallments().then(setInstallments)])),
        fetchInvoices(),
        fetchPersons(),
        fetchAccounts(),
        fetchCashboxes(),
        fetchChecks()
      ]);

      setLastCreatedReceipt(createdReceiptObj);
      setReceiptSuccessMsg(typeTmp === 'receive' ? 'رسید دریافت با موفقیت صادر شد' : 'رسید پرداخت با موفقیت صادر شد');
      if (storeSettings?.notify_on_receipt) {
         const person = persons.find(p => p.id === previewReceiptData.personId);
         if (person && person.phone) {
             const amt = typeof formatNumber === 'function' ? formatNumber(previewReceiptData.amount) : previewReceiptData.amount;
             const isRec = typeTmp === 'receive';
             sendNotification(`${person.name} گرامی، رسید ${isRec ? 'دریافت از' : 'پرداخت به'} شما به مبلغ ${amt} ${storeSettings?.currency || 'تومان'} با موفقیت ثبت شد.`, person.phone, storeSettings?.notify_method);
         }
      }
    } catch (err: any) {
      console.error(err);
      customAlert(err.message || 'خطا در ارتباط با سرور.');
    } finally {
      setSubmittingReceipt(false);
    }
  };

  const handleSaveReceipt = async (updatedFields: any) => {
    if (!editingReceipt) return;
    try {
      await updateTransaction(editingReceipt.id, updatedFields);
      
      // Keep related checks in sync
      if (editingReceipt.method === 'check') {
        const checkNum = editingReceipt.checkNumber;
        const receiptNo = editingReceipt.receiptNumber;
        if (editingReceipt.type === 'receive') {
          const matchedCheck = receivedChecks.find(c => c.receiptNumber === receiptNo || c.checkNumber === checkNum);
          if (matchedCheck) {
            await updateReceivedCheck(matchedCheck.id, {
              ...matchedCheck,
              checkNumber: updatedFields.checkNumber || matchedCheck.checkNumber,
              bankName: updatedFields.checkBankName || matchedCheck.bankName,
              amount: updatedFields.amount || matchedCheck.amount,
              payerId: updatedFields.personId || matchedCheck.payerId,
              dueDate: updatedFields.checkDueDate || matchedCheck.dueDate,
              receiveDate: updatedFields.jalaliDate || matchedCheck.receiveDate,
            });
          }
        } else {
          const matchedCheck = issuedChecks.find(c => c.receiptNumber === receiptNo || c.checkNumber === checkNum);
          if (matchedCheck) {
            await updateIssuedCheck(matchedCheck.id, {
              ...matchedCheck,
              checkNumber: updatedFields.checkNumber || matchedCheck.checkNumber,
              checkbookId: updatedFields.checkbookId || matchedCheck.checkbookId,
              amount: updatedFields.amount || matchedCheck.amount,
              payeeId: updatedFields.personId || matchedCheck.payeeId,
              dueDate: updatedFields.checkDueDate || matchedCheck.dueDate,
              issueDate: updatedFields.jalaliDate || matchedCheck.issueDate,
            });
          }
        }
      }

      await Promise.all([
        fetchTransactions(),
        fetchInvoices(),
        fetchPersons(),
        fetchAccounts(),
        fetchCashboxes(),
        fetchChecks()
      ]);
      showNotification('تغییرات با موفقیت روی رسید ذخیره گردید و اسناد مربوطه بروز شدند.', 'success');
    } catch (err) {
      console.error(err);
      customAlert('خطا در بروزرسانی سند رسید.');
    }
  };

  const handleSubmitSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryPersonId || !salaryBaseAmount) {
      customAlert('لطفا کارمند و مبلغ حقوق پایه را تعیین کنید');
      return;
    }

    if (!window.confirm('آیا از ثبت و صدور این فیش حقوقی اطمینان دارید؟ در صورت تایید، سند و گردش مالی به ثبت می‌رسد.')) return;

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
      const personName = p ? getPersonDisplayName(p) : 'کارمند';

      // Build payslip breakdown to store in description as JSON string
      const payloadDescription = JSON.stringify({
        isPayslip: true,
        employeeName: personName,
        periodMonth: salaryPeriodMonth,
        periodYear: salaryPeriodYear,
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

      
      // Auto-assign receipt number for salary
      const salaryPrefix = storeSettings.prefix_salary !== undefined ? storeSettings.prefix_salary : 'PAY-';
      
      const startNumStr = storeSettings.start_salary || storeSettings.invoiceStartNumber || '1000';
      const lenStr = storeSettings.len_salary || storeSettings.invoiceNumberLength || '6';
      
      const startNum = parseInt(startNumStr, 10);
      const numLength = Math.max(1, parseInt(lenStr, 10));
      
      let maxNum = startNum - 1;
      
      const existingRelated = transactions.filter((t: any) => t.type === 'salary' && t.receiptNumber);
      if (existingRelated.length > 0) {
        const nums = existingRelated.map((t: any) => {
          let numStr = String(t.receiptNumber);
          if (numStr.startsWith(salaryPrefix)) {
            numStr = numStr.substring(salaryPrefix.length);
          }
          const match = numStr.match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        });
        const maxExisting = Math.max(...nums);
        if (maxExisting > maxNum) maxNum = maxExisting;
      }
      
      const nextNum = maxNum + 1;
      const receiptNumber = `${salaryPrefix}${String(nextNum).padStart(numLength, '0')}`;

      const payload = {
        type: 'salary',
        receiptNumber,
        personId: salaryPersonId,
        amount: netSalary,
        date: typeof salaryDate.toDate === 'function' ? salaryDate.toDate().toISOString() : new Date(salaryDate).toISOString(),
        jalaliDate: new Date(salaryDate).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'),
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
      setSalaryPeriodMonth('1');
      setSalaryPeriodYear('1403');
      setSalaryDirectPayment(false);
      setSalaryResourceId('');
      
      await Promise.all([
        fetchTransactions(),
        fetchInvoices(),
        fetchAccounts(),
        fetchCashboxes()
      ]);

      
    } catch (error: any) {
      console.error('Error submitting salary', error);
      customAlert(error.message || 'خطای سیستمی رخ داد');
    } finally {
      setSubmittingSalary(false);
    }
  };

  const handleDeleteTransaction = async (id: number | string) => {
    if (!confirm('آیا از حذف این سند اطمینان دارید؟ مانده حساب مربوطه اصلاح خواهد شد.')) return;
    try {
      const tx = transactions.find(t => t.id.toString() === id.toString());
      if (tx && tx.method === 'check' && tx.checkNumber) {
         if (tx.type === 'receive') {
             const rc = receivedChecks.find(c => c.checkNumber === tx.checkNumber && c.payerId === tx.personId);
             if (rc) await deleteReceivedCheck(rc.id.toString());
         } else {
             const ic = issuedChecks.find(c => c.checkNumber === tx.checkNumber && c.payeeId === tx.personId);
             if (ic) await deleteIssuedCheck(ic.id.toString());
         }
      }
      
      await deleteTransaction(id.toString());
      await Promise.all([
        fetchTransactions(),
        fetchAccounts(),
        fetchCashboxes(),
        fetchChecks()
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

  const handleSubmitWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarehouseName) return;
    setSubmittingWarehouse(true);
    try {
      const isEdit = editingWarehouseId !== null;
      const payload = {
        name: newWarehouseName,
        manager: newWarehouseManager,
        location: newWarehouseLocation,
        isActive: newWarehouseIsActive,
      };

      if (isEdit) {
        await updateWarehouse(editingWarehouseId.toString(), payload as any);
      } else {
        await addWarehouse(payload as any);
      }
      
      await fetchWarehouses();
      setNewWarehouseName('');
      setNewWarehouseManager('');
      setNewWarehouseLocation('');
      setNewWarehouseIsActive(true);
      setEditingWarehouseId(null);
      setIsWarehouseModalOpen(false);
      setSuccessMsg(isEdit ? 'انبار با موفقیت ویرایش شد' : 'انبار با موفقیت ثبت شد');
      
    } catch (error) {
      console.error('Error saving warehouse', error);
      setSuccessMsg('خطا در ثبت انبار');
    } finally {
      setSubmittingWarehouse(false);
    }
  };

  const handleDeleteWarehouse = async (id: number | string) => {
    if (!confirm('آیا از حذف این انبار اطمینان دارید؟')) return;
    try {
      await deleteWarehouse(id.toString());
      await fetchWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse', error);
    }
  };

  const handleRecalculateStocks = async () => {
    try {
      setRecalculating(true);
      await recalculateAllWarehouseStocks();
      const stocks = await getWarehouseStocks();
      setWarehouseStocks(stocks as any);
      
      const fetchedProds = await getProducts();
      setProducts(fetchedProds as any);
      
      showNotification('موجودی انبارها و کارت‌های کالا با موفقیت بر اساس اسناد فاکتورها، ورود و خروج‌ها محاسبه مجدد شد.', 'success');
    } catch (e) {
      console.error(e);
      showNotification('خطا در محاسبه مجدد موجودی انبار.', 'error');
    } finally {
      setRecalculating(false);
    }
  };

  const handleEditWarehouse = (w: Warehouse) => {
    setEditingWarehouseId(w.id);
    setNewWarehouseName(w.name);
    setNewWarehouseManager(w.manager || '');
    setNewWarehouseLocation(w.location || '');
    setNewWarehouseIsActive(w.isActive !== undefined ? w.isActive : true);
    setIsWarehouseModalOpen(true);
  };

  const handleEditProduct = (p: Product | any) => {
    setEditingProductId(p.id);
    setNewProductName(p.name);
    setNewProductPrice(p.price.toString());
    setNewProductPurchasePrice(p.purchasePrice?.toString() || '');
    setNewProductType(p.type);
    setNewProductCategoryId(p.categoryId || '');
    setNewProductCode(p.code || '');
    setNewProductBarcode(p.barcode || '');
    setNewProductWarehouseId(p.warehouseId?.toString() || '');
    setNewProductStock(p.stock?.toString() || '');
    setNewProductMinStock(p.minStock?.toString() || '');
    setNewProductUnit(p.unit || '');
    setNewProductSecondaryUnit(p.secondaryUnit || '');
    setNewProductUnitRatio(p.unitRatio?.toString() || '');
    setNewProductDesc(p.description || '');
    setProductFormTab('general');
    setIsProductModalOpen(true);
  };

  const handleDuplicateProduct = (p: Product | any) => {
    setEditingProductId(null);
    setNewProductName(p.name + ' (کپی)');
    setNewProductPrice(p.price.toString());
    setNewProductPurchasePrice(p.purchasePrice?.toString() || '');
    setNewProductType(p.type);
    setNewProductCategoryId(p.categoryId || '');
    setNewProductCode('');
    setNewProductBarcode('');
    setNewProductWarehouseId(p.warehouseId?.toString() || '');
    setNewProductStock(p.stock?.toString() || '');
    setNewProductMinStock(p.minStock?.toString() || '');
    setNewProductUnit(p.unit || '');
    setNewProductSecondaryUnit(p.secondaryUnit || '');
    setNewProductUnitRatio(p.unitRatio?.toString() || '');
    setNewProductDesc(p.description || '');
    setProductFormTab('general');
    setIsProductModalOpen(true);
  };

  const handleSavePersonRole = async () => {
    if (!newPersonRoleName.trim() || !newPersonRoleCode.trim()) {
      alert('تمامی فیلدها الزامی است');
      return;
    }
    try {
      if (editingPersonRoleId) {
        await updatePersonRole(editingPersonRoleId, { name: newPersonRoleName, code: newPersonRoleCode });
      } else {
        await addPersonRole({ name: newPersonRoleName, code: newPersonRoleCode });
      }
      await fetchPersonRoles();
      setNewPersonRoleName('');
      setNewPersonRoleCode('');
      setEditingPersonRoleId(null);
    } catch (e) {
      console.error('Error saving role', e);
    }
  };

  const handleDeletePersonRole = async (id: string) => {
    if (['customer', 'supplier', 'employee'].includes(id)) {
      alert('نقش‌های سیستمی پیش‌فرض قابل حذف نیستند.');
      return;
    }
    confirmAction('آیا از حذف این نقش اطمینان دارید؟', async () => {
      try {
        await deletePersonRole(id);
        await fetchPersonRoles();
      } catch (e) {
        console.error('Error deleting role', e);
      }
    });
  };

  const handleSavePersonGroup = async () => {
    if (!newPersonGroupName.trim()) {
      alert('نام گروه الزامی است');
      return;
    }
    try {
      if (editingPersonGroupId) {
        await updatePersonGroup(editingPersonGroupId, { name: newPersonGroupName, color: newPersonGroupColor });
      } else {
        await addPersonGroup({ name: newPersonGroupName, color: newPersonGroupColor });
      }
      await fetchPersonGroups();
      setNewPersonGroupName('');
      setNewPersonGroupColor('indigo');
      setEditingPersonGroupId(null);
    } catch (e) {
      console.error('Error saving group', e);
    }
  };

  const handleDeletePersonGroup = async (id: string) => {
    confirmAction('آیا از حذف این گروه اطمینان دارید؟ تمامی اشخاص این گروه فاقد گروه خواهند شد.', async () => {
      try {
        await deletePersonGroup(id);
        
        // Remove group from all persons in this group
        const affectedPersons = persons.filter(p => p.group === id);
        for (const p of affectedPersons) {
            await updatePerson(p.id as string, { ...p, group: '' });
        }
        
        await fetchPersonGroups();
        await fetchPersons();
      } catch (e) {
        console.error('Error deleting group', e);
      }
    });
  };

  const handleEditPerson = (p: Person) => {
    setEditingPersonId(p.id);
    setNewPersonType(p.personType);
    setNewPersonTitle(p.title || '');
    setNewPersonAlias(p.alias || '');
    setNewPersonFirstName(p.firstName || '');
    setNewPersonLastName(p.lastName || '');
    setNewPersonCompanyName(p.companyName || '');
    setNewPersonFatherName(p.fatherName || '');
    setNewPersonNationalId(p.nationalId || '');
    setNewPersonAccountingCode(p.accountingCode || '');
    setNewPersonAddress(p.address || '');
    setNewPersonPhone(p.phone || '');
    setNewPersonGroup(p.group || '');
    setNewPersonRole(p.role);
    setNewPersonProvince(p.province || '');
    setNewPersonCity(p.city || '');
    setNewPersonIsActive(p.isActive !== undefined ? p.isActive : true);
    setNewPersonRegistrationDate(p.registrationDate ? new Date(p.registrationDate) : new Date());
    setNewPersonInitialBalance(p.initialBalance?.toString() || '');
    setNewPersonInitialBalanceType(p.initialBalanceType || 'settled');
    setPersonModalActiveTab('basic');
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
        const savedData = data as any;
        const mergedSettings = {
           ...savedData,
           prefix_warehouse_receipt: savedData.prefix_warehouse_receipt ?? 'REC-',
           prefix_warehouse_remittance: savedData.prefix_warehouse_remittance ?? 'REM-',
           prefix_purchase: savedData.prefix_purchase ?? 'PUR-',
           prefix_sale: savedData.prefix_sale ?? 'INV-',
           prefix_receive_receipt: savedData.prefix_receive_receipt ?? 'RD-',
           prefix_pay_receipt: savedData.prefix_pay_receipt ?? 'PD-'
        };
        setStoreSettings(mergedSettings);
        setSettingsForm(mergedSettings);
        setInvoiceCurrency(mergedSettings.currency || 'تومان');
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


  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        customAlert('حجم تصویر نباید بیشتر از 2 مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsForm({...settingsForm, logoUrl: reader.result as string});
      };
      reader.readAsDataURL(file);
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

  const handleSourceInvoiceChange = (invoiceId: string | number) => {
    setSourceInvoiceId(invoiceId);
    if (!invoiceId) {
      setInvoiceDescription('');
      return;
    }

    const sourceInv = invoices.find(i => i.id.toString() === invoiceId.toString());
    if (sourceInv) {
      if (activeTab === 'create_warehouse_doc') {
      const dbDraftsStr = localStorage.getItem('drafts');
      let drafts = dbDraftsStr ? JSON.parse(dbDraftsStr) : {};
      delete drafts[invoiceId];
      localStorage.setItem('drafts', JSON.stringify(drafts));
    }
      
      if (sourceInv.customerId) setCustomerId(sourceInv.customerId);
      if (sourceInv.currency) {
        setInvoiceCurrency(sourceInv.currency);
        setExchangeRate(sourceInv.exchangeRate || 1);
        setExchangeRateInput(String(sourceInv.exchangeRate || 1));
      }
      if (sourceInv.items && Array.isArray(sourceInv.items)) {
        const isRemittance = activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_remittance';
        
        // Calculate previously received/remitted amounts
        const pastDocs = invoices.filter(i => 
          i.sourceInvoiceId?.toString() === invoiceId.toString() && 
          (isRemittance ? i.type === 'warehouse_remittance' : i.type === 'warehouse_receipt')
        );
        const processedAmounts: Record<string, number> = {};
        pastDocs.forEach(doc => {
          if (doc.items) {
            doc.items.forEach((rt: any) => {
               const key = String(rt.productId || rt.productName || '');
               if (!key) return;
               if (!processedAmounts[key]) processedAmounts[key] = 0;
               processedAmounts[key] += Number(rt.quantity) || 0;
            });
          }
        });
        
        const remainingItems = sourceInv.items.map((it: any) => {
          const key = String(it.productId || it.productName || '');
          const processed = key ? (processedAmounts[key] || 0) : 0;
          const remaining = (Number(it.quantity) || 0) - processed;
          return {
            ...it,
            id: generateId(),
            maxQuantity: remaining > 0 ? remaining : 0, // Save max
            quantity: remaining > 0 ? remaining : 0,
            warehouseId: '', // User will select destination warehouse
          };
        }).filter((it: any) => it.quantity > 0);

        setItems(remainingItems);
      }
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
    if (storeSettings?.fontFamily) {
      document.documentElement.style.setProperty('--app-font', storeSettings.fontFamily);
    } else {
      document.documentElement.style.setProperty('--app-font', 'Vazirmatn');
    }
  }, [storeSettings?.storeName, storeSettings?.fontFamily]);

  useEffect(() => {
    if (activeTab === 'settings' && settingsForm?.fontFamily) {
      document.documentElement.style.setProperty('--app-font', settingsForm.fontFamily);
    } else if (storeSettings?.fontFamily) {
      document.documentElement.style.setProperty('--app-font', storeSettings.fontFamily);
    } else {
      document.documentElement.style.setProperty('--app-font', 'Vazirmatn');
    }
  }, [settingsForm?.fontFamily, activeTab, storeSettings?.fontFamily]);

  const fetchChecks = async () => {
    try {
      const cb = await getCheckbooks(); setCheckbooks(cb as any);
      const ic = await getIssuedChecks(); setIssuedChecks(ic as any);
      const rc = await getReceivedChecks(); setReceivedChecks(rc as any);
    } catch(err) { console.error('fetchChecks error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPersonRoles(),
        fetchPersonGroups(),
        fetchPersons(),
        fetchProducts(),
        fetchAccounts(),
        fetchCashboxes(),
        fetchWarehouses(),
        fetchSettings(),
        fetchTransactions(),
        fetchChecks(),
        fetchFinancialYearInfo()
      ]);
      await fetchInvoices();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAddItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: generateId(),
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

  const getLastPriceForProduct = (productId: string | number, isPurchase: boolean) => {
    let lastPrice = 0;
    let latestDate = 0;
    const targetTypes = isPurchase ? ['purchase', 'warehouse_receipt'] : ['sale', 'warehouse_remittance'];
    
    invoices.forEach(inv => {
      if (targetTypes.includes(inv.type) && inv.items) {
        inv.items.forEach((item: any) => {
          if (item.productId?.toString() === productId.toString()) {
            const invDate = new Date(inv.date || inv.createdAt || 0).getTime();
            if (invDate > latestDate && (item.unitPrice || 0) > 0) {
              latestDate = invDate;
              // Normalize unit prices assuming the standard is the same unless exchange rate applies
              const rate = inv.exchangeRate || 1;
              lastPrice = (Number(item.unitPrice) || 0) * rate;
            }
          }
        });
      }
    });
    return lastPrice;
  };

  const handleFastAddProduct = (productIdStr: string, forceProductObj?: any) => {
    if (!productIdStr) return;
    const product = forceProductObj || products.find(p => p.id.toString() === productIdStr);
    if (!product) return;

    const isPurchase = activeTab === 'create_purchase' || (activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_receipt');
    let pPrice = isPurchase && product.purchasePrice ? product.purchasePrice : product.price;
    if (!pPrice || pPrice === 0) {
       pPrice = getLastPriceForProduct(product.id, isPurchase);
    }
    const convertedPrice = exchangeRate > 0 ? (pPrice / exchangeRate) : pPrice;
    const unitPriceRounded = Number(convertedPrice.toFixed(4));

    setItems(currentItems => {
      // Check if it exists
      const existingItemIndex = currentItems.findIndex(i => i.productId?.toString() === productIdStr);
      if (existingItemIndex > -1 && !storeSettings.allowDuplicateInvoiceRows) {
         const newItems = [...currentItems];
         newItems[existingItemIndex].quantity = Number(newItems[existingItemIndex].quantity || 0) + 1;
         newItems[existingItemIndex].totalPrice = Math.max(0, (newItems[existingItemIndex].quantity * newItems[existingItemIndex].unitPrice) * (1 - (newItems[existingItemIndex].discountPercent / 100)));
         return newItems;
      } else {
         return [
           ...currentItems,
           {
             id: generateId(),
             productId: productIdStr,
             productName: product.name,
             quantity: 1,
             unitPrice: unitPriceRounded,
             discountPercent: 0,
             totalPrice: unitPriceRounded,
             selectedUnit: product.unit || '',
             unitRatio: product.unitRatio || 1,
             isSecondaryUnit: false
           }
         ];
      }
    });
  };

  const handleFastBarcodeScan = (code: string) => {
    const product = products.find(p => p.barcode === code || p.code === code);
    if (product) {
      handleFastAddProduct(String(product.id), product);
      showNotification(`کالا "${product.name}" اضافه شد`, 'success');
    } else {
      showNotification('کالایی با این بارکد/کد یافت نشد', 'error');
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Special handling for product selection to auto-fill details
          if (field === 'productId' && value !== '') {
            const product = products.find(p => p.id.toString() === String(value));
            if (product) {
              updatedItem.productName = product.name;
              updatedItem.selectedUnit = product.unit || '';
              updatedItem.unitRatio = product.unitRatio || 1;
              updatedItem.isSecondaryUnit = false;
              
              const isPurchase = activeTab === 'create_purchase' || (activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_receipt');
              let pPrice = isPurchase && product.purchasePrice ? product.purchasePrice : product.price;
              if (!pPrice || pPrice === 0) {
                 pPrice = getLastPriceForProduct(product.id, isPurchase);
              }
              const convertedPrice = exchangeRate > 0 ? (pPrice / exchangeRate) : pPrice;
              
              updatedItem.unitPrice = Number(convertedPrice.toFixed(4));
              const subtotal = convertedPrice * updatedItem.quantity;
              updatedItem.totalPrice = Math.max(0, subtotal * (1 - (updatedItem.discountPercent / 100)));
            }
          }

          // Special handling for pricing calculation
          if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent' || field === 'isSecondaryUnit') {
            const isSec = field === 'isSecondaryUnit' ? Boolean(value) : Boolean(updatedItem.isSecondaryUnit);
            
            // If we toggled the unit type, adjust the unit price relative to base price
            if (field === 'isSecondaryUnit' && updatedItem.productId) {
              const product = products.find(p => p.id.toString() === String(updatedItem.productId));
              if (product) {
                const ratio = product.unitRatio || 1;
                const prevSec = Boolean(item.isSecondaryUnit);
                if (prevSec === false && isSec === true) {
                  updatedItem.unitPrice = Number((Number(item.unitPrice) * ratio).toFixed(4));
                } else if (prevSec === true && isSec === false) {
                  updatedItem.unitPrice = Number((Number(item.unitPrice) / ratio).toFixed(4));
                }
                updatedItem.selectedUnit = isSec ? (product.secondaryUnit || '') : (product.unit || '');
              }
            }

            let qty = field === 'quantity' ? Number(value) : Number(updatedItem.quantity);
            const isWarehouseTab = activeTab === 'create_warehouse_doc';
            if (isWarehouseTab && sourceInvoiceId) {
               const sourceInv = invoices.find(i => i.id.toString() === sourceInvoiceId.toString());
               if (sourceInv) {
                 const pastDocs = invoices.filter(i => 
                   i.sourceInvoiceId?.toString() === sourceInvoiceId.toString() && 
                   (invoiceType === 'warehouse_remittance' ? i.type === 'warehouse_remittance' : i.type === 'warehouse_receipt')
                 );
                 const processedAmounts: Record<string, number> = {};
                 pastDocs.forEach(doc => {
                   if (doc.items) {
                     doc.items.forEach((rt: any) => {
                        const key = String(rt.productId || rt.productName || '');
                        if (!key) return;
                        if (!processedAmounts[key]) processedAmounts[key] = 0;
                        processedAmounts[key] += Number(rt.quantity) || 0;
                     });
                   }
                 });
                 const key = String(updatedItem.productId || updatedItem.productName || '');
                 const srcItem = sourceInv.items.find((si: any) => (si.productId || si.productName) === key);
                 if (srcItem) {
                    const processed = processedAmounts[key] || 0;
                    let maxQty = (Number(srcItem.quantity) || 0) - processed;
                    if (typeof updatedItem.maxQuantity !== 'undefined') {
                       if (qty > updatedItem.maxQuantity) qty = updatedItem.maxQuantity;
                    } else {
                       if (qty > maxQty) qty = maxQty;
                       updatedItem.maxQuantity = maxQty;
                    }
                 }
               }
            } else if (isWarehouseTab && typeof updatedItem.maxQuantity !== 'undefined') {
              if (qty > updatedItem.maxQuantity) qty = updatedItem.maxQuantity;
            }
            updatedItem.quantity = qty;
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

  const getPersonDisplayName = (person: any) => {
    if (!person) return 'نامشخص';
    return person.alias || person.name || 'نامشخص';
  };

  const getPersonDisplayNameById = (personId: string | number | undefined) => {
    if (!personId) return 'نامشخص';
    const person = persons.find(p => p.id.toString() === personId.toString());
    return getPersonDisplayName(person);
  };

  // helper to render clickable person link
  const renderPersonLink = (personId: string | number | undefined, fallbackName: string | undefined = undefined) => {
    let name = 'نامشخص';
    if (personId) {
      name = getPersonDisplayNameById(personId);
    } 
    if (name === 'نامشخص' && fallbackName) {
      name = fallbackName;
    }
    
    if (!personId || name === 'نامشخص') return <span>{name}</span>;
    return (
      <span 
        className="cursor-pointer text-indigo-600 hover:text-indigo-800 transition-colors font-bold border-b border-dashed border-indigo-300 hover:border-indigo-600 pb-[1px]"
        onClick={(e) => {
           e.stopPropagation();
           setLedgerPersonId(personId);
           setActiveTab('person_ledger');
           setDrawerPersonId('');
           setViewingInvoice(null);
           setPreviewInvoiceData(null);
           setPreviewReceiptData(null);
           setViewingPayslip(null);
        }}
        title="مشاهده کارت حساب"
      >
         {name}
      </span>
    );
  };

  const handleDeleteInvoice = async (id: string | number) => {
    const invoice = invoices.find(inv => inv.id.toString() === id.toString());
    if (!invoice) return;

    const hasLinkedWarehouseOp = invoices.some(inv => 
      (inv.type === 'warehouse_receipt' || inv.type === 'warehouse_remittance') 
      && inv.sourceInvoiceId?.toString() === id.toString() && !inv.isAutoGenerated
    );
    if (hasLinkedWarehouseOp) {
      alert('برای این فاکتور عملیات انبار (رسید/حواله) ثبت شده است و قابل حذف نمی‌باشد.');
      return;
    }

    if (!confirm('حذف این مورد غیرقابل بازگشت است. آیا اطمینان دارید؟')) return;
    deleteInvoice(id.toString()).then(fetchInvoices);
  };

  const handleEditInvoiceAction = async (inv: any) => {
    const hasLinkedWarehouseOp = invoices.some(val => 
      (val.type === 'warehouse_receipt' || val.type === 'warehouse_remittance') 
      && val.sourceInvoiceId?.toString() === inv.id.toString() && !val.isAutoGenerated
    );
    if (hasLinkedWarehouseOp) {
      alert('برای این فاکتور عملیات انبار (رسید/حواله) مبدا ثبت شده است و قابل ویرایش نمی‌باشد.');
      return;
    }
    
    const isDraft = inv.isDraft || inv.status === 'draft';
    if (!isDraft) {
      if (!confirm('آیا می‌خواهید این فاکتور را ویرایش کنید؟ نسخه قبلی پس از ذخیره نهایی حذف و با نسخه جدید جایگزین خواهد شد.')) return;
    } else {
      if (!confirm('آیا می‌خواهید این فاکتور پیش‌نویس را ویرایش کنید؟')) return;
    }
    
    setEditingInvoiceId(inv.id);
    setInvoiceMode('manual');
    setInvoiceNumber(inv.invoiceNumber);
    setSellerInvoiceNumber(inv.sellerInvoiceNumber || '');
    setInvoiceTitle(inv.title || '');
    setInvoiceType(inv.type);
    setInvoiceCurrency(inv.currency || storeSettings.currency);
    setCustomerId(inv.customerId);
    setSourceInvoiceId(inv.sourceInvoiceId || '');
    setItems(inv.items.map((i: any) => ({ ...i })));
    setOverallDiscountPercent(inv.overallDiscountPercent || 0);
    
    if (inv.date) {
      try {
        setDate(new Date(inv.date));
      } catch(e) {}
    }
    
    setActiveTab(
      inv.type === 'sale_return' ? 'create_sale_return' : inv.type === 'purchase_return' ? 'create_purchase_return' : inv.type === 'sale' ? 'create_sale' : 
      inv.type === 'purchase' ? 'create_purchase' : 
      'create_warehouse_doc'
    );
  };

  const hasRemainingWarehouseItems = (invoiceId: string | number) => {
    const sourceInv = invoices.find(i => i.id.toString() === invoiceId.toString());
    if (!sourceInv || !sourceInv.items) return false;

    const isRemittance = (activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_remittance') || activeTab === 'list_warehouse_docs';
    const pastDocs = invoices.filter(i => 
      i.sourceInvoiceId?.toString() === invoiceId.toString() && 
      (isRemittance ? i.type === 'warehouse_remittance' : i.type === 'warehouse_receipt')
    );
    const processedAmounts: Record<string, number> = {};
    pastDocs.forEach(doc => {
      if (doc.items) {
        doc.items.forEach((rt: any) => {
           const key = String(rt.productId || rt.productName || '');
           if (!key) return;
           if (!processedAmounts[key]) processedAmounts[key] = 0;
           processedAmounts[key] += Number(rt.quantity) || 0;
        });
      }
    });

    const hasAny = sourceInv.items.some((it: any) => {
      const key = String(it.productId || it.productName || '');
      const processed = key ? (processedAmounts[key] || 0) : 0;
      const remaining = (Number(it.quantity) || 0) - processed;
      return remaining > 0;
    });
    return hasAny;
  };

  const getInvoiceNumber = (typeOverride?: string) => {
    let typeKey = typeOverride || 'sale';
    if (!typeOverride) {
      if ((activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_receipt') || invoiceType === 'warehouse_receipt') typeKey = 'warehouse_receipt';
      else if ((activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_remittance') || invoiceType === 'warehouse_remittance') typeKey = 'warehouse_remittance';
      else if (activeTab === 'create_purchase' || invoiceType === 'purchase') typeKey = 'purchase';
      else if (invoiceType === 'proforma') typeKey = 'proforma';
      else if (activeTab === 'create_sale_return' || invoiceType === 'sale_return') typeKey = 'sale_return';
      else if (activeTab === 'create_purchase_return' || invoiceType === 'purchase_return') typeKey = 'purchase_return';
    }
    
    // Default prefixes if not configured
    const defaultPrefixes: Record<string, string> = {
      sale: 'INV-', purchase: 'PUR-', proforma: 'PF-', 
      warehouse_receipt: 'REC-', warehouse_remittance: 'REM-',
      sale_return: 'RTN-S-', purchase_return: 'RTN-P-'
    };
    
    const prefix = ((storeSettings as any)["prefix_" + typeKey] !== undefined && (storeSettings as any)["prefix_" + typeKey] !== null)
      ? String((storeSettings as any)["prefix_" + typeKey])
      : (defaultPrefixes[typeKey] || '');
      
    // Calculate sequential number based on settings
    const startNumStr = (storeSettings as any)["start_" + typeKey] || storeSettings.invoiceStartNumber || '1000';
    const lenStr = (storeSettings as any)["len_" + typeKey] || storeSettings.invoiceNumberLength || '6';
    
    const startNum = parseInt(startNumStr, 10);
    const numLength = Math.max(1, parseInt(lenStr, 10));

    let maxNum = startNum - 1;

    invoices.forEach(inv => {
      // Determine this invoice type
      let invType = 'sale';
      if (inv.type) invType = inv.type;
      
      if (invType === typeKey && inv.invoiceNumber) {
        let numStr = String(inv.invoiceNumber);
        if (prefix && numStr.startsWith(prefix)) {
          numStr = numStr.substring(prefix.length);
        }
        const num = parseInt(numStr.replace(/\D/g, ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNum = maxNum + 1;
    const formattedNum = String(nextNum).padStart(numLength, '0');
    return prefix + formattedNum;
  };

  const saveInvoiceData = async (customPayload?: any, isDraftOverride?: boolean) => {
    setSubmitting(true);
    setSuccessMsg('');

    const isDraft = isDraftOverride || (customPayload && (customPayload.isDraft || customPayload.status === 'draft'));

    const finalInvoiceNumber = isDraft 
      ? `پیش‌نویس-${Date.now().toString().slice(-5)}`
      : (invoiceMode === 'auto' ? getInvoiceNumber(invoiceType) : invoiceNumber);

    if ((activeTab === 'create_warehouse_doc') && !invoiceWarehouseId) {
      customAlert('لطفاً در قسمت توضیحات مبدا/مقصد فرم، یک انبار را مشخص کنید.');
      setSubmitting(false);
      return;
    }
    
    // Always enforce sales warehouse for sales
    if ((activeTab === 'create_sale' || invoiceType === 'sale') && items.some(i => products.find(p => p.id === i.productId)?.type !== 'service') && !invoiceWarehouseId) {
      customAlert('لطفاً برای فاکتور فروش، انبار فروش را انتخاب کنید. فروش حتماً باید از یک انبار مشخص انجام شود.');
      setSubmitting(false);
      return;
    }

    if (storeSettings.requireWarehouse && !activeTab.includes('warehouse') && activeTab !== 'create_sale' && items.some(i => products.find(p => p.id === i.productId)?.type !== 'service') && !invoiceWarehouseId) {
      customAlert('لطفاً برای فاکتور فروش/خریدِ شامل کالا، انبار را انتخاب کنید.');
      setSubmitting(false);
      return;
    }

    const cleanItems = items.filter(
      item => item.productName || item.productId || (item.quantity > 0 && item.unitPrice > 0)
    );

    const payload = customPayload ? {
      ...customPayload,
      isDraft,
      status: isDraft ? 'draft' : 'final',
      invoiceNumber: (customPayload.invoiceNumber && (customPayload.invoiceNumber.includes('پیش‌نویس') || customPayload.invoiceNumber.includes('خودکار') || customPayload.invoiceNumber.includes('تولید خودکار'))) 
        ? (isDraft ? `پیش‌نویس-${Date.now().toString().slice(-5)}` : getInvoiceNumber(customPayload.type)) 
        : (customPayload.invoiceNumber || getInvoiceNumber(customPayload.type))
    } : {
      invoiceNumber: finalInvoiceNumber,
      sellerInvoiceNumber: sellerInvoiceNumber || '',
      title: invoiceTitle,
      description: invoiceDescription,
      warehouseId: invoiceWarehouseId,
      type: invoiceType,
      currency: invoiceCurrency,
      date: typeof date.toDate === 'function' ? date.toDate().toISOString() : new Date(date).toISOString(),
      jalaliDate: new Date(date).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'),
      customerId,
      sourceInvoiceId,
      items: cleanItems.map(item => ({
        ...item,
        warehouseId: (storeSettings.requireWarehouse || activeTab.includes('warehouse') || activeTab === 'create_sale' || invoiceType === 'sale') && invoiceWarehouseId ? invoiceWarehouseId : item.warehouseId
      })),
      overallDiscountPercent,
      totalAmount: calculateFinalTotal(),
      paymentStatus: invoicePaymentStatus,
      paidAmount: Number(invoicePaidAmount) || 0,
      isDraft,
      status: isDraft ? 'draft' : 'final'
    };

    // 1. If it's a sale and not a draft, perform the Sales Warehouse check and identify shortages
    if (payload.type === 'sale' && !isDraft) {
      const shortages: any[] = [];
      const requiredQty: Record<string, number> = {};
      
      for (const item of payload.items) {
         if (!item.productId) continue;
         const productObj = products.find(p => p.id === item.productId);
         if (productObj?.type === 'service') continue;
         const q = (Number(item.quantity) || 0) * (item.isSecondaryUnit && item.unitRatio ? Number(item.unitRatio) : 1);
         requiredQty[item.productId] = (requiredQty[item.productId] || 0) + q;
      }

      for (const productId of Object.keys(requiredQty)) {
         const q = requiredQty[productId];
         const stockInfo = getProductStockInfo(productId);
         const targetWhId = invoiceWarehouseId ? invoiceWarehouseId.toString() : '';
         const physicalInWh = targetWhId ? (stockInfo.warehouses[targetWhId]?.physical || 0) : 0;
         
         if (physicalInWh < q) {
            const deficit = q - physicalInWh;
            const productObj = products.find(p => p.id.toString() === productId.toString());
            
            // Collect potential transfers from other active warehouses
            let remainingDeficit = deficit;
            const transfersList: any[] = [];
            
            const otherActiveWhs = warehouses.filter(w => w.isActive !== false && w.id.toString() !== targetWhId);
            for (const otherWh of otherActiveWhs) {
               if (remainingDeficit <= 0) break;
               const otherPhys = stockInfo.warehouses[otherWh.id.toString()]?.physical || 0;
               if (otherPhys > 0) {
                  const transferQty = Math.min(remainingDeficit, otherPhys);
                  transfersList.push({
                     fromWarehouseId: otherWh.id,
                     fromWarehouseName: otherWh.name,
                     toWarehouseId: targetWhId,
                     toWarehouseName: warehouses.find(w => w.id.toString() === targetWhId)?.name || 'انبار فروش',
                     qty: transferQty
                  });
                  remainingDeficit -= transferQty;
               }
            }
            
            shortages.push({
               productId,
               productName: productObj?.name || 'کالای نامشخص',
               unit: productObj?.unit || 'عدد',
               required: q,
               availableInTarget: physicalInWh,
               deficit,
               remainingDeficit,
               transfers: transfersList
            });
         }
      }

      if (shortages.length > 0) {
         // Shortage exists in sales warehouse! Propose transfer
         setTransferProposal({
            show: true,
            items: shortages,
            payload: payload
         });
         setSubmitting(false);
         return false;
      }
    }

    // 2. Standard validation for other conditions or warehouse remittances
    if (!storeSettings.allowNegativeStock && payload.type === 'warehouse_remittance') {
      const requiredQty: Record<string, number> = {};
      
      for (const item of payload.items) {
         if (!item.productId) continue;
         const productObj = products.find(p => p.id === item.productId);
         if (productObj?.type === 'service') continue;
         const q = (Number(item.quantity) || 0) * (item.isSecondaryUnit && item.unitRatio ? Number(item.unitRatio) : 1);
         const key = item.productId + "_" + (item.warehouseId || 'global');
         requiredQty[key] = (requiredQty[key] || 0) + q;
      }

      for (const key of Object.keys(requiredQty)) {
         const [productId, whId] = key.split('_');
         const q = requiredQty[key];
         const stockInfo = getProductStockInfo(productId);
         
         const avail = stockInfo.warehouses[whId]?.physical || 0;
         if (avail < q) {
            alert(`موجودی فیزیکی در انبار انتخاب شده کافی نیست. (موجودی: ${avail})`);
            setSubmitting(false);
            return false;
         }
      }
    }

    try {
      if (editingInvoiceId) {
        await deleteInvoice(editingInvoiceId);
        setEditingInvoiceId(null);
      }
      const addedInvoice = await addInvoice(payload as any);
      
      // Auto-create warehouse remittance for purchase return
      if (payload.type === 'purchase_return' && !isDraft) {
        const startNum = parseInt(storeSettings.invoiceStartNumber || '1000', 10);
        const autoPrefix = storeSettings.prefix_warehouse_remittance || 'REM-';
        const numLength = Math.max(1, parseInt(storeSettings.invoiceNumberLength || '6', 10));
        let maxNum = startNum - 1;
        invoices.forEach(inv => {
          if (inv.invoiceNumber && inv.invoiceNumber.startsWith(autoPrefix)) {
             const num = parseInt(inv.invoiceNumber.substring(autoPrefix.length), 10);
             if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        });
        const autoDocNumber = autoPrefix + String(maxNum + 1).padStart(numLength, '0');

        const autoDocPayload = {
           isAutoGenerated: true,
           invoiceNumber: autoDocNumber,
           title: 'حواله خروج خودکار (مرتبط با برگشت خرید ' + payload.invoiceNumber + ')',
           type: 'warehouse_remittance',
           warehouseId: payload.warehouseId,
           currency: payload.currency,
           date: payload.date,
           jalaliDate: payload.jalaliDate,
           customerId: payload.customerId,
           sourceInvoiceId: addedInvoice?.id || payload.invoiceNumber,
           items: payload.items.map(item => ({...item, warehouseId: item.warehouseId || payload.warehouseId})),
           overallDiscountPercent: 0,
           totalAmount: 0 
        };
        await addInvoice(autoDocPayload as any);
      }

      // Auto-create warehouse remittance for sales
      if (payload.type === 'sale' && !isDraft) {
        const startNum = parseInt(storeSettings.invoiceStartNumber || '1000', 10);
        const remPrefix = storeSettings.prefix_warehouse_remittance || 'REM-';
        const numLength = Math.max(1, parseInt(storeSettings.invoiceNumberLength || '6', 10));
        let maxNum = startNum - 1;
        invoices.forEach(inv => {
          if (inv.invoiceNumber && inv.invoiceNumber.startsWith(remPrefix)) {
             const num = parseInt(inv.invoiceNumber.substring(remPrefix.length), 10);
             if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        });
        const autoRemittanceNumber = `${remPrefix}${String(maxNum + 1).padStart(numLength, '0')}`;

        const remittancePayload = {
           isAutoGenerated: true,
           invoiceNumber: autoRemittanceNumber,
           title: 'حواله خروج خودکار (مرتبط با فاکتور ' + payload.invoiceNumber + ')',
           type: 'warehouse_remittance',
           warehouseId: payload.warehouseId,
           currency: payload.currency,
           date: payload.date,
           jalaliDate: payload.jalaliDate,
           customerId: payload.customerId,
           sourceInvoiceId: addedInvoice?.id || payload.invoiceNumber,
           items: payload.items.map(item => ({...item, warehouseId: item.warehouseId || payload.warehouseId})),
           overallDiscountPercent: 0,
           totalAmount: 0 
        };
        await addInvoice(remittancePayload as any);
      }
      
      const successTypeName = 
         payload.type === 'warehouse_receipt' ? 'رسید انبار' : 
         payload.type === 'warehouse_remittance' ? 'حواله انبار' : 
         'فاکتور';

      setSuccessMsg(isDraft ? `پیش‌نویس ${successTypeName} با موفقیت ذخیره شد!` : `${successTypeName} با موفقیت ثبت شد!`);
      if (storeSettings?.notify_on_invoice && (payload.type === 'sale' || payload.type === 'purchase') && !isDraft) {
         const person = persons.find(p => p.id === payload.customerId);
         if (person && person.phone) {
             const amt = typeof formatNumber === 'function' ? formatNumber(payload.totalAmount) : payload.totalAmount;
             const mTitle = payload.type === 'sale' ? 'مشتری گرامی' : 'همکار گرامی';
             const mWord = payload.type === 'sale' ? 'خرید' : 'فروش';
             sendNotification(`${mTitle}، فاکتور ${mWord} شما به مبلغ ${amt} ${storeSettings?.currency || 'تومان'} در سیستم ثبت شد.`, person.phone, storeSettings?.notify_method);
         }
      }
      await fetchInvoices();
      
      // Reset form after short delay
      clearDraft();
      setTimeout(() => {
        if (payload.type === 'purchase') {
          // Open pricing wizard with the added invoice items (excluding services if possible, or all items)
          const newWizardItems = payload.items.filter((it: any) => {
             const prod = products.find(p => p.id === it.productId);
             return prod && prod.type !== 'service';
          }).map((it: any) => {
             const prod = products.find(p => p.id === it.productId);
             return {
               productId: it.productId,
               productName: it.productName,
               purchasePrice: Number(it.unitPrice) || 0,
               marginPercent: 0,
               salePrice: prod ? Number(prod.price) : 0,
             };
          });
          if (newWizardItems.length > 0) {
             setPricingWizardItems(newWizardItems);
             setPricingWizardInvoice(payload);
          }
        }

        if (invoiceMode === 'manual') setInvoiceNumber('');
        setSellerInvoiceNumber('');
        setCustomerId('');
        setSourceInvoiceId('');
        setItems([]);
        setOverallDiscountPercent(0);
        setInvoiceCurrency(storeSettings.currency || 'تومان');
        setExchangeRate(1);
        setExchangeRateInput('1');
        // Re-initialize based on active tab
        if (activeTab === 'create_sale') {
          setInvoiceType('sale');
          setInvoiceTitle('فاکتور فروش کالا');
          setInvoicePaymentStatus('unpaid');
          setInvoicePaidAmount(0);
        } else if (activeTab === 'create_sale_return') {
          setInvoiceType('sale_return');
          setInvoiceTitle('فاکتور برگشت از فروش');
          setInvoicePaymentStatus('unpaid');
          setInvoicePaidAmount(0);
        } else if (activeTab === 'create_purchase_return') {
          setInvoiceType('purchase_return');
          setInvoiceTitle('فاکتور برگشت از خرید');
          setInvoicePaymentStatus('unpaid');
          setInvoicePaidAmount(0);
        } else if (activeTab === 'create_purchase') {
          setInvoiceType('purchase');
          setInvoiceTitle('فاکتور خرید کالا');
          setInvoicePaymentStatus('unpaid');
          setInvoicePaidAmount(0);
        } else if (activeTab === 'create_warehouse_doc') {
          const storedDraftStr = localStorage.getItem('invoice_draft');
          const storedDraft = storedDraftStr ? JSON.parse(storedDraftStr) : null;
          if (storedDraft && storedDraft.type === 'warehouse_receipt') {
              setInvoiceType('warehouse_receipt');
              setInvoiceTitle('رسید انبار (ورود کالا)');
              setWarehouseOperationType('purchase_invoice');
          } else {
              setInvoiceType('warehouse_remittance');
              setInvoiceTitle('حواله انبار (خروج کالا)');
              setWarehouseOperationType('sales_invoice');
          }
          setWarehouseWizardStep(1);
    } else {
          setInvoiceType('sale');
          setInvoiceTitle('فاکتور فروش کالا');
        }
        setSuccessMsg('');
        setPreviewInvoiceData(null); // Clear preview modal
      }, 1500);
      return true;
    } catch (error: any) {
      console.error('Error submitting invoice:', error);
      customAlert(error.message || 'خطا در ارتباط با سرور.');
    } finally {
      setSubmitting(false);
    }
    return false;
  };

  const handleExecuteTransferAndSubmit = async () => {
    if (!transferProposal) return;
    setSubmitting(true);
    
    try {
      const { items: proposalItems, payload: originalPayload } = transferProposal;
      
      // Let's create the transfer documents for each suggested transfer
      for (const item of proposalItems) {
        for (const tr of item.transfers) {
          // Generate warehouse remittance (exit from source warehouse) and warehouse receipt (entry to sales warehouse)
          const startNum = parseInt(storeSettings.invoiceStartNumber || '1000', 10);
          const remPrefix = storeSettings.prefix_warehouse_remittance || 'REM-';
          const recPrefix = storeSettings.prefix_warehouse_receipt || 'REC-';
          const numLength = Math.max(1, parseInt(storeSettings.invoiceNumberLength || '6', 10));
          
          let maxNumRem = startNum - 1;
          let maxNumRec = startNum - 1;
          invoices.forEach(inv => {
            if (inv.invoiceNumber) {
              if (inv.invoiceNumber.startsWith(remPrefix)) {
                 const num = parseInt(inv.invoiceNumber.substring(remPrefix.length), 10);
                 if (!isNaN(num) && num > maxNumRem) maxNumRem = num;
              }
              if (inv.invoiceNumber.startsWith(recPrefix)) {
                 const num = parseInt(inv.invoiceNumber.substring(recPrefix.length), 10);
                 if (!isNaN(num) && num > maxNumRec) maxNumRec = num;
              }
            }
          });
          
          const remNumber = `${remPrefix}${String(maxNumRem + 1).padStart(numLength, '0')}`;
          const recNumber = `${recPrefix}${String(maxNumRec + 1).padStart(numLength, '0')}`;
          
          const product = products.find(p => p.id.toString() === item.productId.toString());
          const transferDate = new Date();
          const transferJalali = transferDate.toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR');
          
          // 1. Warehouse Remittance (خروج از انبار مبدا)
          const remittancePayload = {
            isAutoGenerated: true,
            invoiceNumber: remNumber,
            title: `حواله انتقال کالا به انبار فروش (خودکار بابت فاکتور فروش ${originalPayload.invoiceNumber})`,
            description: `انتقال خودکار کالا به انبار فروش (${tr.toWarehouseName}) بابت کسر موجودی`,
            type: 'warehouse_remittance',
            warehouseId: tr.fromWarehouseId,
            currency: originalPayload.currency || 'تومان',
            date: transferDate.toISOString(),
            jalaliDate: transferJalali,
            customerId: originalPayload.customerId || '',
            items: [{
              id: generateId(),
              productId: item.productId,
              productName: item.productName,
              quantity: tr.qty,
              unitPrice: product?.price || 0,
              discountPercent: 0,
              totalPrice: (product?.price || 0) * tr.qty,
              selectedUnit: product?.unit || '',
              unitRatio: product?.unitRatio || 1,
              isSecondaryUnit: false,
              warehouseId: tr.fromWarehouseId
            }],
            overallDiscountPercent: 0,
            totalAmount: 0
          };
          
          // 2. Warehouse Receipt (ورود به انبار مقصد/فروش)
          const receiptPayload = {
            isAutoGenerated: true,
            invoiceNumber: recNumber,
            title: `رسید انتقال کالا به انبار فروش (خودکار بابت فاکتور فروش ${originalPayload.invoiceNumber})`,
            description: `انتقال خودکار کالا از انبار مبدا (${tr.fromWarehouseName}) بابت کسر موجودی`,
            type: 'warehouse_receipt',
            warehouseId: tr.toWarehouseId,
            currency: originalPayload.currency || 'تومان',
            date: transferDate.toISOString(),
            jalaliDate: transferJalali,
            customerId: originalPayload.customerId || '',
            items: [{
              id: generateId(),
              productId: item.productId,
              productName: item.productName,
              quantity: tr.qty,
              unitPrice: product?.price || 0,
              discountPercent: 0,
              totalPrice: (product?.price || 0) * tr.qty,
              selectedUnit: product?.unit || '',
              unitRatio: product?.unitRatio || 1,
              isSecondaryUnit: false,
              warehouseId: tr.toWarehouseId
            }],
            overallDiscountPercent: 0,
            totalAmount: 0
          };
          
          await addInvoice(remittancePayload as any);
          await addInvoice(receiptPayload as any);
        }
      }
      
      // Recalculate stock
      await recalculateAllWarehouseStocks();
      setTransferProposal(null);
      
      // Submit original invoice with bypass of shortage checks (since stock is now in target warehouse!)
      const addedInvoice = await addInvoice(originalPayload);
      
      // Code to automatically construct warehouse remittance for the sale:
      const startNum = parseInt(storeSettings.invoiceStartNumber || '1000', 10);
      const remPrefix = storeSettings.prefix_warehouse_remittance || 'REM-';
      const numLength = Math.max(1, parseInt(storeSettings.invoiceNumberLength || '6', 10));
      
      let maxNum = startNum - 1;
      const latestInvoices = await getInvoices();
      latestInvoices.forEach((inv: any) => {
        if (inv.invoiceNumber && inv.invoiceNumber.startsWith(remPrefix)) {
           const num = parseInt(inv.invoiceNumber.substring(remPrefix.length), 10);
           if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      const autoRemittanceNumber = `${remPrefix}${String(maxNum + 1).padStart(numLength, '0')}`;

      const remittancePayload = {
         isAutoGenerated: true,
         invoiceNumber: autoRemittanceNumber,
         title: 'حواله خروج خودکار (مرتبط با فاکتور ' + originalPayload.invoiceNumber + ')',
         type: 'warehouse_remittance',
         warehouseId: originalPayload.warehouseId,
         currency: originalPayload.currency,
         date: originalPayload.date,
         jalaliDate: originalPayload.jalaliDate,
         customerId: originalPayload.customerId,
         sourceInvoiceId: addedInvoice?.id || originalPayload.invoiceNumber,
         items: originalPayload.items.map((it: any) => ({ ...it, warehouseId: originalPayload.warehouseId })),
         overallDiscountPercent: 0,
         totalAmount: 0 
      };
      await addInvoice(remittancePayload as any);
      
      setSuccessMsg(`سند انتقال موجودی و فاکتور فروش شماره ${originalPayload.invoiceNumber} با موفقیت ثبت شدند!`);
      
      if (storeSettings?.notify_on_invoice && originalPayload.customerId) {
         const person = persons.find(p => p.id === originalPayload.customerId);
         if (person && person.phone) {
             const amt = typeof formatNumber === 'function' ? formatNumber(originalPayload.totalAmount) : originalPayload.totalAmount;
             sendNotification(`مشتری گرامی، فاکتور خرید شما به مبلغ ${amt} ${storeSettings?.currency || 'تومان'} در سیستم ثبت شد.`, person.phone, storeSettings?.notify_method);
         }
      }
      
      await fetchInvoices();
      clearDraft();
      
      setTimeout(() => {
        if (invoiceMode === 'manual') setInvoiceNumber('');
        setSellerInvoiceNumber('');
        setCustomerId('');
        setSourceInvoiceId('');
        setItems([]);
        setOverallDiscountPercent(0);
        setInvoiceCurrency(storeSettings.currency || 'تومان');
        setExchangeRate(1);
        setExchangeRateInput('1');
        
        setInvoiceType('sale');
        setInvoiceTitle('فاکتور فروش کالا');
        setInvoicePaymentStatus('unpaid');
        setInvoicePaidAmount(0);
        
        setSuccessMsg('');
        setPreviewInvoiceData(null);
      }, 1500);
      
      setActiveTab('list_sale');
    } catch (err: any) {
      console.error(err);
      customAlert(err.message || 'خطایی در اجرای انتقال و ثبت فاکتور پیش آمد.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0 || items.some(i => !i.productId && !i.productName)) {
      customAlert('لطفاً همه فیلدهای ضروری را پر کنید.');
      return;
    }
    if ((activeTab === 'create_warehouse_doc') && !invoiceWarehouseId) {
      customAlert('لطفاً انبار را مشخص کنید.');
      return;
    }
    if (storeSettings.requireWarehouse && !activeTab.includes('warehouse') && items.some(i => products.find(p => p.id === i.productId)?.type !== 'service') && !invoiceWarehouseId) {
      customAlert('لطفاً برای فاکتور فروش/خریدِ شامل کالا، انبار را انتخاب کنید.');
      return;
    }
    await saveInvoiceData();
  };

  const handleInvoicePreviewTrigger = () => {
    if (!customerId || items.length === 0 || items.some(i => !i.productId && !i.productName)) {
      customAlert('لطفاً همه فیلدهای ضروری را پر کنید.');
      return;
    }
    
    if ((activeTab === 'create_warehouse_doc') && !invoiceWarehouseId) {
      customAlert('لطفاً انبار را مشخص کنید.');
      return;
    }
    
    if (storeSettings.requireWarehouse && !activeTab.includes('warehouse') && items.some(i => products.find(p => p.id === i.productId)?.type !== 'service') && !invoiceWarehouseId) {
      customAlert('لطفاً برای فاکتور فروش/خریدِ شامل کالا، انبار را انتخاب کنید.');
      return;
    }

    const finalInvoiceNumber = invoiceMode === 'auto' ? 'تولید خودکار پس از ثبت نهایی' : invoiceNumber;
    const selectedCustomer = persons.find(p => p.id === customerId);

    const tempPayload = {
      invoiceNumber: finalInvoiceNumber,
      sellerInvoiceNumber: sellerInvoiceNumber || '',
      title: invoiceTitle || (invoiceType === 'sale' ? 'فاکتور فروش کالا' : 'فاکتور خرید کالا'),
      description: invoiceDescription,
      warehouseId: invoiceWarehouseId,
      type: invoiceType,
      currency: invoiceCurrency,
      date: typeof date.toDate === 'function' ? date.toDate().toISOString() : new Date(date).toISOString(),
      jalaliDate: new Date(date).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'),
      customerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'نامشخص',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '',
      customerAddress: selectedCustomer ? selectedCustomer.address : '',
      sourceInvoiceId, // Pass it correctly
      items: items.map(item => {
        const prod = products.find(p => p.id.toString() === String(item.productId));
        return {
          ...item,
          warehouseId: (storeSettings.requireWarehouse || activeTab.includes('warehouse')) && invoiceWarehouseId ? invoiceWarehouseId : item.warehouseId,
          productName: prod ? prod.name : item.productName || 'کالای سفارشی'
        };
      }),
      overallDiscountPercent,
      totalAmount: calculateFinalTotal(),
      paymentStatus: invoicePaymentStatus,
      paidAmount: Number(invoicePaidAmount) || 0
    };

    setPreviewInvoiceData(tempPayload);
  };

  const getProductStockInfo = (productId: string | number) => {
    let baseStock = 0;
    const product = products.find(p => p.id.toString() === productId.toString());
    if (product?.stock) {
      baseStock = Number(product.stock);
    }
    const defaultWhId = product?.warehouseId?.toString() || 'unknown';

    const info = {
       totalPhysical: baseStock,
       totalReserved: 0,
       totalAvailable: baseStock,
       warehouses: {} as Record<string, { physical: number, reserved: number, available: number }>
    };

    if (baseStock !== 0) {
       info.warehouses[defaultWhId] = { physical: baseStock, reserved: 0, available: baseStock };
    }

    const saleQtys: Record<string, number> = {};
    const remittedSaleQtys: Record<string, number> = {};
    const saleReturnQtys: Record<string, number> = {};

    invoices.forEach(inv => {
      if (!inv.items) return;
      inv.items.forEach((i: any) => {
        if (i.productId?.toString() === productId.toString()) {
           let q = Number(i.quantity) || 0;
           if (i.isSecondaryUnit && product?.unitRatio) {
              q = q * product.unitRatio;
           }

           const whId = (i.warehouseId || inv.warehouseId || defaultWhId).toString();
           if (!info.warehouses[whId]) {
              info.warehouses[whId] = { physical: 0, reserved: 0, available: 0 };
           }

           if (inv.type === 'warehouse_receipt') {
               info.totalPhysical += q;
               info.warehouses[whId].physical += q;
           } else if (inv.type === 'warehouse_remittance') {
               info.totalPhysical -= q;
               info.warehouses[whId].physical -= q;
               
                if (inv.sourceInvoiceId) {
                   const sourceInv = invoices.find(sinv => sinv.id.toString() === inv.sourceInvoiceId?.toString());
                   if (sourceInv && sourceInv.type === 'sale') {
                      remittedSaleQtys[whId] = (remittedSaleQtys[whId] || 0) + q;
                   }
               } else {
                  remittedSaleQtys[whId] = (remittedSaleQtys[whId] || 0) + q;
               }
           } else if (inv.type === 'sale') {
               saleQtys[whId] = (saleQtys[whId] || 0) + q;
           } else if (inv.type === 'sale_return') {
               saleReturnQtys[whId] = (saleReturnQtys[whId] || 0) + q;
           }
        }
      });
    });

    const totalSaleRaw = Object.values(saleQtys).reduce((a, b) => a + b, 0);
    const totalSaleReturn = Object.values(saleReturnQtys).reduce((a, b) => a + b, 0);
    const totalSale = Math.max(0, totalSaleRaw - totalSaleReturn);
    const totalRemittedForSale = Object.values(remittedSaleQtys).reduce((a, b) => a + b, 0);
    const globalUnremitted = Math.max(0, totalSale - totalRemittedForSale);

    if (globalUnremitted > 0) {
       if (!info.warehouses[defaultWhId]) info.warehouses[defaultWhId] = { physical: 0, reserved: 0, available: 0 };
       info.warehouses[defaultWhId].reserved += globalUnremitted;
       info.totalReserved += globalUnremitted;
    }

    Object.keys(info.warehouses).forEach(whId => {
       info.warehouses[whId].available = info.warehouses[whId].physical - info.warehouses[whId].reserved;
    });
    info.totalAvailable = info.totalPhysical - info.totalReserved;

    return info;
  };

  const formatProductStockDetails = (product: any) => {
    const info = getProductStockInfo(product.id);
    let details = '';
    const whCount = Object.keys(info.warehouses).filter(wid => info.warehouses[wid].available > 0).length;
    
    if (whCount > 0) {
      details = ` | ` + Object.keys(info.warehouses)
        .filter(wid => info.warehouses[wid].available > 0)
        .map(wid => {
           const wName = warehouses.find(w => w.id.toString() === wid)?.name || 'انبار نامشخص';
           return `${wName}: ${info.warehouses[wid].available}`;
        }).join('، ');
    }
    
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={info.totalAvailable > 0 ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
          موجودی در دسترس: {info.totalAvailable} {product.unit || ''}
        </span>
        {info.totalReserved > 0 && (
          <span className="text-amber-500 font-bold bg-amber-50 px-1 rounded">
            (رزرو شده: {info.totalReserved})
          </span>
        )}
        {(product.code || product.barcode) && (
          <span className="text-slate-400 font-mono text-[10px] pr-1 border-r border-slate-200">
            {product.code ? `کد: ${product.code}` : ''} {product.barcode ? `| بارکد: ${product.barcode}` : ''}
          </span>
        )}
        <span className="text-gray-400">{details}</span>
      </div>
    );
  };

  const calculateProductCurrentStock = (productId: string | number) => {
    return getProductStockInfo(productId).totalAvailable;
  };

  const calculatePersonBalance = (personId: string | number) => {
    const person = persons.find(p => p.id.toString() === personId.toString());
    if (!person) return { amount: 0, status: 'بی‌حساب' };
    
    let balance = 0;
    if (person.initialBalance && person.initialBalanceType !== 'settled') {
       balance += (person.initialBalanceType === 'debtor' ? person.initialBalance : -person.initialBalance);
    }
    
    invoices.filter(i => i.customerId?.toString() === personId.toString() && i.type !== 'warehouse_receipt' && i.type !== 'warehouse_remittance' && i.type !== 'proforma').forEach(inv => {
        const amount = (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency);
        if (inv.type === 'sale') balance += amount;
        else if (inv.type === 'purchase') balance -= amount;
        else if (inv.type === 'sale_return') balance -= amount;
        else if (inv.type === 'purchase_return') balance += amount;
    });

    transactions.filter(t => t.personId?.toString() === personId.toString() && t.method !== 'check').forEach(t => {
        if (t.type === 'receive') balance -= (t.amount || 0);
        else if (t.type === 'pay') balance += (t.amount || 0);
        else if (t.type === 'salary') balance -= (t.amount || 0);
    });

    // Active/Pending Issued Checks (Supplier paid by check -> their balance goes UP because we owe them less)
    // Exclude 'cashed' because cashed checks auto-generate a 'pay' transaction that is already counted above
    issuedChecks.filter(c => c.payeeId?.toString() === personId.toString() && c.status !== 'cancelled' && c.status !== 'bounced' && c.status !== 'cashed').forEach(c => {
        balance += (c.amount || 0);
    });

    // Active/Pending Received Checks (Customer pays by check -> their balance goes DOWN because they owe us less)
    // Exclude 'cashed' because cashed checks auto-generate a 'receive' transaction that is already counted above
    receivedChecks.filter(c => c.payerId?.toString() === personId.toString() && c.status !== 'returned' && c.status !== 'bounced' && c.status !== 'cashed').forEach(c => {
        balance -= (c.amount || 0);
    });
    
    if (balance > 0) return { amount: balance, status: 'بدهکار', color: 'text-rose-600', bg: 'bg-rose-50' };
    if (balance < 0) return { amount: Math.abs(balance), status: 'بستانکار', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    return { amount: 0, status: 'بی‌حساب', color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  const renderPersonInfoBox = (personId: string | number, themeClass: string = 'bg-gray-50 border-gray-100 text-gray-600') => {
    const person = persons.find(p => p.id?.toString() === personId?.toString());
    if (!person) return null;
    const bal = calculatePersonBalance(personId);
    return (
      <div className={`mt-2 text-xs font-bold w-full ${themeClass} border rounded-lg p-3 flex flex-col gap-2`}>
        {(person.phone || person.address) && (
          <div className="flex flex-col gap-1.5 pb-2 border-b border-black/5">
            {person.phone && (
              <div className="flex items-center gap-1.5 opacity-90 font-medium">
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr" className="text-right w-full">{person.phone}</span>
              </div>
            )}
            {person.address && (
              <div className="flex gap-1.5 opacity-90 font-medium leading-relaxed">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{person.address}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between items-center text-[11px] sm:text-xs">
          <span className="opacity-80">مانده حساب فعلی:</span>
          <span className={`${bal.bg || 'bg-white'} ${bal.color || 'text-slate-800'} px-2.5 py-0.5 rounded shadow-sm border border-black/5`}>
            {bal.amount === 0 ? 'صفر (بی‌حساب)' : `${formatCurrency(bal.amount)} ${storeSettings.currency || 'تومان'} (${bal.status})`}
          </span>
        </div>
      </div>
    );
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal();
    const final = subtotal * (1 - (overallDiscountPercent / 100));
    return final > 0 ? final : 0;
  };

  const invoiceOriginalTotal = () => {
    return items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
  };

  const invoiceTotalDiscount = () => {
    const original = invoiceOriginalTotal();
    const final = calculateFinalTotal();
    return Math.max(0, original - final);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const toPersianDigits = (str: string | number | undefined | null) => {
    if (str === null || str === undefined) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/\d/g, x => persianDigits[parseInt(x, 10)]);
  };

  const currencyLabel = (activeTab === 'create_sale' || activeTab === 'create_purchase' || activeTab === 'create_warehouse_doc' || activeTab === 'create_sale_return' || activeTab === 'create_purchase_return') ? invoiceCurrency : storeSettings.currency;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const openPayslip = (tx: any) => {
    let parsed = null;
    try {
      parsed = tx.description ? JSON.parse(tx.description) : null;
    } catch (e) {
      console.error(e);
    }
    const employeeName = persons.find(p => p.id.toString() === tx.personId?.toString())?.name || 'کارمند';
    setViewingPayslip({
      ...tx,
      parsed,
      computedPersonName: employeeName
    });
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

        if (latestGithubSha) {
          localStorage.setItem('localCommitSha', latestGithubSha);
          setLatestCommits([]);
        }
        if (latestVersion) {
           localStorage.setItem('localAppVersion', latestVersion);
        }

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




  if (requiresInitSetup && user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-10 pb-10" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-xl w-full border border-gray-100">
          <div className="bg-gradient-to-l from-indigo-600 to-indigo-800 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mx-24 -mt-24 pointer-events-none"></div>
            <h1 className="text-3xl font-black mb-2 relative z-10">خوش آمدید!</h1>
            <p className="text-indigo-100 font-medium relative z-10">تنظیمات اولیه سیستم خود را تکمیل کنید</p>
          </div>
          <div className="p-8">
            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm font-bold flex items-start gap-3 mb-8 border border-amber-100">
               <AlertTriangle className="w-5 h-5 shrink-0" />
               <p className="leading-loose">توجه داشته باشید که <strong>نوع تقویم</strong> و <strong>واحد پولی</strong> پس از ثبت برای حفظ یکپارچگی پایگاه داده و نرم‌افزار <strong>غیرقابل تغییر</strong> خواهند بود.</p>
            </div>
            
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-sm font-extrabold text-gray-800 mb-3">نام فروشگاه یا مجموعه تجاری</label>
                <input
                  type="text"
                  required
                  value={settingsForm.storeName}
                  onChange={(e) => setSettingsForm({...settingsForm, storeName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 transition-colors font-bold text-gray-900"
                  placeholder="وارد کنید..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-extrabold text-gray-800 mb-3">واحد پولی سیستم</label>
                <select
                  value={settingsForm.currency}
                  onChange={(e) => setSettingsForm({...settingsForm, currency: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 transition-colors font-bold text-gray-900"
                >
                  <option value="ریال">ریال</option>
                  <option value="تومان">تومان</option>
                  <option value="دلار">دلار (USD)</option>
                  <option value="افغانی">افغانی</option>
                  <option value="درهم">درهم (AED)</option>
                  <option value="یورو">یورو (EUR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-gray-800 mb-3">تاریخ و تقویم سیستم</label>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     type="button" 
                     onClick={() => setSettingsForm({...settingsForm, calendarType: 'jalali'})}
                     className={`py-4 px-2 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${settingsForm.calendarType !== 'gregorian' ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                   >
                     تقویم شمسی (جلالی)
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setSettingsForm({...settingsForm, calendarType: 'gregorian'})}
                     className={`py-4 px-2 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${settingsForm.calendarType === 'gregorian' ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                   >
                     تقویم میلادی
                   </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-gray-800 mb-3">فونت سیستم</label>
                <select
                  value={settingsForm.fontFamily || 'Vazirmatn'}
                  onChange={(e) => setSettingsForm({...settingsForm, fontFamily: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 transition-colors font-bold text-gray-900"
                >
                  <option value="Vazirmatn">وزیرمتن (Vazirmatn)</option>
                  <option value="IRANYekanXFaNum">ایران یکان (IRANYekanX)</option>
                </select>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submittingSettings}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-lg transition-colors flex items-center justify-center gap-2"
                >
                  {submittingSettings ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  ثبت نهایی و ورود به سیستم
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
        case 'create_warehouse_doc': {
           const isReceipt = ['purchase_invoice', 'sales_return', 'transfer_in'].includes(warehouseOperationType);
           if (warehouseWizardStep === 1) {
              return (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-xl mx-auto">
                       <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                         {isReceipt ? <Plus className="w-6 h-6 text-emerald-600" /> : <ShoppingCart className="w-6 h-6 text-indigo-600" />}
                         رسید / حواله پایانه انبار - اطلاعات اولیه
                       </h2>
                       <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب انبار</label>
                            <select value={invoiceWarehouseId} onChange={(e) => setInvoiceWarehouseId(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-base font-bold">
                               <option value="">-- انتخاب انبار --</option>
                               {warehouses.filter(w => w.isActive !== false).map((v) => (
                                 <option key={v.id} value={v.id}>{v.name}</option>
                               ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">نوع حواله / رسید</label>
                            <select value={warehouseOperationType} onChange={(e) => {
                               setWarehouseOperationType(e.target.value);
                               if (['purchase_invoice', 'sales_return', 'transfer_in'].includes(e.target.value)) {
                                  setInvoiceType('warehouse_receipt');
                                  setInvoiceTitle('رسید انبار (ورود)');
                               } else {
                                  setInvoiceType('warehouse_remittance');
                                  setInvoiceTitle('حواله انبار (خروج)');
                               }
                            }} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-base font-bold">
                               <optgroup label="ورود به انبار (رسید)">
                                  <option value="purchase_invoice">رسید از فاکتور خرید</option>
                                  <option value="sales_return">رسید از برگشت فروش</option>
                                  <option value="transfer_in">انتقال به این انبار (سایر ورود)</option>
                               </optgroup>
                               <optgroup label="خروج از انبار (حواله)">
                                  <option value="sales_invoice">حواله از فاکتور فروش</option>
                                  <option value="purchase_return">حواله از برگشت خرید</option>
                                  <option value="transfer_out">انتقال از این انبار (سایر خروج)</option>
                               </optgroup>
                            </select>
                          </div>
                          <div className="pt-4 border-t border-gray-100 flex justify-end">
                             <button onClick={() => {
                               if(!invoiceWarehouseId) {
                                 customAlert('لطفاً ابتدا انبار را مشخص کنید.');
                                 return;
                               }
                               setWarehouseWizardStep(2);
                             }} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">
                                مرحله بعد
                             </button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              );
           }
           if (warehouseWizardStep === 2) {
              let expectedType = '';
              if (isReceipt) {
                 if (warehouseOperationType === 'purchase_invoice') expectedType = 'purchase';
                 if (warehouseOperationType === 'sales_return') expectedType = 'sale'; // returns use same invoice type often? Actually, let's keep it simple: filter by type
              } else {
                 if (warehouseOperationType === 'sales_invoice') expectedType = 'sale';
                 if (warehouseOperationType === 'purchase_return') expectedType = 'purchase';
              }

              const relevantInvoices = expectedType ? invoices.filter(i => i.type === expectedType && hasRemainingWarehouseItems(i.id)) : [];

              return (
                 <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-right font-sans">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
                       <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                         {isReceipt ? <Plus className="w-6 h-6 text-emerald-600" /> : <ShoppingCart className="w-6 h-6 text-indigo-600" />}
                         {invoiceTitle} - انتخاب سند مرجع
                       </h2>
                       <div className="space-y-6">
                          {!['transfer_in', 'transfer_out'].includes(warehouseOperationType) ? (
                            <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب فاکتور مرتبط</label>
                               <SearchableSelect
                                 options={relevantInvoices.map(i => ({
                                   value: i.id,
                                   label: `فاکتور ${i.invoiceMode === 'manual' ? '(دستی) ' : ''}#${i.invoiceNumber}`,
                                   subLabel: `مبلغ: ${formatCurrency(i.totalAmount || 0)} ${i.currency || 'تومان'} - مشتری: ${persons.find(p => p.id.toString() === i.customerId?.toString())?.name || 'نامشخص'}`,
                                 }))}
                                 value={String(sourceInvoiceId || '')}
                                 onChange={(val) => setSourceInvoiceId(val)}
                                 placeholder="-- فاکتور مورد نظر را جستجو و انتخاب کنید --"
                                 searchPlaceholder="جستجو در فاکتورها..."
                               />
                               <div className="mt-4 bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm font-bold text-amber-800 flex items-start gap-2">
                                  <input type="checkbox" id="deletePrev" checked={deletePreviousDocs} onChange={e => setDeletePreviousDocs(e.target.checked)} className="mt-1 w-4 h-4 cursor-pointer" />
                                  <label htmlFor="deletePrev" className="cursor-pointer">
                                     حذف حواله‌های انبار قبلی برای این فاکتور (تنظیم مجدد رسید/حواله)
                                  </label>
                               </div>
                            </div>
                          ) : (
                            <div className="bg-indigo-50 p-6 rounded-xl text-indigo-800 text-center font-bold">
                               صدور سند انتقال (مستقیم)
                            </div>
                          )}

                          <div className="pt-4 border-t border-gray-100 flex justify-between">
                             <button onClick={() => setWarehouseWizardStep(1)} className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold transition-colors">
                                مرحله قبل
                             </button>
                             <button onClick={() => {
                                if (!['transfer_in', 'transfer_out'].includes(warehouseOperationType) && !sourceInvoiceId) {
                                  customAlert('لطفاً فاکتور مرجع را انتخاب کنید');
                                  return;
                                }
                                if (!['transfer_in', 'transfer_out'].includes(warehouseOperationType)) {
                                    const sourceInv = invoices.find(i => i.id.toString() === sourceInvoiceId?.toString());
                                    if (sourceInv) {
                                        if (isReceipt) {
                                            setInvoiceDescription(`رسید ورود به انبار - فاکتور مرجع # ${sourceInv.invoiceNumber}`);
                                        } else {
                                            setInvoiceDescription(`حواله خروج از انبار - فاکتور مرجع # ${sourceInv.invoiceNumber}`);
                                        }
                                        if (sourceInv.customerId) setCustomerId(sourceInv.customerId);
                                        if (sourceInv.currency) {
                                            setInvoiceCurrency(sourceInv.currency);
                                            setExchangeRate(sourceInv.exchangeRate || 1);
                                            setExchangeRateInput(String(sourceInv.exchangeRate || 1));
                                        }
                                        
                                        let processedAmounts = {};
                                        if (deletePreviousDocs) {
                                            // Delete past docs
                                            const pastDocs = invoices.filter(i => 
                                              i.sourceInvoiceId?.toString() === sourceInvoiceId?.toString() && 
                                              (isReceipt ? i.type === 'warehouse_receipt' : i.type === 'warehouse_remittance')
                                            );
                                            if (pastDocs.length > 0) {
                                              pastDocs.forEach(d => {
                                                  if(typeof deleteInvoice !== 'undefined') deleteInvoice(d.id.toString());
                                              });
                                              setInvoices(prev => prev.filter(p => !pastDocs.find(pd => pd.id === p.id)));
                                              if(typeof fetchInvoices !== 'undefined') fetchInvoices();
                                            }
                                        } else {
                                            const pastDocs = invoices.filter(i => 
                                              i.sourceInvoiceId?.toString() === sourceInvoiceId?.toString() && 
                                              (isReceipt ? i.type === 'warehouse_receipt' : i.type === 'warehouse_remittance')
                                            );
                                            pastDocs.forEach(doc => {
                                              if (doc.items) {
                                                doc.items.forEach((rt) => {
                                                   const key = String(rt.productId || rt.productName || '');
                                                   if (!key) return;
                                                   if (!processedAmounts[key]) processedAmounts[key] = 0;
                                                   processedAmounts[key] += Number(rt.quantity) || 0;
                                                });
                                              }
                                            });
                                        }
                                        
                                        const remainingItems = sourceInv.items.map((it) => {
                                          const key = String(it.productId || it.productName || '');
                                          const processed = key ? (processedAmounts[key] || 0) : 0;
                                          const remaining = (Number(it.quantity) || 0) - processed;
                                          return {
                                            ...it,
                                            id: generateId(),
                                            maxQuantity: remaining > 0 ? remaining : 0,
                                            quantity: remaining > 0 ? remaining : 0,
                                            warehouseId: invoiceWarehouseId,
                                          };
                                        }).filter((it) => it.quantity > 0);

                                        setItems(remainingItems);
                                    }
                                } else {
                                   setSourceInvoiceId('');
                                   setItems([]);
                                }
                                setWarehouseWizardStep(3);
                             }} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">
                                تایید و تهیه فرم
                             </button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              );
           }
           if (warehouseWizardStep === 3) {
              return (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                       <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                         {isReceipt ? <Plus className="w-6 h-6 text-emerald-600" /> : <ShoppingCart className="w-6 h-6 text-indigo-600" />}
                         {invoiceTitle} - صدور نهایی
                       </h2>
                       <button onClick={() => setWarehouseWizardStep(2)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 text-sm">مرحله قبل</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{isReceipt ? 'شماره رسید' : 'شماره حواله'}</label>
                        <div className="flex gap-2">
                            <select value={invoiceMode} onChange={(e) => setInvoiceMode(e.target.value as 'auto' | 'manual')} className="p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm">
                              <option value="auto">خودکار</option>
                              <option value="manual">دستی</option>
                            </select>
                            {invoiceMode === 'manual' && (
                              <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="flex-1 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-left" dir="ltr" placeholder="شماره..." />
                            )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500 animate-pulse"/> {isReceipt ? 'تاریخ رسید' : 'تاریخ حواله'}</label>
                        <div className="relative">
                          <DatePicker
                              value={date}
                              onChange={setDate}
                              calendar={storeSettings?.calendarType === 'gregorian' ? undefined : persian}
                              locale={storeSettings?.calendarType === 'gregorian' ? undefined : persian_fa}
                              calendarPosition="bottom-right"
                              inputClass="w-full pl-11 pr-4 p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-indigo-950 font-sans font-black text-center transition-all cursor-pointer shadow-sm text-sm"
                              containerClassName="w-full"
                          />
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500">
                            <Calendar className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><User className="w-4 h-4"/> نام تامین کننده یا خریدار</label>
                        <SearchableSelect 
                          options={persons.map(p => ({
                            value: p.id,
                            label: p.alias || p.name,
                            subLabel: p.phone || undefined,
                            badge: getRoleName(p.role)
                          }))}
                          value={String(customerId || '')}
                          onChange={val => setCustomerId(val)}
                          placeholder="-- انتخاب کنید --"
                          searchPlaceholder="جستجوی شخص..."
                        />
                        {customerId && renderPersonInfoBox(customerId, 'bg-gray-50 border-gray-100 text-gray-600')}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">انبار انتخابی</label>
                        <div className="w-full p-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 text-center">
                           {warehouses.find(w => w.id?.toString() === invoiceWarehouseId?.toString())?.name || 'نامشخص'}
                        </div>
                      </div>
                      <div className="lg:col-span-4 mt-2">
                         <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><FileText className="w-4 h-4 text-emerald-500"/> توضیحات</label>
                         <input
                             type="text"
                             value={invoiceDescription || ''}
                             onChange={(e) => setInvoiceDescription(e.target.value)}
                             className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                             placeholder="توضیحات مربوط به این سند..."
                         />
                      </div>
                    </div>
                  </div>
    
                  {/* Items List */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col justify-between items-center gap-4">
                        <div className="w-full flex justify-between">
                            <h3 className="font-extrabold text-gray-900 flex items-center gap-2 whitespace-nowrap"><Package className="w-5 h-5 text-indigo-600"/> اقلام سند</h3>
                            <button onClick={handleAddItem} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 shadow-sm rounded-xl font-bold hover:bg-gray-100 flex items-center gap-2 transition-colors whitespace-nowrap">
                              <Plus className="w-4 h-4" /> افزودن سطر دستی
                            </button>
                        </div>
                        <div className="w-full relative z-10 flex flex-col md:flex-row gap-2">
                             <FastBarcodeScanner onScan={handleFastBarcodeScan} />
                             <div className="flex-[2]">
                               <SearchableSelect 
                                 options={products.map(p => ({
                                   value: p.id,
                                   label: p.name,
                                   subLabel: formatProductStockDetails(p),
                                   badge: p.type === 'service' ? 'خدمات' : 'کالا',
                                   searchStr: `${p.code || ''} ${p.barcode || ''}`
                                 }))}
                                 value=""
                                 onChange={(val) => handleFastAddProduct(String(val))}
                                 placeholder="🔎 جستجو و افزودن سریع کالا به لیست..."
                                 searchPlaceholder="جستجوی کالا..."
                               />
                             </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right min-w-[800px]">
                          <thead>
                            <tr className="bg-white text-sm text-gray-500 border-b border-gray-100">
                              <th className="p-4 font-bold w-12 text-center">ردیف</th>
                              <th className="p-4 font-bold min-w-[200px] w-[50%] text-right">شرح کالا</th>
                              <th className="p-4 font-bold w-32 text-center">تعداد</th>
                              <th className="p-4 font-bold w-32 text-center border-r border-gray-100">واحد</th>
                              <th className="p-4 font-bold w-12 text-center border-r border-gray-100">حذف</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {items.length === 0 && (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400 font-bold text-sm bg-gray-50/50">
                                  <div className="flex flex-col items-center justify-center space-y-2">
                                    <Package className="w-8 h-8 text-indigo-200" />
                                    <span>هیچ کالایی به این سند اضافه نشده است.</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {items.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 text-center font-bold text-gray-400">{index + 1}</td>
                                  <td className="p-4">
                                      {item.productId ? (
                                        <div className="font-extrabold text-slate-800 flex flex-col gap-1">
                                          <span>{item.productName}</span>
                                          {(() => {
                                            const p = products.find(prod => prod.id === item.productId);
                                            return <span className="text-xs text-slate-400 font-normal flex gap-2">کالای سیستمی {p?.code ? <span className="font-mono bg-slate-100 px-1 rounded">کد: {p.code}</span> : ''} {p?.barcode ? <span className="font-mono bg-slate-100 px-1 rounded">بارکد: {p.barcode}</span> : ''}</span>;
                                          })()}
                                        </div>
                                      ) : (
                                        <input
                                          type="text"
                                          placeholder="نام کالا دلخواه..."
                                          value={item.productName}
                                          onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                                        />
                                      )}
                                  </td>
                                  <td className="p-4">
                                      <div className="flex flex-col gap-1.5">
                                        <input type="number" min="0" step="any" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans text-center font-bold text-indigo-900 outline-none" dir="ltr" />
                                        {isReceipt && typeof item.maxQuantity !== 'undefined' && item.maxQuantity > 0 && (
                                           <span className="text-[10px] text-gray-500 text-center font-bold mt-1">
                                              حداکثر סقף مجاز: {item.maxQuantity}
                                           </span>
                                        )}
                                      </div>
                                  </td>
                                  <td className="p-4 text-center">
                                      {(() => {
                                        const product = item.productId ? products.find((p) => p.id.toString() === String(item.productId)) : null;
                                        const hasSecondary = product?.secondaryUnit;
                                        return (
                                          <div className="flex flex-col gap-1.5">
                                            {hasSecondary ? (
                                              <select value={item.isSecondaryUnit ? "true" : "false"} onChange={(e) => handleItemChange(item.id, 'isSecondaryUnit', e.target.value === 'true')} className="w-full p-2 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-slate-400">
                                                <option value="false">{product.unit} (اصلی)</option>
                                                <option value="true">{product.secondaryUnit} (فرعی)</option>
                                              </select>
                                            ) : product ? (
                                              <div className="w-full p-2 text-center text-slate-600 font-bold bg-slate-50 border border-slate-100 rounded-xl text-sm shadow-sm">
                                                {product.unit || '-'}
                                              </div>
                                            ) : (
                                              <input
                                                type="text"
                                                value={item.selectedUnit || ''}
                                                onChange={(e) => handleItemChange(item.id, 'selectedUnit', e.target.value)}
                                                placeholder="واحد..."
                                                className="w-full p-2 text-center text-slate-700 font-bold bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                              />
                                            )}
                                          </div>
                                        );
                                      })()}
                                  </td>
                                  <td className="p-4 text-center">
                                      <button onClick={() => handleRemoveItem(item.id)} className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                                        <Trash2 className="w-5 h-5"/>
                                      </button>
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end">
                       <button onClick={handleInvoicePreviewTrigger} disabled={submitting || items.length === 0} className="px-10 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-sm focus:ring-4 focus:ring-indigo-500/20">
                         {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-6 h-6" />}
                         {isReceipt ? 'صدور نهایی رسید انبار' : 'صدور نهایی حواله انبار'}
                       </button>
                    </div>
                  </div>
                 </motion.div>
              );
           }
        }
        case 'create_purchase_return':
           return (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-right font-sans">
              {hasDraft && (
                 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center text-amber-800 shadow-sm col-span-full w-full">
                    <span className="font-bold flex items-center gap-2.5 mb-3 md:mb-0"><History className="w-5 h-5 text-amber-500" /> یک فاکتور ناتمام و ثبت نشده بازیابی شد. مایلید از آن استفاده کنید یا فاکتور جدیدی آغاز کنید؟</span>
                    <div className="flex gap-2">
                       <button onClick={restoreDraft} className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-sm font-bold transition-colors">بازیابی فاکتور ناتمام</button>
                       <button onClick={clearDraft} className="px-4 py-2.5 bg-white border border-amber-200 hover:bg-amber-50 rounded-xl text-sm font-bold transition-colors">پاک کردن و فاکتور جدید</button>
                    </div>
                 </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-700 px-5 py-4 rounded-xl flex items-center gap-3 border border-emerald-100 font-bold shadow-sm">
                  <CheckCircle className="w-5 h-5" />
                  {successMsg}
                </div>
              )}
              {editingInvoiceId && (
                <div className="bg-amber-50 text-amber-900 px-5 py-4 rounded-2xl flex items-center justify-between gap-3 border border-amber-200/60 font-bold shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>شما در حال ویرایش فاکتور برگشت از خرید پیش‌نویس/ثبت‌شده شماره <strong className="text-amber-950">#{toPersianDigits(invoiceNumber)}</strong> هستید. تغییرات جدید جایگزین نسخه قبلی خواهد شد.</span>
                  </div>
                  <button onClick={clearDraft} className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer">انصراف از ویرایش</button>
                </div>
              )}

              {/* Header Info */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-emerald-50">
                <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <span className="bg-emerald-100/50 p-2.5 rounded-xl text-emerald-600">
                     <Plus className="w-6 h-6" />
                  </span>
                  {invoiceTitle}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">شماره فاکتور برگشت از خرید</label>
                    <div className="flex gap-2">
                        <select value={invoiceMode} onChange={(e) => setInvoiceMode(e.target.value as 'auto' | 'manual')} className="p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-sm font-bold text-emerald-900 outline-none">
                          <option value="auto">تولید خودکار</option>
                          <option value="manual">ورود دستی</option>
                        </select>
                        {invoiceMode === 'manual' && (
                          <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="flex-1 p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold text-slate-800 outline-none bg-emerald-50/20" dir="ltr" placeholder="شماره فاکتور سیستم تامین..." />
                        )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-emerald-500"/> عنوان فاکتور</label>
                    <input type="text" value={invoiceTitle} onChange={(e) => setInvoiceTitle(e.target.value)} className="w-full p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 outline-none bg-emerald-50/20" placeholder="عنوانی برای فاکتور وارد کنید..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-500"/> تاریخ صدور فاکتور</label>
                    <div className="relative">
                      <DatePicker
                          value={date}
                          onChange={setDate}
                          calendar={storeSettings?.calendarType === 'gregorian' ? undefined : persian}
                          locale={storeSettings?.calendarType === 'gregorian' ? undefined : persian_fa}
                          calendarPosition="bottom-right"
                          inputClass="w-full pl-11 pr-4 p-3 bg-emerald-50/30 hover:bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-emerald-950 font-sans font-black text-center transition-all cursor-pointer outline-none text-sm"
                          containerClassName="w-full"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><User className="w-4 h-4 text-emerald-500"/> تامین کننده (طرف حساب)</label>
                    <div className="border border-emerald-100 rounded-xl bg-emerald-50/30 focus-within:ring-2 focus-within:ring-emerald-500 transition-colors">
                      <SearchableSelect 
                        options={persons.map(p => ({
                          value: p.id,
                          label: p.alias || p.name,
                          subLabel: p.phone || undefined,
                          badge: getRoleName(p.role)
                        }))}
                        value={customerId}
                        onChange={val => setCustomerId(val)}
                        placeholder="-- جستجوی تامین کننده --"
                        searchPlaceholder="جستجوی شخص یا شرکت..."
                      />
                    </div>
                    {customerId && renderPersonInfoBox(customerId, 'bg-emerald-50/50 border-emerald-100/50 text-slate-600')}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Wallet className="w-4 h-4 text-emerald-500"/> وضعیت پرداخت</label>
                    <select value={invoicePaymentStatus} onChange={(e) => {
                      const val = e.target.value as any;
                      setInvoicePaymentStatus(val);
                      if (val === 'paid') setInvoicePaidAmount(calculateFinalTotal());
                      else if (val === 'unpaid') setInvoicePaidAmount(0);
                    }} className="w-full p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-sm font-bold text-emerald-900 outline-none">
                      <option value="unpaid">پرداخت نشده</option>
                      <option value="partial">تسویه بخشی (علی‌الحساب)</option>
                      <option value="paid">تسویه کامل</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-emerald-500"/> مبلغ پرداختی</label>
                    <div className="relative">
                       <input type="number" 
                         value={invoicePaidAmount} 
                         onChange={(e) => {
                             setInvoicePaidAmount(Number(e.target.value));
                             if (Number(e.target.value) >= calculateFinalTotal()) setInvoicePaymentStatus('paid');
                             else if (Number(e.target.value) > 0) setInvoicePaymentStatus('partial');
                             else setInvoicePaymentStatus('unpaid');
                         }} 
                         disabled={invoicePaymentStatus === 'unpaid'}
                         className="w-full p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold text-slate-800 outline-none bg-emerald-50/20 disabled:opacity-50" 
                         dir="ltr" 
                         placeholder="0" 
                       />
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-xs select-none">
                         {invoiceCurrency}
                       </div>
                    </div>
                  </div>
                  {storeSettings.requireWarehouse && (
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Box className="w-4 h-4 text-emerald-500"/> انبار خروج کالا</label>
                      <select value={invoiceWarehouseId} onChange={(e) => setInvoiceWarehouseId(e.target.value)} className="w-full p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-base font-bold text-emerald-900 outline-none">
                         <option value="">-- لطفاً انبار را انتخاب کنید --</option>
                         {warehouses.filter(w => w.isActive !== false).map((v) => (
                           <option key={v.id} value={v.id}>{v.name}</option>
                         ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-emerald-50 overflow-hidden" data-invoice-flow="purchase-return">
                <div className="p-5 bg-emerald-50/30 border-b border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-extrabold text-slate-800 flex items-center gap-2 whitespace-nowrap"><Package className="w-5 h-5 text-emerald-600"/> لیست اقلام برگشت از خرید</h3>
                    <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-2 max-w-2xl">
                      <FastBarcodeScanner onScan={handleFastBarcodeScan} />
                      <div className="flex-[2] relative z-10 w-full">
                        <div className="border hover:border-emerald-300 rounded-xl bg-white shadow-sm transition-colors relative">
                          <SearchableSelect 
                            options={products.map(p => ({
                              value: p.id,
                              label: p.name,
                              subLabel: (p.code || p.barcode) ? `کد: ${p.code || '-'} | بارکد: ${p.barcode || '-'}` : undefined,
                              badge: p.type === 'service' ? 'خدمات' : 'کالا',
                              searchStr: `${p.code || ''} ${p.barcode || ''}`
                            }))}
                            value=""
                            onChange={(val) => handleFastAddProduct(String(val))}
                            placeholder="جستجو و افزودن سریع کالا به لیست خرید (نام، کد، بارکد)..."
                            searchPlaceholder="جستجوی کالای خریداری شده..."
                          />
                        </div>
                      </div>
                      <button onClick={() => setIsScannerOpen(true)} className="p-[11px] bg-white border border-emerald-200 text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-50 transition-colors focus:ring-2 focus:ring-emerald-500" title="اسکن بارکد با دوربین">
                        <ScanLine className="w-5 h-5"/>
                      </button>
                    </div>
                    <button onClick={() => setIsProductModalOpen(true)} className="px-5 py-3 bg-white border border-emerald-200 text-emerald-700 shadow-sm rounded-xl font-bold hover:bg-emerald-50 flex items-center gap-2 transition-colors whitespace-nowrap outline-none focus:ring-2 focus:ring-emerald-500">
                      <Plus className="w-4 h-4" /> تعریف کالا / خدمات جدید
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[1000px]">
                      <thead>
                        <tr className="bg-white text-xs font-black text-slate-400 border-b border-emerald-50">
                          <th className="p-5 w-12 text-center">ردیف</th>
                          <th className="p-5 min-w-[200px] w-[30%] text-right">شرح کالا / خدمات</th>
                          <th className="p-5 w-32 text-center border-r border-emerald-50/50">تعداد</th>
                          <th className="p-5 w-32 text-center border-r border-emerald-50/50">واحد</th>
                          <th className="p-5 w-48 border-r border-emerald-50/50 text-left text-emerald-800">فی ({invoiceCurrency})</th>
                          <th className="p-5 w-28 text-center border-r border-emerald-50/50">تخفیف %</th>
                          <th className="p-5 w-48 border-r border-emerald-50/50 text-left text-emerald-800">مبلغ کل ({invoiceCurrency})</th>
                          <th className="p-5 w-12 text-center border-r border-emerald-50/50">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50/50">
                        {items.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-emerald-400 font-bold text-sm bg-emerald-50/30">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <Box className="w-8 h-8 text-emerald-200" />
                                <span>هیچ کالا یا خدماتی به این سند اضافه نشده است. لطفاً جستجو کرده یا محصول جدیدی تعریف کنید.</span>
                              </div>
                            </td>
                          </tr>
                        )}
                        {items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors" data-row-type="purchase-return-row">
                              <td className="p-5 text-center font-bold text-slate-300">{index + 1}</td>
                              <td className="p-5">
                                  {item.productId ? (
                                    <div className="font-black text-slate-800 flex flex-col gap-1">
                                      <span>{item.productName}</span>
                                      {(() => {
                                         const p = products.find(prod => prod.id === item.productId);
                                         return (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 self-start px-2 py-0.5 rounded-md">کالای سیستمی</span>
                                                {(p?.code || p?.barcode) && (
                                                    <span className="text-[10px] text-emerald-500 font-mono flex gap-2">
                                                        {p.code ? <span>کد: {p.code}</span> : null}
                                                        {p.barcode ? <span>بارکد: {p.barcode}</span> : null}
                                                    </span>
                                                )}
                                            </div>
                                         );
                                      })()}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder="شرح دلخواه وارد کنید..."
                                      value={item.productName}
                                      onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                      className="w-full p-2.5 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-800 outline-none"
                                    />
                                  )}
                              </td>
                              <td className="p-5">
                                  <div className="flex flex-col gap-1.5">
                                    <input type="number" min="0" step="any" value={item.quantity} onChange={(e: any) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full p-2.5 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-sans text-center font-black text-slate-800 outline-none" dir="ltr" />
                                  </div>
                              </td>
                              <td className="p-5">
                                  {(() => {
                                    const product = item.productId ? products.find((p) => p.id.toString() === String(item.productId)) : null;
                                    const hasSecondary = product?.secondaryUnit;
                                    return (
                                      <div className="flex flex-col gap-1.5">
                                        {hasSecondary ? (
                                          <select value={item.isSecondaryUnit ? "true" : "false"} onChange={(e) => handleItemChange(item.id, 'isSecondaryUnit', e.target.value === 'true')} className="w-full p-2 text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-100/50 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-emerald-400">
                                            <option value="false">{product.unit} (اصلی)</option>
                                            <option value="true">{product.secondaryUnit} (فرعی)</option>
                                          </select>
                                        ) : product ? (
                                          <div className="w-full p-2 text-center text-emerald-700 font-bold bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm shadow-sm">
                                            {product.unit || '-'}
                                          </div>
                                        ) : (
                                          <input
                                            type="text"
                                            value={item.selectedUnit || ''}
                                            onChange={(e) => handleItemChange(item.id, 'selectedUnit', e.target.value)}
                                            placeholder="واحد..."
                                            className="w-full p-2 text-center text-emerald-800 font-bold bg-white border border-emerald-200/50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                          />
                                        )}
                                      </div>
                                    );
                                  })()}
                              </td>
                              <td className="p-5">
                                  <CurrencyInput currencyLabel={storeSettings?.currency}
                                    value={item.unitPrice} 
                                    onChange={(e: any) => handleItemChange(item.id, 'unitPrice', e.target.value)} 
                                    className="w-full p-2.5 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-sans text-left font-black text-emerald-900 text-sm outline-none" 
                                  />
                              </td>
                              <td className="p-5">
                                  <input type="number" min="0" max="100" step="any" value={item.discountPercent} onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)} className="w-full p-2.5 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-center text-rose-600 font-black outline-none" dir="ltr" />
                              </td>
                              <td className="p-5 font-black text-left font-sans text-emerald-950" dir="ltr">
                                  {formatCurrency(item.totalPrice)}
                              </td>
                              <td className="p-5 text-center">
                                  <button onClick={() => handleRemoveItem(item.id)} className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors outline-none focus:ring-2 focus:ring-rose-500">
                                    <Trash2 className="w-5 h-5"/>
                                  </button>
                              </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-16 text-center">
                                <div className="flex flex-col items-center justify-center gap-4 text-emerald-600/50">
                                  <div className="bg-emerald-50 p-6 rounded-full border-2 border-emerald-100/50">
                                    <Package className="w-12 h-12" />
                                  </div>
                                  <p className="font-extrabold text-lg text-slate-700">سبد خرید خالی است</p>
                                  <p className="text-sm font-bold text-slate-400">یک کالا از نوار جستجو انتخاب کنید یا سطر جدید بسازید.</p>
                                </div>
                              </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
              </div>

              {/* Totals & Submit */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-emerald-50 overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-10">
                      <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-3 ml-1">تخفیف روی کل فاکتور (%)</label>
                            <input type="number" min="0" max="100" value={overallDiscountPercent} onChange={(e) => setOverallDiscountPercent(Number(e.target.value))} className="w-48 p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold text-rose-600 outline-none" dir="ltr" />
                            <p className="mt-2 text-xs font-bold text-slate-400 font-sans">این تخفیف روی مبلغ نهایی پس از کسر تخفیف‌های سطری اعمال می‌شود.</p>
                        </div>
                      </div>
                      <div className="w-full lg:w-[420px] space-y-1">
                        <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100/50 space-y-4">
                          <div className="flex justify-between items-center text-slate-500 font-bold">
                            <span>جمع مبالغ (بدون تخفیف):</span>
                            <span className="font-sans font-black text-slate-700" dir="rtl">{formatCurrency(invoiceOriginalTotal())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          <div className="flex justify-between items-center text-rose-500 font-bold">
                            <span>مجموع کل تخفیف‌ها:</span>
                            <span className="font-sans font-black text-rose-600" dir="rtl">{formatCurrency(invoiceTotalDiscount())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          <div className="h-px bg-emerald-100/30 w-full my-2"></div>
                          <div className="flex justify-between items-center text-slate-400 font-bold text-xs">
                            <span>ارزش پس از تخفیف سطری:</span>
                            <span className="font-sans font-bold text-slate-600" dir="rtl">{formatCurrency(calculateSubtotal())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          {overallDiscountPercent > 0 && (
                            <div className="flex justify-between items-center text-slate-400 font-bold text-xs">
                              <span>تخفیف کلی فاکتور:</span>
                              <span className="font-sans font-bold text-slate-600" dir="rtl">% {overallDiscountPercent}</span>
                            </div>
                          )}
                          <div className="h-px bg-emerald-100/60 w-full my-4"></div>
                          <div className="flex justify-between items-center text-xl font-black text-emerald-800">
                            <span>مبلغ نهایی خرید:</span>
                            <span className="font-sans text-2xl text-emerald-950" dir="rtl">{formatCurrency(calculateFinalTotal())} <span className="text-xs">{invoiceCurrency}</span></span>
                          </div>
                          {calculateFinalTotal() > 0 && (
                            <div className="mt-4 pt-4 border-t border-dashed border-emerald-200 text-right leading-relaxed text-xs font-bold text-emerald-700">
                              <span className="text-emerald-900 font-black">{numToPersianWords(calculateFinalTotal())} {invoiceCurrency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                  </div>
                </div>
                <div className="p-6 bg-emerald-50/20 border-t border-emerald-100 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={submitting || items.length === 0 || !customerId}
                      onClick={() => {
                        if (confirm('آیا از ذخیره این فاکتور برگشت از خرید به عنوان پیش‌نویس اطمینان دارید؟')) {
                          saveInvoiceData(null, true);
                        }
                      }}
                      className="px-6 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm outline-none cursor-pointer"
                    >
                      <FileText className="w-5 h-5" />
                      ذخیره به عنوان پیش‌نویس
                    </button>
                    <button onClick={handleInvoicePreviewTrigger} disabled={submitting || items.length === 0 || !customerId} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-colors shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/20 cursor-pointer">
                      {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-6 h-6" />}
                      ثبت برگشت از خرید
                    </button>
                </div>
              </div>
            </motion.div>
           );
        
        case 'create_purchase':
           return (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-right font-sans">
              {hasDraft && (
                 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center text-amber-800 shadow-sm col-span-full w-full">
                    <span className="font-bold flex items-center gap-2.5 mb-3 md:mb-0"><History className="w-5 h-5 text-amber-500" /> یک فاکتور ناتمام و ثبت نشده بازیابی شد. مایلید از آن استفاده کنید یا فاکتور جدیدی آغاز کنید؟</span>
                    <div className="flex gap-2">
                       <button onClick={restoreDraft} className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-sm font-bold transition-colors">بازیابی فاکتور ناتمام</button>
                       <button onClick={clearDraft} className="px-4 py-2.5 bg-white border border-amber-200 hover:bg-amber-50 rounded-xl text-sm font-bold transition-colors">پاک کردن و فاکتور جدید</button>
                    </div>
                 </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-700 px-5 py-4 rounded-xl flex items-center gap-3 border border-emerald-100 font-bold shadow-sm">
                  <CheckCircle className="w-5 h-5" />
                  {successMsg}
                </div>
              )}
              {editingInvoiceId && (
                <div className="bg-amber-50 text-amber-900 px-5 py-4 rounded-2xl flex items-center justify-between gap-3 border border-amber-200/60 font-bold shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>شما در حال ویرایش فاکتور خرید پیش‌نویس/ثبت‌شده شماره <strong className="text-amber-950">#{toPersianDigits(invoiceNumber)}</strong> هستید. تغییرات جدید جایگزین نسخه قبلی خواهد شد.</span>
                  </div>
                  <button onClick={clearDraft} className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer">انصراف از ویرایش</button>
                </div>
              )}

              {/* Header Info */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-emerald-50">
                <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <span className="bg-emerald-100/50 p-2.5 rounded-xl text-emerald-600">
                     <Plus className="w-6 h-6" />
                  </span>
                  {invoiceTitle}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">شماره فاکتور خرید</label>
                    <div className="flex gap-2">
                        <select value={invoiceMode} onChange={(e) => setInvoiceMode(e.target.value as 'auto' | 'manual')} className="p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-sm font-bold text-emerald-900 outline-none">
                          <option value="auto">تولید خودکار</option>
                          <option value="manual">ورود دستی</option>
                        </select>
                        {invoiceMode === 'manual' && (
                          <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="flex-1 p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold text-slate-800 outline-none bg-emerald-50/20" dir="ltr" placeholder="شماره فاکتور سیستم تامین..." />
                        )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-500"/>
                      شماره فاکتور فروشنده (ارجاع)
                    </label>
                    <input 
                      type="text" 
                      value={sellerInvoiceNumber} 
                      onChange={(e) => setSellerInvoiceNumber(e.target.value)} 
                      className="w-full p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold text-slate-800 outline-none bg-emerald-50/20" 
                      dir="ltr" 
                      placeholder="شماره فاکتور اصلی فروشنده..." 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-emerald-500"/> عنوان فاکتور</label>
                    <input type="text" value={invoiceTitle} onChange={(e) => setInvoiceTitle(e.target.value)} className="w-full p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 outline-none bg-emerald-50/20" placeholder="عنوانی برای فاکتور وارد کنید..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-500"/> تاریخ صدور فاکتور</label>
                    <div className="relative">
                      <DatePicker
                          value={date}
                          onChange={setDate}
                          calendar={storeSettings?.calendarType === 'gregorian' ? undefined : persian}
                          locale={storeSettings?.calendarType === 'gregorian' ? undefined : persian_fa}
                          calendarPosition="bottom-right"
                          inputClass="w-full pl-11 pr-4 p-3 bg-emerald-50/30 hover:bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-emerald-950 font-sans font-black text-center transition-all cursor-pointer outline-none text-sm"
                          containerClassName="w-full"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><User className="w-4 h-4 text-emerald-500"/> تامین کننده (طرف حساب)</label>
                    <div className="border border-emerald-100 rounded-xl bg-emerald-50/30 focus-within:ring-2 focus-within:ring-emerald-500 transition-colors">
                      <SearchableSelect 
                        options={persons.map(p => ({
                          value: p.id,
                          label: p.alias || p.name,
                          subLabel: p.phone || undefined,
                          badge: getRoleName(p.role)
                        }))}
                        value={customerId}
                        onChange={val => setCustomerId(val)}
                        placeholder="-- جستجوی تامین کننده --"
                        searchPlaceholder="جستجوی شخص یا شرکت..."
                      />
                    </div>
                    {customerId && renderPersonInfoBox(customerId, 'bg-emerald-50/50 border-emerald-100/50 text-slate-600')}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Wallet className="w-4 h-4 text-emerald-500"/> وضعیت پرداخت</label>
                    <select value={invoicePaymentStatus} onChange={(e) => {
                      const val = e.target.value as any;
                      setInvoicePaymentStatus(val);
                      if (val === 'paid') setInvoicePaidAmount(calculateFinalTotal());
                      else if (val === 'unpaid') setInvoicePaidAmount(0);
                    }} className="w-full p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-sm font-bold text-emerald-900 outline-none">
                      <option value="unpaid">پرداخت نشده</option>
                      <option value="partial">تسویه بخشی (علی‌الحساب)</option>
                      <option value="paid">تسویه کامل</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-emerald-500"/> مبلغ پرداختی</label>
                    <div className="relative">
                       <input type="number" 
                         value={invoicePaidAmount} 
                         onChange={(e) => {
                             setInvoicePaidAmount(Number(e.target.value));
                             if (Number(e.target.value) >= calculateFinalTotal()) setInvoicePaymentStatus('paid');
                             else if (Number(e.target.value) > 0) setInvoicePaymentStatus('partial');
                             else setInvoicePaymentStatus('unpaid');
                         }} 
                         disabled={invoicePaymentStatus === 'unpaid'}
                         className="w-full p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold text-slate-800 outline-none bg-emerald-50/20 disabled:opacity-50" 
                         dir="ltr" 
                         placeholder="0" 
                       />
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-xs select-none">
                         {invoiceCurrency}
                       </div>
                    </div>
                  </div>
                  {storeSettings.requireWarehouse && (
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Box className="w-4 h-4 text-emerald-500"/> انبار ورود کالا</label>
                      <select value={invoiceWarehouseId} onChange={(e) => setInvoiceWarehouseId(e.target.value)} className="w-full p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-base font-bold text-emerald-900 outline-none">
                         <option value="">-- لطفاً انبار را انتخاب کنید --</option>
                         {warehouses.filter(w => w.isActive !== false).map((v) => (
                           <option key={v.id} value={v.id}>{v.name}</option>
                         ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-emerald-50 overflow-hidden" data-invoice-flow="purchase">
                <div className="p-5 bg-emerald-50/30 border-b border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-extrabold text-slate-800 flex items-center gap-2 whitespace-nowrap"><Package className="w-5 h-5 text-emerald-600"/> لیست اقلام خریداری شده</h3>
                    <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-2 max-w-2xl">
                      <FastBarcodeScanner onScan={handleFastBarcodeScan} />
                      <div className="flex-[2] relative z-10 w-full">
                        <div className="border hover:border-emerald-300 rounded-xl bg-white shadow-sm transition-colors relative">
                          <SearchableSelect 
                            options={products.map(p => ({
                              value: p.id,
                              label: p.name,
                              subLabel: (p.code || p.barcode) ? `کد: ${p.code || '-'} | بارکد: ${p.barcode || '-'}` : undefined,
                              badge: p.type === 'service' ? 'خدمات' : 'کالا',
                              searchStr: `${p.code || ''} ${p.barcode || ''}`
                            }))}
                            value=""
                            onChange={(val) => handleFastAddProduct(String(val))}
                            placeholder="جستجو و افزودن سریع کالا به لیست خرید (نام، کد، بارکد)..."
                            searchPlaceholder="جستجوی کالای خریداری شده..."
                          />
                        </div>
                      </div>
                      <button onClick={() => setIsScannerOpen(true)} className="p-[11px] bg-white border border-emerald-200 text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-50 transition-colors focus:ring-2 focus:ring-emerald-500" title="اسکن بارکد با دوربین">
                        <ScanLine className="w-5 h-5"/>
                      </button>
                    </div>
                    <button onClick={() => setIsProductModalOpen(true)} className="px-5 py-3 bg-white border border-emerald-200 text-emerald-700 shadow-sm rounded-xl font-bold hover:bg-emerald-50 flex items-center gap-2 transition-colors whitespace-nowrap outline-none focus:ring-2 focus:ring-emerald-500">
                      <Plus className="w-4 h-4" /> تعریف کالا / خدمات جدید
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[1000px]">
                      <thead>
                        <tr className="bg-white text-xs font-black text-slate-400 border-b border-emerald-50">
                          <th className="p-5 w-12 text-center">ردیف</th>
                          <th className="p-5 min-w-[200px] w-[30%] text-right">شرح کالا / خدمات</th>
                          <th className="p-5 w-32 text-center border-r border-emerald-50/50">تعداد</th>
                          <th className="p-5 w-32 text-center border-r border-emerald-50/50">واحد</th>
                          <th className="p-5 w-48 border-r border-emerald-50/50 text-left text-emerald-800">فی ({invoiceCurrency})</th>
                          <th className="p-5 w-28 text-center border-r border-emerald-50/50">تخفیف %</th>
                          <th className="p-5 w-48 border-r border-emerald-50/50 text-left text-emerald-800">مبلغ کل ({invoiceCurrency})</th>
                          <th className="p-5 w-12 text-center border-r border-emerald-50/50">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50/50">
                        {items.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-emerald-400 font-bold text-sm bg-emerald-50/30">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <Box className="w-8 h-8 text-emerald-200" />
                                <span>هیچ کالا یا خدماتی به این سند اضافه نشده است. لطفاً جستجو کرده یا محصول جدیدی تعریف کنید.</span>
                              </div>
                            </td>
                          </tr>
                        )}
                        {items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors" data-row-type="purchase-row">
                              <td className="p-5 text-center font-bold text-slate-300">{index + 1}</td>
                              <td className="p-5">
                                  {item.productId ? (
                                    <div className="font-black text-slate-800 flex flex-col gap-1">
                                      <span>{item.productName}</span>
                                      {(() => {
                                         const p = products.find(prod => prod.id === item.productId);
                                         return (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 self-start px-2 py-0.5 rounded-md">کالای سیستمی</span>
                                                {(p?.code || p?.barcode) && (
                                                    <span className="text-[10px] text-emerald-500 font-mono flex gap-2">
                                                        {p.code ? <span>کد: {p.code}</span> : null}
                                                        {p.barcode ? <span>بارکد: {p.barcode}</span> : null}
                                                    </span>
                                                )}
                                            </div>
                                         );
                                      })()}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder="شرح دلخواه وارد کنید..."
                                      value={item.productName}
                                      onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                      className="w-full p-2.5 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-800 outline-none"
                                    />
                                  )}
                              </td>
                              <td className="p-5">
                                  <div className="flex flex-col gap-1.5">
                                    <input type="number" min="0" step="any" value={item.quantity} onChange={(e: any) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full p-2.5 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-sans text-center font-black text-slate-800 outline-none" dir="ltr" />
                                  </div>
                              </td>
                              <td className="p-5">
                                  {(() => {
                                    const product = item.productId ? products.find((p) => p.id.toString() === String(item.productId)) : null;
                                    const hasSecondary = product?.secondaryUnit;
                                    return (
                                      <div className="flex flex-col gap-1.5">
                                        {hasSecondary ? (
                                          <select value={item.isSecondaryUnit ? "true" : "false"} onChange={(e) => handleItemChange(item.id, 'isSecondaryUnit', e.target.value === 'true')} className="w-full p-2 text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-100/50 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-emerald-400">
                                            <option value="false">{product.unit} (اصلی)</option>
                                            <option value="true">{product.secondaryUnit} (فرعی)</option>
                                          </select>
                                        ) : product ? (
                                          <div className="w-full p-2 text-center text-emerald-700 font-bold bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm shadow-sm">
                                            {product.unit || '-'}
                                          </div>
                                        ) : (
                                          <input
                                            type="text"
                                            value={item.selectedUnit || ''}
                                            onChange={(e) => handleItemChange(item.id, 'selectedUnit', e.target.value)}
                                            placeholder="واحد..."
                                            className="w-full p-2 text-center text-emerald-800 font-bold bg-white border border-emerald-200/50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                          />
                                        )}
                                      </div>
                                    );
                                  })()}
                              </td>
                              <td className="p-5">
                                  <CurrencyInput currencyLabel={storeSettings?.currency}
                                    value={item.unitPrice} 
                                    onChange={(e: any) => handleItemChange(item.id, 'unitPrice', e.target.value)} 
                                    className="w-full p-2.5 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-sans text-left font-black text-emerald-900 text-sm outline-none" 
                                  />
                              </td>
                              <td className="p-5">
                                  <input type="number" min="0" max="100" step="any" value={item.discountPercent} onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)} className="w-full p-2.5 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-center text-rose-600 font-black outline-none" dir="ltr" />
                              </td>
                              <td className="p-5 font-black text-left font-sans text-emerald-950" dir="ltr">
                                  {formatCurrency(item.totalPrice)}
                              </td>
                              <td className="p-5 text-center">
                                  <button onClick={() => handleRemoveItem(item.id)} className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors outline-none focus:ring-2 focus:ring-rose-500">
                                    <Trash2 className="w-5 h-5"/>
                                  </button>
                              </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-16 text-center">
                                <div className="flex flex-col items-center justify-center gap-4 text-emerald-600/50">
                                  <div className="bg-emerald-50 p-6 rounded-full border-2 border-emerald-100/50">
                                    <Package className="w-12 h-12" />
                                  </div>
                                  <p className="font-extrabold text-lg text-slate-700">سبد خرید خالی است</p>
                                  <p className="text-sm font-bold text-slate-400">یک کالا از نوار جستجو انتخاب کنید یا سطر جدید بسازید.</p>
                                </div>
                              </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
              </div>

              {/* Totals & Submit */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-emerald-50 overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-10">
                      <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-3 ml-1">تخفیف روی کل فاکتور (%)</label>
                            <input type="number" min="0" max="100" value={overallDiscountPercent} onChange={(e) => setOverallDiscountPercent(Number(e.target.value))} className="w-48 p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold text-rose-600 outline-none" dir="ltr" />
                            <p className="mt-2 text-xs font-bold text-slate-400 font-sans">این تخفیف روی مبلغ نهایی پس از کسر تخفیف‌های سطری اعمال می‌شود.</p>
                        </div>
                      </div>
                      <div className="w-full lg:w-[420px] space-y-1">
                        <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100/50 space-y-4">
                          <div className="flex justify-between items-center text-slate-500 font-bold">
                            <span>جمع مبالغ (بدون تخفیف):</span>
                            <span className="font-sans font-black text-slate-700" dir="rtl">{formatCurrency(invoiceOriginalTotal())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          <div className="flex justify-between items-center text-rose-500 font-bold">
                            <span>مجموع کل تخفیف‌ها:</span>
                            <span className="font-sans font-black text-rose-600" dir="rtl">{formatCurrency(invoiceTotalDiscount())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          <div className="h-px bg-emerald-100/30 w-full my-2"></div>
                          <div className="flex justify-between items-center text-slate-400 font-bold text-xs">
                            <span>ارزش پس از تخفیف سطری:</span>
                            <span className="font-sans font-bold text-slate-600" dir="rtl">{formatCurrency(calculateSubtotal())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          {overallDiscountPercent > 0 && (
                            <div className="flex justify-between items-center text-slate-400 font-bold text-xs">
                              <span>تخفیف کلی فاکتور:</span>
                              <span className="font-sans font-bold text-slate-600" dir="rtl">% {overallDiscountPercent}</span>
                            </div>
                          )}
                          <div className="h-px bg-emerald-100/60 w-full my-4"></div>
                          <div className="flex justify-between items-center text-xl font-black text-emerald-800">
                            <span>مبلغ نهایی خرید:</span>
                            <span className="font-sans text-2xl text-emerald-950" dir="rtl">{formatCurrency(calculateFinalTotal())} <span className="text-xs">{invoiceCurrency}</span></span>
                          </div>
                          {calculateFinalTotal() > 0 && (
                            <div className="mt-4 pt-4 border-t border-dashed border-emerald-200 text-right leading-relaxed text-xs font-bold text-emerald-700">
                              <span className="text-emerald-900 font-black">{numToPersianWords(calculateFinalTotal())} {invoiceCurrency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                  </div>
                </div>
                <div className="p-6 bg-emerald-50/20 border-t border-emerald-100 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={submitting || items.length === 0 || !customerId}
                      onClick={() => {
                        if (confirm('آیا از ذخیره این فاکتور خرید به عنوان پیش‌نویس اطمینان دارید؟')) {
                          saveInvoiceData(null, true);
                        }
                      }}
                      className="px-6 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm outline-none cursor-pointer"
                    >
                      <FileText className="w-5 h-5" />
                      ذخیره به عنوان پیش‌نویس
                    </button>
                    <button onClick={handleInvoicePreviewTrigger} disabled={submitting || items.length === 0 || !customerId} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-colors shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/20 cursor-pointer">
                      {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-6 h-6" />}
                      ثبت نهایی خرید
                    </button>
                </div>
              </div>
            </motion.div>
           );
        case 'create_sale_return':
           return (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-right font-sans">
              {hasDraft && (
                 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center text-amber-800 shadow-sm col-span-full w-full">
                    <span className="font-bold flex items-center gap-2.5 mb-3 md:mb-0"><History className="w-5 h-5 text-amber-500" /> یک فاکتور ناتمام و ثبت نشده بازیابی شد. مایلید از آن استفاده کنید یا فاکتور جدیدی آغاز کنید؟</span>
                    <div className="flex gap-2">
                       <button onClick={restoreDraft} className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-sm font-bold transition-colors">بازیابی فاکتور ناتمام</button>
                       <button onClick={clearDraft} className="px-4 py-2.5 bg-white border border-amber-200 hover:bg-amber-50 rounded-xl text-sm font-bold transition-colors">پاک کردن و فاکتور جدید</button>
                    </div>
                 </div>
              )}
              {successMsg && (
                <div className="bg-indigo-50 text-indigo-700 px-5 py-4 rounded-xl flex items-center gap-3 border border-indigo-100 font-bold shadow-sm">
                  <CheckCircle className="w-5 h-5" />
                  {successMsg}
                </div>
              )}
              {editingInvoiceId && (
                <div className="bg-amber-50 text-amber-900 px-5 py-4 rounded-2xl flex items-center justify-between gap-3 border border-amber-200/60 font-bold shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>شما در حال ویرایش فاکتور برگشت از فروش پیش‌نویس/ثبت‌شده شماره <strong className="text-amber-950">#{toPersianDigits(invoiceNumber)}</strong> هستید. تغییرات جدید جایگزین نسخه قبلی خواهد شد.</span>
                  </div>
                  <button onClick={clearDraft} className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer">انصراف از ویرایش</button>
                </div>
              )}

              {/* Header Info */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-indigo-50">
                <div className="flex justify-between items-center mb-8 gap-4 border-b border-indigo-100 pb-5">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <span className="bg-indigo-100/50 p-2.5 rounded-xl text-indigo-600">
                       <CornerDownLeft className="w-6 h-6" />
                    </span>
                    {invoiceTitle}
                  </h2>
                  
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-gray-500"></span>
                     
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">شماره فاکتور برگشت از فروش</label>
                    <div className="flex gap-2">
                        <select value={invoiceMode} onChange={(e) => setInvoiceMode(e.target.value as 'auto' | 'manual')} className="p-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-indigo-50/30 text-sm font-bold text-indigo-900 outline-none">
                          <option value="auto">تولید خودکار</option>
                          <option value="manual">ورود دستی</option>
                        </select>
                        {invoiceMode === 'manual' && (
                          <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="flex-1 p-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-left font-bold text-slate-800 outline-none bg-indigo-50/20" dir="ltr" placeholder="شماره دلخواه......" />
                        )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-indigo-500"/> عنوان فاکتور</label>
                    <input type="text" value={invoiceTitle} onChange={(e) => setInvoiceTitle(e.target.value)} className="w-full p-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 outline-none bg-indigo-50/20" placeholder="عنوانی برای فاکتور وارد کنید..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500"/> تاریخ صدور فاکتور</label>
                    <div className="relative">
                      <DatePicker
                          value={date}
                          onChange={setDate}
                          calendar={storeSettings?.calendarType === 'gregorian' ? undefined : persian}
                          locale={storeSettings?.calendarType === 'gregorian' ? undefined : persian_fa}
                          calendarPosition="bottom-right"
                          inputClass="w-full pl-11 pr-4 p-3 bg-indigo-50/30 hover:bg-indigo-50 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-indigo-950 font-sans font-black text-center transition-all cursor-pointer outline-none text-sm"
                          containerClassName="w-full"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><User className="w-4 h-4 text-indigo-500"/> مشتری (طرف حساب)</label>
                    <div className="border border-indigo-100 rounded-xl bg-indigo-50/30 focus-within:ring-2 focus-within:ring-indigo-500 transition-colors">
                      <SearchableSelect 
                        options={persons.map(p => ({
                          value: p.id,
                          label: p.alias || p.name,
                          subLabel: p.phone || undefined,
                          badge: getRoleName(p.role)
                        }))}
                        value={customerId}
                        onChange={val => setCustomerId(val)}
                        placeholder="-- جستجوی مشتری --"
                        searchPlaceholder="جستجوی شخص یا شرکت..."
                      />
                    </div>
                    {customerId && renderPersonInfoBox(customerId, 'bg-indigo-50/50 border-indigo-100/50 text-slate-600')}
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-indigo-500"/> توضیحات</label>
                    <input 
                      type="text" 
                      value={invoiceDescription || ''} 
                      onChange={(e) => setInvoiceDescription(e.target.value)} 
                      className="w-full p-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 outline-none bg-indigo-50/20" 
                      placeholder="توضیحات و یادداشت..." 
                    />
                  </div>
                  {storeSettings.requireWarehouse && (
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Box className="w-4 h-4 text-indigo-500"/> انبار ورود کالا</label>
                      <select value={invoiceWarehouseId} onChange={(e) => setInvoiceWarehouseId(e.target.value)} className="w-full p-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-indigo-50/30 text-base font-bold text-indigo-900 outline-none">
                         <option value="">-- لطفاً انبار را انتخاب کنید --</option>
                         {warehouses.filter(w => w.isActive !== false).map((v) => (
                           <option key={v.id} value={v.id}>{v.name}</option>
                         ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-indigo-50 overflow-hidden" data-invoice-flow="sale-return">
                <div className="p-5 bg-indigo-50/30 border-b border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-extrabold text-slate-800 flex items-center gap-2 whitespace-nowrap"><Package className="w-5 h-5 text-indigo-600"/> لیست اقلام برگشت از فروش</h3>
                    <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-2 max-w-2xl">
                      <FastBarcodeScanner onScan={handleFastBarcodeScan} />
                      <div className="flex-[2] relative z-10 w-full">
                        <div className="border hover:border-indigo-300 rounded-xl bg-white shadow-sm transition-colors relative">
                          <SearchableSelect 
                            options={products.filter(p => storeSettings.allowNegativeStock || p.type === 'service' || calculateProductCurrentStock(p.id) > 0).map(p => ({
                              value: p.id,
                              label: p.name,
                              subLabel: formatProductStockDetails(p),
                              badge: p.type === 'service' ? 'خدمات' : 'کالا',
                              searchStr: `${p.code || ''} ${p.barcode || ''}`
                            }))}
                            value=""
                            onChange={(val) => handleFastAddProduct(String(val))}
                            placeholder="جستجو و افزودن سریع کالا به لیست فروش (نام، کد، بارکد)..."
                            searchPlaceholder="جستجوی کالای مورد نظر برای فروش..."
                          />
                        </div>
                      </div>
                      <button onClick={() => setIsScannerOpen(true)} className="p-[11px] bg-white border border-indigo-200 text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors focus:ring-2 focus:ring-indigo-500" title="اسکن بارکد با دوربین">
                        <ScanLine className="w-5 h-5"/>
                      </button>
                    </div>
                    <button onClick={() => setIsProductModalOpen(true)} className="px-5 py-3 bg-white border border-indigo-200 text-indigo-700 shadow-sm rounded-xl font-bold hover:bg-indigo-50 flex items-center gap-2 transition-colors whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500">
                      <Plus className="w-4 h-4" /> تعریف کالا / خدمات جدید
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[1000px]">
                      <thead>
                        <tr className="bg-white text-xs font-black text-slate-400 border-b border-indigo-50">
                          <th className="p-5 w-12 text-center">ردیف</th>
                          <th className="p-5 min-w-[200px] w-[30%] text-right">شرح کالا / خدمات</th>
                          <th className="p-5 w-32 text-center border-r border-indigo-50/50">تعداد</th>
                          <th className="p-5 w-32 text-center border-r border-indigo-50/50">واحد</th>
                          <th className="p-5 w-48 border-r border-indigo-50/50 text-left text-indigo-800">فی ({invoiceCurrency})</th>
                          <th className="p-5 w-28 text-center border-r border-indigo-50/50">تخفیف %</th>
                          <th className="p-5 w-48 border-r border-indigo-50/50 text-left text-indigo-800">مبلغ کل ({invoiceCurrency})</th>
                          <th className="p-5 w-12 text-center border-r border-indigo-50/50">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-50/50">
                        {items.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-indigo-400 font-bold text-sm bg-indigo-50/30">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <Box className="w-8 h-8 text-indigo-200" />
                                <span>هیچ کالا یا خدماتی به این سند اضافه نشده است. لطفاً جستجو کرده یا محصول جدیدی تعریف کنید.</span>
                              </div>
                            </td>
                          </tr>
                        )}
                        {items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors" data-row-type="sale-return-row">
                              <td className="p-5 text-center font-bold text-slate-300">{index + 1}</td>
                              <td className="p-5">
                                  {item.productId ? (
                                    <div className="font-black text-slate-800 flex flex-col gap-1">
                                      <span>{item.productName}</span>
                                      {(() => {
                                         const p = products.find(prod => prod.id === item.productId);
                                         return (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 self-start px-2 py-0.5 rounded-md">کالای سیستمی</span>
                                                {(p?.code || p?.barcode) && (
                                                    <span className="text-[10px] text-indigo-500 font-mono flex gap-2">
                                                        {p.code ? <span>کد: {p.code}</span> : null}
                                                        {p.barcode ? <span>بارکد: {p.barcode}</span> : null}
                                                    </span>
                                                )}
                                            </div>
                                         );
                                      })()}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder="شرح دلخواه وارد کنید..."
                                      value={item.productName}
                                      onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                      className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-800 outline-none"
                                    />
                                  )}
                              </td>
                              <td className="p-5">
                                  <div className="flex flex-col gap-1.5">
                                    <input type="number" min="0" step="any" value={item.quantity} onChange={(e: any) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full p-2.5 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans text-center font-black text-slate-800 outline-none" dir="ltr" />
                                  </div>
                              </td>
                              <td className="p-5">
                                  {(() => {
                                    const product = item.productId ? products.find((p) => p.id.toString() === String(item.productId)) : null;
                                    const hasSecondary = product?.secondaryUnit;
                                    return (
                                      <div className="flex flex-col gap-1.5">
                                        {hasSecondary ? (
                                          <select value={item.isSecondaryUnit ? "true" : "false"} onChange={(e) => handleItemChange(item.id, 'isSecondaryUnit', e.target.value === 'true')} className="w-full p-2 text-sm font-bold text-indigo-800 bg-indigo-50 border border-indigo-100/50 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-indigo-400">
                                            <option value="false">{product.unit} (اصلی)</option>
                                            <option value="true">{product.secondaryUnit} (فرعی)</option>
                                          </select>
                                        ) : product ? (
                                          <div className="w-full p-2 text-center text-indigo-700 font-bold bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm shadow-sm">
                                            {product.unit || '-'}
                                          </div>
                                        ) : (
                                          <input
                                            type="text"
                                            value={item.selectedUnit || ''}
                                            onChange={(e) => handleItemChange(item.id, 'selectedUnit', e.target.value)}
                                            placeholder="واحد..."
                                            className="w-full p-2 text-center text-indigo-800 font-bold bg-white border border-indigo-200/50 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                          />
                                        )}
                                      </div>
                                    );
                                  })()}
                              </td>
                              <td className="p-5">
                                  <CurrencyInput currencyLabel={storeSettings?.currency}
                                    value={item.unitPrice} 
                                    onChange={(e: any) => handleItemChange(item.id, 'unitPrice', e.target.value)} 
                                    className="w-full p-2.5 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans text-left font-black text-indigo-900 text-sm outline-none" 
                                  />
                              </td>
                              <td className="p-5">
                                  <input type="number" min="0" max="100" step="any" value={item.discountPercent} onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)} className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-center text-rose-600 font-black outline-none" dir="ltr" />
                              </td>
                              <td className="p-5 font-black text-left font-sans text-indigo-950" dir="ltr">
                                  {formatCurrency(item.totalPrice)}
                              </td>
                              <td className="p-5 text-center">
                                  <button onClick={() => handleRemoveItem(item.id)} className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors outline-none focus:ring-2 focus:ring-rose-500">
                                    <Trash2 className="w-5 h-5"/>
                                  </button>
                              </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-16 text-center">
                                <div className="flex flex-col items-center justify-center gap-4 text-indigo-600/50">
                                  <div className="bg-indigo-50 p-6 rounded-full border-2 border-indigo-100/50">
                                    <Package className="w-12 h-12" />
                                  </div>
                                  <p className="font-extrabold text-lg text-slate-700">لیست کالاها خالی است</p>
                                  <p className="text-sm font-bold text-slate-400">یک کالا از نوار جستجو انتخاب کنید یا سطر جدید بسازید.</p>
                                </div>
                              </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
              </div>

              {/* Totals & Submit */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-indigo-50 overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-10">
                     {(!activeTab.includes('warehouse')) && (
                        <div className="flex w-full flex-col lg:flex-row justify-between gap-10">
                      <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-3 ml-1">تخفیف روی کل فاکتور (%)</label>
                            <input type="number" min="0" max="100" value={overallDiscountPercent} onChange={(e) => setOverallDiscountPercent(Number(e.target.value))} className="w-48 p-3.5 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-left font-bold text-rose-600 outline-none" dir="ltr" />
                            <p className="mt-2 text-xs font-bold text-slate-400 font-sans">این تخفیف روی مبلغ نهایی پس از کسر تخفیف‌های سطری اعمال می‌شود.</p>
                        </div>
                      </div>
                      <div className="w-full lg:w-[420px] space-y-1">
                        <div className="bg-indigo-50/40 p-6 rounded-2xl border border-indigo-100/50 space-y-4">
                          <div className="flex justify-between items-center text-slate-500 font-bold">
                            <span>جمع مبالغ (بدون تخفیف):</span>
                            <span className="font-sans font-black text-slate-700" dir="rtl">{formatCurrency(invoiceOriginalTotal())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          <div className="flex justify-between items-center text-rose-500 font-bold">
                            <span>مجموع کل تخفیف‌ها:</span>
                            <span className="font-sans font-black text-rose-600" dir="rtl">{formatCurrency(invoiceTotalDiscount())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          <div className="h-px bg-indigo-100/30 w-full my-2"></div>
                          <div className="flex justify-between items-center text-slate-400 font-bold text-xs">
                            <span>ارزش پس از تخفیف سطری:</span>
                            <span className="font-sans font-bold text-slate-600" dir="rtl">{formatCurrency(calculateSubtotal())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          {overallDiscountPercent > 0 && (
                            <div className="flex justify-between items-center text-slate-400 font-bold text-xs">
                              <span>تخفیف کلی فاکتور:</span>
                              <span className="font-sans font-bold text-slate-600" dir="rtl">% {overallDiscountPercent}</span>
                            </div>
                          )}
                          <div className="h-px bg-indigo-100/60 w-full my-4"></div>
                          <div className="flex justify-between items-center text-xl font-black text-indigo-800">
                            <span>مبلغ نهایی فاکتور:</span>
                            <span className="font-sans text-2xl text-indigo-950" dir="rtl">{formatCurrency(calculateFinalTotal())} <span className="text-xs">{invoiceCurrency}</span></span>
                          </div>
                          {calculateFinalTotal() > 0 && (
                            <div className="mt-4 pt-4 border-t border-dashed border-indigo-200 text-right leading-relaxed text-xs font-bold text-indigo-700">
                              <span className="text-indigo-900 font-black">{numToPersianWords(calculateFinalTotal())} {invoiceCurrency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                   )}
                  </div>
                </div>
                <div className="p-6 bg-indigo-50/20 border-t border-indigo-100 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={submitting || items.length === 0 || !customerId}
                      onClick={() => {
                        if (confirm('آیا از ذخیره این فاکتور به عنوان پیش‌نویس اطمینان دارید؟')) {
                          saveInvoiceData(null, true);
                        }
                      }}
                      className="px-6 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm outline-none cursor-pointer"
                    >
                      <FileText className="w-5 h-5" />
                      ذخیره به عنوان پیش‌نویس
                    </button>
                    <button onClick={handleInvoicePreviewTrigger} disabled={submitting || items.length === 0 || !customerId} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-colors shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/20 cursor-pointer">
                      {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-6 h-6" />}
                      ثبت و بررسی فاکتور/سند
                    </button>
                </div>
              </div>
            </motion.div>
           );
        
        case 'create_sale':
           return (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-right font-sans">
              {hasDraft && (
                 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center text-amber-800 shadow-sm col-span-full w-full">
                    <span className="font-bold flex items-center gap-2.5 mb-3 md:mb-0"><History className="w-5 h-5 text-amber-500" /> یک فاکتور ناتمام و ثبت نشده بازیابی شد. مایلید از آن استفاده کنید یا فاکتور جدیدی آغاز کنید؟</span>
                    <div className="flex gap-2">
                       <button onClick={restoreDraft} className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-sm font-bold transition-colors">بازیابی فاکتور ناتمام</button>
                       <button onClick={clearDraft} className="px-4 py-2.5 bg-white border border-amber-200 hover:bg-amber-50 rounded-xl text-sm font-bold transition-colors">پاک کردن و فاکتور جدید</button>
                    </div>
                 </div>
              )}
              {successMsg && (
                <div className="bg-indigo-50 text-indigo-700 px-5 py-4 rounded-xl flex items-center gap-3 border border-indigo-100 font-bold shadow-sm">
                  <CheckCircle className="w-5 h-5" />
                  {successMsg}
                </div>
              )}
              {editingInvoiceId && (
                <div className="bg-amber-50 text-amber-900 px-5 py-4 rounded-2xl flex items-center justify-between gap-3 border border-amber-200/60 font-bold shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>شما در حال ویرایش فاکتور پیش‌نویس/ثبت‌شده شماره <strong className="text-amber-950">#{toPersianDigits(invoiceNumber)}</strong> هستید. تغییرات جدید جایگزین نسخه قبلی خواهد شد.</span>
                  </div>
                  <button onClick={clearDraft} className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer">انصراف از ویرایش</button>
                </div>
              )}

              {/* Header Info */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-indigo-50">
                <div className="flex justify-between items-center mb-8 gap-4 border-b border-indigo-100 pb-5">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <span className="bg-indigo-100/50 p-2.5 rounded-xl text-indigo-600">
                       <ShoppingCart className="w-6 h-6" />
                    </span>
                    {invoiceTitle}
                  </h2>
                  
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-gray-500">نوع فاکتور:</span>
                     <select 
                       value={invoiceType}
                       onChange={(e) => {
                          setInvoiceType(e.target.value as any);
                          if (e.target.value === 'proforma') {
                             setInvoiceTitle('پیش‌فاکتور (بدون کسر موجودی)');
                          } else {
                             setInvoiceTitle('فاکتور فروش کالا');
                          }
                       }}
                       className="p-2 border border-gray-200 rounded-lg text-sm font-bold bg-white text-indigo-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                     >
                       <option value="sale">فاکتور فروش (استاندارد)</option>
                       <option value="proforma">صدور پیش‌فاکتور</option>
                     </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">شماره فاکتور فروش</label>
                    <div className="flex gap-2">
                        <select value={invoiceMode} onChange={(e) => setInvoiceMode(e.target.value as 'auto' | 'manual')} className="p-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-indigo-50/30 text-sm font-bold text-indigo-900 outline-none">
                          <option value="auto">تولید خودکار</option>
                          <option value="manual">ورود دستی</option>
                        </select>
                        {invoiceMode === 'manual' && (
                          <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="flex-1 p-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-left font-bold text-slate-800 outline-none bg-indigo-50/20" dir="ltr" placeholder="شماره دلخواه......" />
                        )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-indigo-500"/> عنوان فاکتور</label>
                    <input type="text" value={invoiceTitle} onChange={(e) => setInvoiceTitle(e.target.value)} className="w-full p-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 outline-none bg-indigo-50/20" placeholder="عنوانی برای فاکتور وارد کنید..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500"/> تاریخ صدور فاکتور</label>
                    <div className="relative">
                      <DatePicker
                          value={date}
                          onChange={setDate}
                          calendar={storeSettings?.calendarType === 'gregorian' ? undefined : persian}
                          locale={storeSettings?.calendarType === 'gregorian' ? undefined : persian_fa}
                          calendarPosition="bottom-right"
                          inputClass="w-full pl-11 pr-4 p-3 bg-indigo-50/30 hover:bg-indigo-50 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-indigo-950 font-sans font-black text-center transition-all cursor-pointer outline-none text-sm"
                          containerClassName="w-full"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><User className="w-4 h-4 text-indigo-500"/> مشتری (طرف حساب)</label>
                    <div className="border border-indigo-100 rounded-xl bg-indigo-50/30 focus-within:ring-2 focus-within:ring-indigo-500 transition-colors">
                      <SearchableSelect 
                        options={persons.map(p => ({
                          value: p.id,
                          label: p.alias || p.name,
                          subLabel: p.phone || undefined,
                          badge: getRoleName(p.role)
                        }))}
                        value={customerId}
                        onChange={val => setCustomerId(val)}
                        placeholder="-- جستجوی مشتری --"
                        searchPlaceholder="جستجوی شخص یا شرکت..."
                      />
                    </div>
                    {customerId && renderPersonInfoBox(customerId, 'bg-indigo-50/50 border-indigo-100/50 text-slate-600')}
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-indigo-500"/> توضیحات</label>
                    <input 
                      type="text" 
                      value={invoiceDescription || ''} 
                      onChange={(e) => setInvoiceDescription(e.target.value)} 
                      className="w-full p-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 outline-none bg-indigo-50/20" 
                      placeholder="توضیحات و یادداشت..." 
                    />
                  </div>
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Box className="w-4 h-4 text-indigo-500"/> انبار فروش (خروج کالا) <span className="text-rose-500 font-extrabold">*</span></label>
                      <select value={invoiceWarehouseId} onChange={(e) => setInvoiceWarehouseId(e.target.value)} className="w-full p-3 border border-indigo-100/80 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-indigo-50/30 text-base font-bold text-indigo-950 outline-none">
                         <option value="">-- لطفاً انبار فروش را انتخاب کنید --</option>
                         {warehouses.filter(w => w.isActive !== false).map((v) => (
                           <option key={v.id} value={v.id}>{v.name}</option>
                         ))}
                      </select>
                    </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-indigo-50 overflow-hidden" data-invoice-flow="sale">
                <div className="p-5 bg-indigo-50/30 border-b border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-extrabold text-slate-800 flex items-center gap-2 whitespace-nowrap"><Package className="w-5 h-5 text-indigo-600"/> لیست اقلام آماده فروش</h3>
                    <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-2 max-w-2xl">
                      <FastBarcodeScanner onScan={handleFastBarcodeScan} />
                      <div className="flex-[2] relative z-10 w-full">
                        <div className="border hover:border-indigo-300 rounded-xl bg-white shadow-sm transition-colors relative">
                          <SearchableSelect 
                            options={products.filter(p => storeSettings.allowNegativeStock || p.type === 'service' || calculateProductCurrentStock(p.id) > 0).map(p => ({
                              value: p.id,
                              label: p.name,
                              subLabel: formatProductStockDetails(p),
                              badge: p.type === 'service' ? 'خدمات' : 'کالا',
                              searchStr: `${p.code || ''} ${p.barcode || ''}`
                            }))}
                            value=""
                            onChange={(val) => handleFastAddProduct(String(val))}
                            placeholder="جستجو و افزودن سریع کالا به لیست فروش (نام، کد، بارکد)..."
                            searchPlaceholder="جستجوی کالای مورد نظر برای فروش..."
                          />
                        </div>
                      </div>
                      <button onClick={() => setIsScannerOpen(true)} className="p-[11px] bg-white border border-indigo-200 text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors focus:ring-2 focus:ring-indigo-500" title="اسکن بارکد با دوربین">
                        <ScanLine className="w-5 h-5"/>
                      </button>
                    </div>
                    <button onClick={() => setIsProductModalOpen(true)} className="px-5 py-3 bg-white border border-indigo-200 text-indigo-700 shadow-sm rounded-xl font-bold hover:bg-indigo-50 flex items-center gap-2 transition-colors whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500">
                      <Plus className="w-4 h-4" /> تعریف کالا / خدمات جدید
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[1000px]">
                      <thead>
                        <tr className="bg-white text-xs font-black text-slate-400 border-b border-indigo-50">
                          <th className="p-5 w-12 text-center">ردیف</th>
                          <th className="p-5 min-w-[200px] w-[30%] text-right">شرح کالا / خدمات</th>
                          <th className="p-5 w-32 text-center border-r border-indigo-50/50">تعداد</th>
                          <th className="p-5 w-32 text-center border-r border-indigo-50/50">واحد</th>
                          <th className="p-5 w-48 border-r border-indigo-50/50 text-left text-indigo-800">فی ({invoiceCurrency})</th>
                          <th className="p-5 w-28 text-center border-r border-indigo-50/50">تخفیف %</th>
                          <th className="p-5 w-48 border-r border-indigo-50/50 text-left text-indigo-800">مبلغ کل ({invoiceCurrency})</th>
                          <th className="p-5 w-12 text-center border-r border-indigo-50/50">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-50/50">
                        {items.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-indigo-400 font-bold text-sm bg-indigo-50/30">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <Box className="w-8 h-8 text-indigo-200" />
                                <span>هیچ کالا یا خدماتی به این سند اضافه نشده است. لطفاً جستجو کرده یا محصول جدیدی تعریف کنید.</span>
                              </div>
                            </td>
                          </tr>
                        )}
                        {items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors" data-row-type="sale-row">
                              <td className="p-5 text-center font-bold text-slate-300">{index + 1}</td>
                              <td className="p-5">
                                  {item.productId ? (
                                    <div className="font-black text-slate-800 flex flex-col gap-1">
                                      <span>{item.productName}</span>
                                      {(() => {
                                         const p = products.find(prod => prod.id === item.productId);
                                         return (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 self-start px-2 py-0.5 rounded-md">کالای سیستمی</span>
                                                {(p?.code || p?.barcode) && (
                                                    <span className="text-[10px] text-indigo-500 font-mono flex gap-2">
                                                        {p.code ? <span>کد: {p.code}</span> : null}
                                                        {p.barcode ? <span>بارکد: {p.barcode}</span> : null}
                                                    </span>
                                                )}
                                            </div>
                                         );
                                      })()}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder="شرح دلخواه وارد کنید..."
                                      value={item.productName}
                                      onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                      className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-800 outline-none"
                                    />
                                  )}
                              </td>
                              <td className="p-5">
                                  <div className="flex flex-col gap-1.5">
                                    <input type="number" min="0" step="any" value={item.quantity} onChange={(e: any) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full p-2.5 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans text-center font-black text-slate-800 outline-none" dir="ltr" />
                                  </div>
                              </td>
                              <td className="p-5">
                                  {(() => {
                                    const product = item.productId ? products.find((p) => p.id.toString() === String(item.productId)) : null;
                                    const hasSecondary = product?.secondaryUnit;
                                    return (
                                      <div className="flex flex-col gap-1.5">
                                        {hasSecondary ? (
                                          <select value={item.isSecondaryUnit ? "true" : "false"} onChange={(e) => handleItemChange(item.id, 'isSecondaryUnit', e.target.value === 'true')} className="w-full p-2 text-sm font-bold text-indigo-800 bg-indigo-50 border border-indigo-100/50 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-indigo-400">
                                            <option value="false">{product.unit} (اصلی)</option>
                                            <option value="true">{product.secondaryUnit} (فرعی)</option>
                                          </select>
                                        ) : product ? (
                                          <div className="w-full p-2 text-center text-indigo-700 font-bold bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm shadow-sm">
                                            {product.unit || '-'}
                                          </div>
                                        ) : (
                                          <input
                                            type="text"
                                            value={item.selectedUnit || ''}
                                            onChange={(e) => handleItemChange(item.id, 'selectedUnit', e.target.value)}
                                            placeholder="واحد..."
                                            className="w-full p-2 text-center text-indigo-800 font-bold bg-white border border-indigo-200/50 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                          />
                                        )}
                                      </div>
                                    );
                                  })()}
                              </td>
                              <td className="p-5">
                                  <CurrencyInput currencyLabel={storeSettings?.currency}
                                    value={item.unitPrice} 
                                    onChange={(e: any) => handleItemChange(item.id, 'unitPrice', e.target.value)} 
                                    className="w-full p-2.5 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans text-left font-black text-indigo-900 text-sm outline-none" 
                                  />
                              </td>
                              <td className="p-5">
                                  <input type="number" min="0" max="100" step="any" value={item.discountPercent} onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)} className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-center text-rose-600 font-black outline-none" dir="ltr" />
                              </td>
                              <td className="p-5 font-black text-left font-sans text-indigo-950" dir="ltr">
                                  {formatCurrency(item.totalPrice)}
                              </td>
                              <td className="p-5 text-center">
                                  <button onClick={() => handleRemoveItem(item.id)} className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors outline-none focus:ring-2 focus:ring-rose-500">
                                    <Trash2 className="w-5 h-5"/>
                                  </button>
                              </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-16 text-center">
                                <div className="flex flex-col items-center justify-center gap-4 text-indigo-600/50">
                                  <div className="bg-indigo-50 p-6 rounded-full border-2 border-indigo-100/50">
                                    <Package className="w-12 h-12" />
                                  </div>
                                  <p className="font-extrabold text-lg text-slate-700">لیست کالاها خالی است</p>
                                  <p className="text-sm font-bold text-slate-400">یک کالا از نوار جستجو انتخاب کنید یا سطر جدید بسازید.</p>
                                </div>
                              </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
              </div>

              {/* Totals & Submit */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-indigo-50 overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-10">
                     {(!activeTab.includes('warehouse')) && (
                        <div className="flex w-full flex-col lg:flex-row justify-between gap-10">
                      <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-3 ml-1">تخفیف روی کل فاکتور (%)</label>
                            <input type="number" min="0" max="100" value={overallDiscountPercent} onChange={(e) => setOverallDiscountPercent(Number(e.target.value))} className="w-48 p-3.5 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-left font-bold text-rose-600 outline-none" dir="ltr" />
                            <p className="mt-2 text-xs font-bold text-slate-400 font-sans">این تخفیف روی مبلغ نهایی پس از کسر تخفیف‌های سطری اعمال می‌شود.</p>
                        </div>
                      </div>
                      <div className="w-full lg:w-[420px] space-y-1">
                        <div className="bg-indigo-50/40 p-6 rounded-2xl border border-indigo-100/50 space-y-4">
                          <div className="flex justify-between items-center text-slate-500 font-bold">
                            <span>جمع مبالغ (بدون تخفیف):</span>
                            <span className="font-sans font-black text-slate-700" dir="rtl">{formatCurrency(invoiceOriginalTotal())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          <div className="flex justify-between items-center text-rose-500 font-bold">
                            <span>مجموع کل تخفیف‌ها:</span>
                            <span className="font-sans font-black text-rose-600" dir="rtl">{formatCurrency(invoiceTotalDiscount())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          <div className="h-px bg-indigo-100/30 w-full my-2"></div>
                          <div className="flex justify-between items-center text-slate-400 font-bold text-xs">
                            <span>ارزش پس از تخفیف سطری:</span>
                            <span className="font-sans font-bold text-slate-600" dir="rtl">{formatCurrency(calculateSubtotal())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          {overallDiscountPercent > 0 && (
                            <div className="flex justify-between items-center text-slate-400 font-bold text-xs">
                              <span>تخفیف کلی فاکتور:</span>
                              <span className="font-sans font-bold text-slate-600" dir="rtl">% {overallDiscountPercent}</span>
                            </div>
                          )}
                          <div className="h-px bg-indigo-100/60 w-full my-4"></div>
                          <div className="flex justify-between items-center text-xl font-black text-indigo-800">
                            <span>مبلغ نهایی فاکتور:</span>
                            <span className="font-sans text-2xl text-indigo-950" dir="rtl">{formatCurrency(calculateFinalTotal())} <span className="text-xs">{invoiceCurrency}</span></span>
                          </div>
                          {calculateFinalTotal() > 0 && (
                            <div className="mt-4 pt-4 border-t border-dashed border-indigo-200 text-right leading-relaxed text-xs font-bold text-indigo-700">
                              <span className="text-indigo-900 font-black">{numToPersianWords(calculateFinalTotal())} {invoiceCurrency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                   )}
                  </div>
                </div>
                <div className="p-6 bg-indigo-50/20 border-t border-indigo-100 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={submitting || items.length === 0 || !customerId}
                      onClick={() => {
                        if (confirm('آیا از ذخیره این فاکتور به عنوان پیش‌نویس اطمینان دارید؟')) {
                          saveInvoiceData(null, true);
                        }
                      }}
                      className="px-6 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm outline-none cursor-pointer"
                    >
                      <FileText className="w-5 h-5" />
                      ذخیره به عنوان پیش‌نویس
                    </button>
                    <button onClick={handleInvoicePreviewTrigger} disabled={submitting || items.length === 0 || !customerId} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-colors shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/20 cursor-pointer">
                      {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-6 h-6" />}
                      ثبت و بررسی فاکتور/سند
                    </button>
                </div>
              </div>
            </motion.div>
           );
        case 'list_sale':
         case 'list_sale_return':
         case 'list_purchase':
         case 'list_purchase_return':
         case 'list_warehouse_docs': {
            const activePurchases = invoices.filter(i => i.type === 'purchase').filter(inv => {
               if (!invoiceSearchQuery) return true;
               const term = invoiceSearchQuery.toLowerCase();
               const pName = (persons.find(p => p.id.toString() === inv.customerId.toString())?.name || 'نامشخص').toLowerCase();
               const invNum = (inv.invoiceNumber || '').toLowerCase();
               const sellNum = (inv.sellerInvoiceNumber || '').toLowerCase();
               return pName.includes(term) || invNum.includes(term) || sellNum.includes(term);
            });

            const totalPurchasesCount = activePurchases.length;
            const receivedPurchasesCount = activePurchases.filter(inv => 
               invoices.some(wh => wh.type === 'warehouse_receipt' && wh.sourceInvoiceId?.toString() === inv.id.toString())
            ).length;
            const pendingPurchasesCount = Math.max(0, totalPurchasesCount - receivedPurchasesCount);

            const filteredInvoicesList = invoices.filter(i => {
              if (activeTab === 'list_sale') {
                return i.type === 'sale' || i.type === 'proforma';
              } else if (activeTab === 'list_purchase') {
                if (i.type !== 'purchase') return false;
                const isReceived = invoices.some(wh => wh.type === 'warehouse_receipt' && wh.sourceInvoiceId?.toString() === i.id.toString());
                if (purchaseFilter === 'received') return isReceived;
                if (purchaseFilter === 'pending') return !isReceived;
                return true;
              } else if (activeTab === 'list_warehouse_docs') {
                return typeof listFilter !== 'undefined' && listFilter === 'receipt' ? i.type === 'warehouse_receipt' :
                  typeof listFilter !== 'undefined' && listFilter === 'remittance' ? i.type === 'warehouse_remittance' :
                  (i.type === 'warehouse_receipt' || i.type === 'warehouse_remittance');
              } else if (activeTab === 'list_sale_return') {
                return i.type === 'sale_return';
              } else if (activeTab === 'list_purchase_return') {
                return i.type === 'purchase_return';
              }
              return false;
            }).filter(inv => {
               if (!invoiceSearchQuery) return true;
               const term = invoiceSearchQuery.toLowerCase();
               const pName = (persons.find(p => p.id.toString() === inv.customerId?.toString())?.name || 'نامشخص').toLowerCase();
               const invNum = (inv.invoiceNumber || '').toLowerCase();
               const sellNum = (inv.sellerInvoiceNumber || '').toLowerCase();
               return pName.includes(term) || invNum.includes(term) || sellNum.includes(term);
            });

            let groupedInvoices: { groupName: string, invoices: any[] }[] = [];
            if (invoiceGroupMode === 'none') {
               groupedInvoices = [{ groupName: 'همه', invoices: filteredInvoicesList }];
            } else {
               const groupMap = new Map<string, any[]>();
               filteredInvoicesList.forEach(inv => {
                  let gName = 'نامشخص';
                  if (inv.jalaliDate) {
                     const parts = inv.jalaliDate.split('/');
                     if (parts.length === 3) {
                        const m = parseInt(parts[1], 10);
                        if (invoiceGroupMode === 'month') {
                           const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
                           gName = `${months[m - 1] || m} ${parts[0]}`;
                        } else if (invoiceGroupMode === 'season') {
                           const seasons = ['فصل بهار', 'فصل تابستان', 'فصل پاییز', 'فصل زمستان'];
                           const sIdx = Math.floor((m - 1) / 3);
                           gName = `${seasons[sIdx] || 'نامشخص'} ${parts[0]}`;
                        }
                     }
                  }
                  if (!groupMap.has(gName)) groupMap.set(gName, []);
                  groupMap.get(gName)!.push(inv);
               });
               groupedInvoices = Array.from(groupMap.entries()).map(([k, v]) => ({ groupName: k, invoices: v }));
            }

            return (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                      <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                        <List className="w-6 h-6 text-indigo-600" />
                        {activeTab === 'list_sale' ? 'لیست فاکتورهای فروش' : 
                         activeTab === 'list_purchase' ? 'لیست فاکتورهای خرید' :
                         'اسناد انبار (رسید و حواله)'}
                      </h2>
                      <div className="relative w-full md:w-96">
                        <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                          type="text" 
                          placeholder="جستجوی حرفه‌ای (شماره، شخص)..." 
                          value={invoiceSearchQuery} 
                          onChange={e => setInvoiceSearchQuery(e.target.value)}
                          className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-bold placeholder-gray-400 transition-all font-sans"
                        />
                      </div>
                  </div>
                  
                  <div className="w-full flex-wrap flex items-center justify-between gap-4 px-2 py-3 bg-slate-50/50 rounded-xl border border-slate-100/50 mt-2">
                     {(activeTab === 'list_sale' || activeTab === 'list_purchase') && (
                       <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                         <span className="text-xs font-bold text-slate-500 mr-2 ml-1">گروه‌بندی:</span>
                         <button onClick={() => setInvoiceGroupMode('none')} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${invoiceGroupMode === 'none' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>بدون گروه</button>
                         <button onClick={() => setInvoiceGroupMode('month')} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${invoiceGroupMode === 'month' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>براساس ماه</button>
                         <button onClick={() => setInvoiceGroupMode('season')} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${invoiceGroupMode === 'season' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>براساس فصل</button>
                       </div>
                     )}
                     {activeTab === 'list_warehouse_docs' && (
                       <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">
                         <button onClick={() => setListFilter('all')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${listFilter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}>همه اسناد</button>
                         <button onClick={() => setListFilter('receipt')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${listFilter === 'receipt' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}>⬇️ رسید (ورود)</button>
                         <button onClick={() => setListFilter('remittance')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${listFilter === 'remittance' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}>⬆️ حواله (خروج)</button>
                       </div>
                     )}
                  </div>
                  
                  <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
                      <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 text-slate-600 border-b border-gray-200 uppercase font-black text-xs">
                          <tr>
                            <th className="p-4">شماره</th>
                            {(['list_purchase', 'list_sale', 'list_sale_return', 'list_purchase_return'].includes(activeTab)) && <th className="p-4">عنوان / شرح</th>}
                            {activeTab.includes('warehouse') && <th className="p-4">نوع سند</th>}
                            <th className="p-4">طرف حساب</th>
                            <th className="p-4">تاریخ</th>
                            {activeTab.includes('warehouse') ? <th className="p-4 text-center">انبار</th> : <th className="p-4 text-left">مبلغ کل</th>}
                            {(['list_purchase', 'list_sale', 'list_sale_return', 'list_purchase_return'].includes(activeTab)) && (
                               <>
                                 <th className="p-4 text-left">دریافتی/پرداختی</th>
                                 <th className="p-4 text-left">مانده فاکتور</th>
                                 <th className="p-4 text-center">وضعیت تسویه</th>
                                 <th className="p-4 text-center">وضعیت انبار</th>
                               </>
                            )}
                            <th className="p-4 text-center">عملیات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {groupedInvoices.map((group) => (
                             <React.Fragment key={group.groupName}>
                               {invoiceGroupMode !== 'none' && group.invoices.length > 0 && (
                                 <tr className="bg-slate-100/60 border-y border-slate-200 shadow-sm relative z-10">
                                   <td colSpan={10} className="p-3 text-right">
                                      <div className="flex justify-between items-center px-2">
                                        <div className="flex items-center gap-3">
                                          <div className="bg-white text-indigo-600 p-1.5 rounded-lg shadow-sm border border-indigo-100">
                                            {invoiceGroupMode === 'month' ? <Calendar className="w-4 h-4" /> : <List className="w-4 h-4" />}
                                          </div>
                                          <span className="font-extrabold text-sm text-slate-800">{group.groupName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white/80 text-slate-500 text-[11px] font-bold px-2 py-1 rounded shadow-sm border border-slate-200">
                                              مجموع: <span className="text-slate-800 tabular-nums">{toPersianDigits(group.invoices.length)}</span>
                                            </span>
                                            <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-1 rounded shadow-sm border border-indigo-100">
                                              مبلغ کل: <span className="tabular-nums">{toPersianDigits(formatCurrency(group.invoices.reduce((a, b) => a + (b.totalAmount || 0), 0)))}</span> تومان
                                            </span>
                                        </div>
                                      </div>
                                   </td>
                                 </tr>
                               )}
                               {group.invoices.map(inv => (
                                 <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                                   <td className="p-4 font-sans text-right font-black text-slate-705 text-sm whitespace-nowrap">
                                     <div className="flex items-center gap-1.5">
                                       <span>#{toPersianDigits(inv.invoiceNumber)}</span>
                                       {(inv.isDraft || inv.status === 'draft') && (
                                         <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-amber-200">پیش‌نویس</span>
                                       )}
                                     </div>
                                   </td>
                                   {(['list_purchase', 'list_sale', 'list_sale_return', 'list_purchase_return'].includes(activeTab)) && (
                                     <td className="p-4 font-bold text-slate-800 text-xs truncate max-w-[150px]" title={inv.title || (activeTab === 'list_sale' ? 'فاکتور فروش' : 'فاکتور خرید')}>
                                        <div>{inv.title || (activeTab === 'list_sale' ? 'فاکتور فروش' : 'فاکتور خرید')}</div>
                                        {(inv.type === 'purchase' || inv.type === 'purchase_return') && inv.sellerInvoiceNumber && (
                                           <div className="text-[10px] text-emerald-600 font-mono mt-1" dir="rtl">
                                              ش.فروشنده: {toPersianDigits(inv.sellerInvoiceNumber)}
                                           </div>
                                        )}
                                     </td>
                                   )}
                                   {activeTab.includes('warehouse') && (
                                     <td className="p-4">
                                        {inv.type === 'warehouse_receipt' ? (
                                           <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">رسید ورود</span>
                                        ) : (
                                           <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">حواله خروج</span>
                                        )}
                                     </td>
                                   )}
                                   <td className="p-4">{renderPersonLink(inv.customerId, persons.find(p => p.id.toString() === inv.customerId?.toString())?.name)}</td>
                                   <td className="p-4">
                                      <div className="flex items-center gap-1.5 justify-start text-xs font-bold text-slate-650" dir="rtl">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                  <span className="font-sans font-black text-xs text-slate-700">{toPersianDigits(inv.jalaliDate)}</span>
                                </div>
                              </td>
                             {activeTab.includes('warehouse') ? (
                               <td className="p-4 font-bold text-indigo-900 text-center">
                                   {warehouses.find(w => w.id?.toString() === inv.warehouseId?.toString())?.name || 'نامشخص'}
                               </td>
                             ) : (
                               <td className="p-4 text-left">
                                  <span className="font-sans font-black text-sm text-indigo-950 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100/30 inline-block transition-all shadow-2xs">
                                    {toPersianDigits(formatCurrency(inv.totalAmount || 0))} <span className="text-[10px] text-indigo-605 font-extrabold mr-1">{inv.currency || storeSettings.currency}</span>
                                  </span>
                                </td>
                             )}
                             {(['list_purchase', 'list_sale', 'list_sale_return', 'list_purchase_return'].includes(activeTab)) && (
                               <>
                                 <td className="p-4 text-left">
                                  <span className="font-sans font-extrabold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 flex items-center gap-1 w-max ml-0 mr-auto rounded-lg">
                                    {toPersianDigits(formatCurrency(inv.paidAmount || 0))} <span className="text-[9px] text-emerald-700">{inv.currency || storeSettings.currency}</span>
                                  </span>
                                 </td>
                                 <td className="p-4 text-left">
                                  <span className="font-sans font-extrabold text-xs text-rose-700 bg-rose-50 px-2.5 py-1.5 flex items-center gap-1 w-max ml-0 mr-auto rounded-lg">
                                    {toPersianDigits(formatCurrency(Math.max((inv.totalAmount || 0) - (inv.paidAmount || 0), 0)))} <span className="text-[9px] text-rose-705">{inv.currency || storeSettings.currency}</span>
                                  </span>
                                 </td>
                                 <td className="p-4 text-center">
                                     {inv.paymentStatus === 'paid' ? <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 font-bold rounded">تسویه کامل</span> :
                                      inv.paymentStatus === 'partial' ? <span className="bg-amber-100 text-amber-800 text-[10px] px-2 font-bold py-1 rounded">علی‌الحساب</span> :
                                      <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-1 font-bold rounded">پرداخت نشده</span>}
                                 </td>
                                 <td className="p-4 text-xs font-bold text-center">
                                     {['list_purchase', 'list_sale_return'].includes(activeTab) ? (
                                        invoices.some(i => i.type === 'warehouse_receipt' && i.sourceInvoiceId?.toString() === inv.id.toString()) ? <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">رسید شده</span> : <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded border border-amber-100">در انتظار رسید</span>
                                     ) : (
                                        invoices.some(i => i.type === 'warehouse_remittance' && i.sourceInvoiceId?.toString() === inv.id.toString()) ? <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">حواله شده</span> : <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded border border-amber-100">در انتظار حواله</span>
                                     )}
                                 </td>
                               </>
                             )}
                             <td className="p-4 text-center flex items-center justify-center gap-2">
                                {activeTab === 'list_purchase' && (
                                   <button onClick={() => {
                                      const newWizardItems = inv.items.filter((it: any) => {
                                         const prod = products.find(p => p.id === it.productId);
                                         return prod && prod.type !== 'service';
                                      }).map((it: any) => {
                                         const prod = products.find(p => p.id === it.productId);
                                         return {
                                           productId: it.productId,
                                           productName: it.productName,
                                           purchasePrice: Number(it.unitPrice) || 0,
                                           marginPercent: 0,
                                           salePrice: prod ? Number(prod.price) : 0,
                                         };
                                      });
                                      if (newWizardItems.length > 0) {
                                         setPricingWizardItems(newWizardItems);
                                         setPricingWizardInvoice(inv);
                                      } else {
                                         setSuccessMsg('هیچ کالای قابل قیمت‌گذاری در این فاکتور وجود ندارد (یا همه خدمات هستند).');
                                      }
                                   }} className="p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg cursor-pointer bg-transparent border-none" title="ثبت و چاپ قیمت فروش">
                                     <Tag className="w-4 h-4" />
                                   </button>
                                )}
                                <button onClick={() => { setViewingInvoice(inv); }} className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg cursor-pointer bg-transparent border-none" title="مشاهده نهایی">
                                  <Eye className="w-4 h-4"/>
                                </button>
                                <button onClick={() => handleEditInvoiceAction(inv)} className="p-2 text-gray-400 hover:bg-amber-50 hover:text-amber-600 rounded-lg cursor-pointer bg-transparent border-none" title="ویرایش (بازگشت به پیش‌نویس)">
                                   <Edit2 className="w-4 h-4"/>
                                 </button>
                                <button onClick={() => handleDeleteInvoice(inv.id)} className="p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg cursor-pointer bg-transparent border-none" title="حذف دائمی">
                                   <Trash2 className="w-4 h-4"/>
                                </button>
                             </td>
                           </tr>
                         ))}
                       </React.Fragment>
                     ))}
                  {filteredInvoicesList.length === 0 && (














                           <tr>
                             <td colSpan={10} className="p-8 text-center text-gray-400">هیچ سندی یافت نشد.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                </div>
             </motion.div>
           );
         }
         
         case 'create_receive_receipt':
        case 'create_pay_receipt': {
           const isReceive = activeTab === 'create_receive_receipt';
           
           const themeRing = isReceive ? 'focus:ring-emerald-500' : 'focus:ring-rose-500';
           const themeText = isReceive ? 'text-emerald-600' : 'text-rose-600';
           const themeBg = isReceive ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300' : 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300';
           const themeLightBg = isReceive ? 'bg-emerald-50/50' : 'bg-rose-50/50';
           const themeBorder = isReceive ? 'border-emerald-200' : 'border-rose-200';
           const themeIcon = isReceive ? 'text-emerald-500' : 'text-rose-500';
           const gradientBox = isReceive ? 'from-emerald-50/40 to-teal-50/40 border-emerald-200/70' : 'from-rose-50/40 to-orange-50/40 border-rose-200/70';
           const themeBadge = isReceive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';

           return (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
               {lastCreatedReceipt && (
                 <div className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-200 shadow-xs font-bold animate-fadeIn">
                   <div className="flex items-center gap-3">
                     <CheckCircle className="w-6 h-6 text-emerald-600 block shrink-0" />
                     <div>
                       <p className="text-sm font-extrabold text-emerald-950">
                         {lastCreatedReceipt.type === 'receive' ? 'سند رسید دریافت رسمی صادر شد' : 'سند رسید پرداخت رسمی صادر شد'}
                       </p>
                       <p className="text-xs text-emerald-600 font-medium mt-1">
                         شماره رسید: <span className="font-mono text-slate-800">{lastCreatedReceipt.receiptNumber || `#${lastCreatedReceipt.id}`}</span> | مبلغ: <span className="font-sans font-extrabold text-slate-800">{toPersianDigits(formatNumber(lastCreatedReceipt.amount))}</span> {storeSettings.currency || 'تومان'}
                       </p>
                     </div>
                   </div>
                   <div className="flex gap-2 shrink-0">
                     <button
                       type="button"
                       onClick={() => setPrintingTransaction(lastCreatedReceipt)}
                       className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all border-none shadow-sm cursor-pointer whitespace-nowrap"
                     >
                       <Printer className="w-4 h-4" />
                       چاپ و پیش‌نمایش رسید
                     </button>
                     <button
                       type="button"
                       onClick={() => setLastCreatedReceipt(null)}
                       className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               )}

               {receiptSuccessMsg && (
                 <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 border border-green-100 font-bold shadow-sm">
                   <CheckCircle className="w-5 h-5" />
                   {receiptSuccessMsg}
                 </div>
               )}

               <div className={`bg-white rounded-2xl p-6 shadow-sm border ${themeBorder} ${themeLightBg}`}>
                 <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
                   <Wallet className={`w-6 h-6 ${themeText}`} />
                   {isReceive ? 'ثبت سند رسید دریافت رسمی' : 'ثبت سند رسید پرداخت رسمی'}
                 </h2>

                 <div className="flex gap-2 max-w-[400px] mb-6 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setReceiptMethod('cash')}
                      className={`flex-1 flex gap-2 justify-center items-center py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${receiptMethod === 'cash' ? (isReceive ? 'bg-white text-emerald-700 shadow-[0_2px_4px_rgba(16,185,129,0.1)] border-emerald-200' : 'bg-white text-rose-700 shadow-[0_2px_4px_rgba(244,63,94,0.1)] border-rose-200') : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 block border border-transparent'}`}
                    >
                      <DollarSign className="w-4 h-4" />
                      نقدی / فیش بانکی / حواله
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptMethod('check')}
                      className={`flex-1 flex gap-2 justify-center items-center py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${receiptMethod === 'check' ? (isReceive ? 'bg-white text-emerald-700 shadow-[0_2px_4px_rgba(16,185,129,0.1)] border-emerald-200' : 'bg-white text-rose-700 shadow-[0_2px_4px_rgba(244,63,94,0.1)] border-rose-200') : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 block border border-transparent'}`}
                    >
                      <CreditCard className="w-4 h-4" />
                      {isReceive ? 'ثبت چک دریافتی' : 'صدور چک'}
                    </button>
                  </div>

                 <form onSubmit={(e) => handleSubmitReceipt(isReceive ? 'receive' : 'pay', e)} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <User className="w-4 h-4"/> طرف حساب (شخص/شرکت)
                        </label>
                        <Select
                          isRtl
                          value={receiptPersonId ? { value: receiptPersonId, label: persons.find(p => p.id.toString() === receiptPersonId.toString())?.personCode ? '[' + persons.find(p => p.id.toString() === receiptPersonId.toString())?.personCode + '] ' + (persons.find(p => p.id.toString() === receiptPersonId.toString())?.alias || persons.find(p => p.id.toString() === receiptPersonId.toString())?.name) : (persons.find(p => p.id.toString() === receiptPersonId.toString())?.alias || persons.find(p => p.id.toString() === receiptPersonId.toString())?.name) } : null}
                          onChange={(option: any) => {
                            setReceiptPersonId(option ? option.value : '');
                            setReceiptLinkedInvoices({});
                          }}
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
                              padding: '2px',
                              boxShadow: 'none',
                              '&:hover': { borderColor: isReceive ? '#34D399' : '#FB7185' }
                            })
                          }}
                        />
                        <input
                          type="hidden"
                          required
                          value={receiptPersonId}
                          onChange={() => {}}
                        />
                        {receiptPersonId && renderPersonInfoBox(receiptPersonId, `${isReceive ? 'bg-emerald-50/50 border-emerald-100/50' : 'bg-rose-50/50 border-rose-100/50'} text-slate-600`)}
                      </div>

                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Calendar className={`w-4 h-4 ${themeIcon} animate-pulse`}/> تاریخ سند (جلالی)
                        </label>
                        <div className="relative">
                          <DatePicker
                            value={receiptDate}
                            onChange={setReceiptDate}
                            calendar={storeSettings?.calendarType === 'gregorian' ? undefined : persian}
                            locale={storeSettings?.calendarType === 'gregorian' ? undefined : persian_fa}
                            calendarPosition="bottom-right"
                            inputClass={`w-full pl-11 pr-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ${themeRing} outline-none font-sans font-black text-slate-900 text-center transition-all cursor-pointer shadow-sm text-base`}
                            containerClassName="w-full"
                          />
                          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${themeIcon}`}>
                            <Calendar className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <DollarSign className={`w-4 h-4 ${themeIcon}`}/> مبلغ سند ({storeSettings.currency || 'تومان'})
                        </label>
                        <div className="relative">
                          <input 
                             type="number" 
                             value={receiptAmount} 
                             onChange={(e) => setReceiptAmount(e.target.value)} 
                             className={`w-full pl-16 pr-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ${themeRing} outline-none font-sans font-mono font-black text-slate-900 text-right text-lg md:text-xl transition-all shadow-sm`}
                             dir="ltr" 
                             placeholder="۰"
                             required 
                           />
                           <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-xs select-none">
                             {storeSettings?.currency || 'تومان'}
                           </div>
                        </div>
                        {receiptAmount && !isNaN(Number(receiptAmount)) && Number(receiptAmount) > 0 && (
                          <div className={`mt-2.5 p-4 bg-gradient-to-br ${gradientBox} border rounded-2xl text-xs leading-relaxed text-right space-y-2 shadow-sm`}>
                            <div className="text-slate-500 font-bold flex items-center gap-2 justify-start">
                              <span className={`${themeBadge} text-[10px] px-2 py-0.5 rounded-md font-extrabold font-sans font-mono`}>جمع عددی:</span>
                              <strong className="text-slate-900 font-mono font-black text-base md:text-lg tracking-wide inline-block" dir="ltr">{formatNumber(Number(receiptAmount))}</strong>
                              <span className="text-slate-400 font-semibold">{storeSettings?.currency || 'تومان'}</span>
                            </div>
                            <div className="h-px bg-slate-200/70 w-full" />
                            <div className="text-slate-500 font-bold flex items-baseline gap-2 justify-start flex-wrap">
                              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-extrabold font-sans font-mono">به حروف:</span>
                              <strong className="text-slate-900 font-sans font-black text-xs md:text-sm inline-block leading-relaxed">{numToPersianWords(Number(receiptAmount))}</strong>
                              <span className="text-slate-600 font-semibold"> {storeSettings?.currency || 'تومان'} تمام.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {receiptMethod === 'cash' ? (
                        <>
                          <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">نوع منبع مالی</label>
                           <select 
                             value={receiptResourceType} 
                             onChange={(e) => {
                               setReceiptResourceType(e.target.value as 'bank' | 'cashbox');
                               setReceiptResourceId('');
                             }} 
                             className={`w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-2 ${themeRing} font-bold text-sm text-slate-800 outline-none transition-shadow`}
                           >
                             <option value="bank">حساب بانکی</option>
                             <option value="cashbox">صندوق فروشگاهی</option>
                           </select>
                         </div>

                         <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">
                             {receiptResourceType === 'bank' ? 'بانک مقصد' : 'صندوق مقصد'}
                           </label>
                           {receiptResourceType === 'bank' ? (
                             <select 
                               value={receiptResourceId} 
                               onChange={(e) => setReceiptResourceId(e.target.value)} 
                               className={`w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-2 ${themeRing} font-bold text-sm text-slate-800 outline-none transition-shadow`}
                               required
                             >
                               <option value="">-- انتخاب بانک --</option>
                               {accounts.map(acc => (
                                 <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>
                               ))}
                             </select>
                           ) : (
                             <select 
                               value={receiptResourceId} 
                               onChange={(e) => setReceiptResourceId(e.target.value)} 
                               className={`w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-2 ${themeRing} font-bold text-sm text-slate-800 outline-none transition-shadow`}
                               required
                             >
                               <option value="">-- انتخاب صندوق --</option>
                               {cashboxes.map(cb => (
                                 <option key={cb.id} value={cb.id}>{cb.name}</option>
                               ))}
                             </select>
                           )}
                         </div>
                       </>
                      ) : isReceive ? (
                        <>
                          <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">شماره چک *</label>
                           <input 
                             type="text" 
                             required
                             value={receiptCheckNumber} 
                             onChange={(e) => setReceiptCheckNumber(e.target.value)} 
                             className={`w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-2 ${themeRing} text-center font-bold text-sm text-slate-800 outline-none transition-shadow`}
                           />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                              <Calendar className={`w-4 h-4 ${themeIcon}`}/> تاریخ سررسید *
                            </label>
                            <div className="relative">
                              <DatePicker
                                value={receiptCheckDueDate}
                                onChange={setReceiptCheckDueDate}
                                calendar={persian}
                                locale={persian_fa}
                                calendarPosition="bottom-right"
                                inputClass={`w-full px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ${themeRing} outline-none font-sans font-black text-slate-900 text-center transition-all cursor-pointer shadow-sm text-sm`}
                                containerClassName="w-full"
                              />
                            </div>
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">نام بانک صادرکننده چک *</label>
                             <input 
                               type="text" 
                               required
                               value={receiptCheckBankName} 
                               onChange={(e) => setReceiptCheckBankName(e.target.value)} 
                               placeholder="مثال: ملت، ملی ..."
                               className={`w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-2 ${themeRing} font-bold text-sm text-slate-800 outline-none transition-shadow`}
                             />
                         </div>
                        </>
                      ) : (
                        <>
                           <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">انتخاب دسته چک (بانک شما) *</label>
                             <select 
                               value={receiptCheckbookId} 
                               onChange={(e) => {
                                 setReceiptCheckbookId(e.target.value);
                                 setReceiptCheckNumber('');
                               }} 
                               className={`w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-2 ${themeRing} font-bold text-sm text-slate-800 outline-none transition-shadow`}
                               required
                             >
                               <option value="">-- انتخاب دسته چک --</option>
                               {checkbooks.map(cb => {
                                 const bankAccount = accounts.find(a => a.id === cb.accountId);
                                 return <option key={cb.id} value={cb.id}>{bankAccount?.bankName} ({cb.startNumber} تا {cb.endNumber})</option>
                               })}
                             </select>
                           </div>
                           <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">شماره چک *</label>
                             {receiptCheckbookId ? (
                               <select
                                 value={receiptCheckNumber}
                                 onChange={(e) => setReceiptCheckNumber(e.target.value)}
                                 className={`w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-2 ${themeRing} font-bold text-sm text-slate-800 outline-none transition-shadow`}
                                 required
                               >
                                 <option value="">-- انتخاب از برگ‌های سفید --</option>
                                 {(() => {
                                    const cb = checkbooks.find(c => String(c.id) === String(receiptCheckbookId));
                                    if (!cb) return null;
                                    const start = Number(cb.startNumber);
                                    const end = Number(cb.endNumber);
                                    if (isNaN(start) || isNaN(end)) return null;
                                    const allChecks = [];
                                    const len = cb.startNumber.length;
                                    for(let i=start; i<=end; i++){ allChecks.push(String(i).padStart(len, '0')); }
                                    const used = issuedChecks
                                      .filter((ic: any) => String(ic.checkbookId) === String(receiptCheckbookId) && ic.status !== 'cancelled')
                                      .map((ic: any) => String(ic.checkNumber).padStart(len, '0'));
                                    const available = allChecks.filter(c => !used.includes(c));
                                    return available.map(c => <option key={c} value={c}>{c}</option>);
                                 })()}
                               </select>
                             ) : (
                               <input 
                                 type="text" 
                                 placeholder="ابتدا دسته چک را انتخاب کنید"
                                 disabled
                                 className={`w-full p-2.5 border border-slate-200 bg-slate-100 rounded-xl text-center font-bold text-sm text-slate-500 outline-none cursor-not-allowed`}
                               />
                             )}
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                <Calendar className={`w-4 h-4 ${themeIcon}`}/> تاریخ سررسید *
                              </label>
                              <div className="relative">
                                <DatePicker
                                  value={receiptCheckDueDate}
                                  onChange={setReceiptCheckDueDate}
                                  calendar={persian}
                                  locale={persian_fa}
                                  calendarPosition="bottom-right"
                                  inputClass={`w-full px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ${themeRing} outline-none font-sans font-black text-slate-900 text-center transition-all cursor-pointer shadow-sm text-sm`}
                                  containerClassName="w-full"
                                />
                              </div>
                           </div>
                        </>
                      )}

                     <div className="md:col-span-2 lg:col-span-3">
                       <label className="block text-sm font-bold text-slate-700 mb-1">توضیحات و بابت</label>
                       <textarea 
                         value={receiptDescription} 
                         onChange={(e) => setReceiptDescription(e.target.value)} 
                         className={`w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-2 ${themeRing} text-sm font-bold text-slate-800 outline-none transition-shadow`}
                         rows={2}
                         placeholder="شرح تراکنش و بابت تراکنش..."
                       />
                     </div>

                     {receiptPersonId && (() => {
                       const personInvoices = invoices.filter(inv => inv.customerId?.toString() === receiptPersonId.toString() && inv.paymentStatus !== 'paid' && ((isReceive && (inv.type === 'sale' || inv.type === 'purchase_return')) || (!isReceive && (inv.type === 'purchase' || inv.type === 'sale_return'))));
                       if (personInvoices.length === 0) return null;
                       return (
                         <div className="md:col-span-2 lg:col-span-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm mt-2">
                           <h3 className="font-extrabold text-sm text-slate-700 mb-3 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-indigo-500" /> تخصیص به فاکتورهای باز (اختیاری)</h3>
                           <p className="text-xs text-slate-500 font-bold mb-3">در صورتیکه این تراکنش بابت یک یا چند فاکتور خاص میباشد، میتوانید آن را مستقیم اینجا تسویه فرمایید</p>
                           <div className="overflow-x-auto">
                              <table className="w-full text-sm text-right bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                                    <th className="p-3">شماره فاکتور</th>
                                    <th className="p-3">تاریخ</th>
                                    <th className="p-3">مبلغ کل فاکتور</th>
                                    <th className="p-3">مانده وتسویه نشده</th>
                                    <th className="p-3">مبلغ تخصیصی در این رسید</th>
                                  </tr>
                                </thead>
                                <tbody>
                                   {personInvoices.map(inv => {
                                      const total = (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency);
                                      const paid = (inv.paidAmount || 0);
                                      const remainder = Math.max(total - paid, 0);
                                      const currentAllocated = receiptLinkedInvoices[inv.id] || 0;
                                      return (
                                        <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                          <td className="p-3 font-mono text-xs font-bold text-slate-600">{toPersianDigits(inv.invoiceNumber) || `#${toPersianDigits(inv.id)}`}</td>
                                          <td className="p-3 font-mono text-xs">{toPersianDigits(inv.jalaliDate)}</td>
                                          <td className="p-3 font-mono text-xs font-bold text-slate-700">{formatCurrency(total)}</td>
                                          <td className="p-3 font-mono text-xs font-bold text-rose-600">{formatCurrency(remainder)}</td>
                                          <td className="p-3">
                                            <div className="flex items-center gap-2 justify-end">
                                              <button
                                                type="button"
                                                className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors border border-indigo-100"
                                                title="تخصیص حداکثری (تکمیل وجه)"
                                                onClick={() => {
                                                  setReceiptLinkedInvoices(prev => ({ ...prev, [inv.id]: remainder }));
                                                }}
                                              >
                                                <CheckSquare className="w-3.5 h-3.5" />
                                              </button>
                                              <input 
                                                 type="number" 
                                                 className="p-1.5 px-2 border border-slate-200 rounded-md text-xs font-mono w-28 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white transition-all shadow-sm" 
                                                 placeholder="0"
                                                 value={currentAllocated || ''}
                                                 onChange={(e) => {
                                                   const val = Number(e.target.value);
                                                   if (val > remainder) {
                                                      customAlert('مبلغ تخصیصی نمیتواند بیشتر از مانده فاکتور باشد');
                                                      return;
                                                   }
                                                   setReceiptLinkedInvoices(prev => ({ ...prev, [inv.id]: val }));
                                                 }}
                                                 min={0}
                                                 max={remainder}
                                              />
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                   })}
                                </tbody>
                              </table>
                           </div>
                           <div className="mt-3 text-xs font-bold text-slate-600 flex justify-end gap-2 items-center">
                              جمع مبالغ تخصیص یافته:
                              <span className="font-mono text-sm text-indigo-700">{formatCurrency(Object.values(receiptLinkedInvoices).reduce((a, b) => a + b, 0))} {storeSettings.currency}</span>
                           </div>
                         </div>
                       );
                     })()}
                   </div>

                   <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                     <button 
                       type="submit" 
                       disabled={submittingReceipt} 
                       className={`px-8 py-3 ${themeBg} text-white rounded-xl font-bold flex items-center gap-2 transition-colors border-none cursor-pointer shadow-sm`}
                     >
                       {submittingReceipt ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                       ثبت و صدور رسید تراکنش
                     </button>
                   </div>
                 </form>
               </div>
             </motion.div>
           );
        }

        case 'list_receive_receipt':
        case 'list_pay_receipt': {
           const isReceive = activeTab === 'list_receive_receipt';
           const filteredTxs = transactions.filter(t => t.type === (isReceive ? 'receive' : 'pay'));

           const themeText = isReceive ? 'text-emerald-700' : 'text-rose-700';
           const themeBg = isReceive ? 'bg-emerald-50' : 'bg-rose-50';
           const themeBorder = isReceive ? 'border-emerald-200' : 'border-rose-200';
           const themeIcon = isReceive ? 'text-emerald-600' : 'text-rose-600';
           const themeNum = isReceive ? 'text-emerald-900' : 'text-rose-900';
           const themeHighlightTxt = isReceive ? 'text-emerald-600' : 'text-rose-600';
           const themeRowHover = isReceive ? 'hover:bg-emerald-50/50' : 'hover:bg-rose-50/50';

           return (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
               <div className={`bg-white rounded-2xl p-6 shadow-sm border ${themeBorder} ${themeBg} bg-opacity-40 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                 <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                   <List className={`w-6 h-6 ${themeIcon}`} />
                   {isReceive ? 'لیست رسیدهای دریافت وجه رسمی' : 'لیست رسیدهای پرداخت وجه رسمی'}
                 </h2>
                 <div className="relative w-full md:w-96">
                   <Search className={`w-5 h-5 ${themeIcon} opacity-50 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2`} />
                   <input
                     type="text"
                     placeholder="جستجوی حرفه‌ای (شماره رسید، نام شخص)..."
                     className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:ring-2 outline-none transition-all placeholder-slate-400 font-bold ${isReceive ? 'focus:ring-emerald-500/50' : 'focus:ring-rose-500/50'}`}
                     value={invoiceSearchQuery}
                     onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                   />
                 </div>
               </div>

               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-right divide-y divide-slate-100">
                     <thead>
                       <tr className="bg-slate-50 text-sm text-slate-500 border-b border-slate-200 text-right">
                         <th className="p-4 font-black">شناسه سند</th>
                         <th className="p-4 font-black">طرف حساب</th>
                         <th className="p-4 font-black">تاریخ سند</th>
                         <th className="p-4 font-black">منبع مالی</th>
                         <th className="p-4 font-black">مبلغ تراکنش</th>
                         <th className="p-4 font-black text-center">عملیات</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {filteredTxs.filter(tx => {
                         if (!invoiceSearchQuery) return true;
                         const term = invoiceSearchQuery.toLowerCase();
                         const personName = (persons.find(p => p.id.toString() === tx.personId?.toString())?.name || 'نامشخص').toLowerCase();
                         const receiptNum = (tx.receiptNumber || `#${tx.id}`).toLowerCase();
                         return personName.includes(term) || receiptNum.includes(term);
                       }).map(tx => {
                         const person = persons.find(p => p.id.toString() === tx.personId?.toString());
                         const resourceLabel = tx.method === 'check' ? `چک (${toPersianDigits(tx.checkNumber || '')})` : tx.resourceType === 'bank' 
                           ? `حساب بانکی: ${accounts.find(a => a.id.toString() === tx.resourceId?.toString())?.bankName || 'نامشخص'}`
                           : `صندوق: ${cashboxes.find(cb => cb.id.toString() === tx.resourceId?.toString())?.name || 'نامشخص'}`;
                         return (
                           <tr key={tx.id} className={`${themeRowHover} transition-colors`}>
                             <td className={`p-4 font-sans font-bold text-sm ${themeHighlightTxt}`}>{toPersianDigits(tx.receiptNumber) || `#${toPersianDigits(tx.id)}`}</td>
                             <td className="p-4 font-bold text-slate-800">{renderPersonLink(person?.id, person?.name)}</td>
                             <td className="p-4 font-sans text-slate-600 font-bold text-xs">{toPersianDigits(tx.jalaliDate || tx.date?.split("T")[0])}</td>
                             <td className="p-4 text-xs font-black text-slate-600 text-right">{resourceLabel}</td>
                             <td className="p-4 text-right">
                                <div className={`font-sans font-black ${themeNum} text-sm`}>
                                  {toPersianDigits(formatNumber(tx.amount))} {storeSettings.currency}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold mt-0.5 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                  {numToPersianWords(tx.amount)} {storeSettings.currency}
                                </div>
                              </td>
                             <td className="p-4 text-center flex items-center justify-center gap-1.5">
                               <button
                                 type="button"
                                 onClick={() => { if (tx.type === 'salary') openPayslip(tx); else setPrintingTransaction(tx); }}
                                 className={`px-3 py-2 ${isReceive ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' : 'bg-rose-50 hover:bg-rose-100 text-rose-700'} rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer border-none transition-colors`}
                               >
                                 <Printer className="w-3.5 h-3.5"/>
                                 پیش‌نمایش و چاپ رسید
                               </button>
                               <button
                                 type="button"
                                  onClick={() => { setEditingReceipt(tx); setIsEditReceiptModalOpen(true); }}
                                  className={`p-2 text-slate-400 ${isReceive ? 'hover:bg-emerald-50 hover:text-emerald-600' : 'hover:bg-rose-50 hover:text-rose-600'} rounded-lg cursor-pointer border-none bg-transparent transition-colors`}
                                  title="ویرایش رسید"
                                >
                                  <Edit2 className="w-4 h-4"/>
                                </button>
                                <button
                                  type="button"
                                 onClick={() => confirmAction('حذف این مورد غیرقابل بازگشت است.', () => deleteTransaction(tx.id.toString()).then(fetchTransactions))}
                                 className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg cursor-pointer border-none bg-transparent transition-colors"
                                 title="حذف سند"
                               >
                                 <Trash2 className="w-4 h-4"/>
                               </button>
                             </td>
                           </tr>
                         );
                       })}
                       {filteredTxs.filter(tx => {
                         if (!invoiceSearchQuery) return true;
                         const term = invoiceSearchQuery.toLowerCase();
                         const personName = (persons.find(p => p.id.toString() === tx.personId?.toString())?.name || 'نامشخص').toLowerCase();
                         const receiptNum = (tx.receiptNumber || `#${tx.id}`).toLowerCase();
                         return personName.includes(term) || receiptNum.includes(term);
                       }).length === 0 && (
                         <tr>
                           <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">هیچ سند یا رسیدی در این بخش یافت نشد.</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
             </motion.div>
           );
         }

         case 'create_salary_payroll': {
           return (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                 <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                   <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                   محاسبه و ثبت فیش حقوق و دستمزد کارمند
                 </h2>

                 <form onSubmit={handleSubmitSalary} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5 justify-start">
                         <User className="w-4 h-4 text-indigo-500" />
                         انتخاب کارمند
                       </label>
                       <SearchableSelect
                         options={persons.map(p => ({
                           value: p.id,
                           label: p.alias || p.name,
                           subLabel: p.personCode ? `کد: ${p.personCode} | ${getRoleName(p.role)}` : getRoleName(p.role),
                           badge: getRoleName(p.role)
                         }))}
                         value={salaryPersonId}
                         onChange={(val) => setSalaryPersonId(val)}
                         placeholder="-- جستجو و انتخاب کارمند --"
                         searchPlaceholder="جستجو نام، کد یا نقش..."
                       />
                       {salaryPersonId && renderPersonInfoBox(salaryPersonId, 'bg-slate-50 border-slate-100 text-slate-600')}
                     </div>

                     <div className="space-y-1.5">
                       <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5 justify-start">
                         <Calendar className="w-4 h-4 text-indigo-500" />
                         دوره حقوق (ماه و سال)
                       </label>
                       <div className="flex gap-2">
                         <select value={salaryPeriodMonth} onChange={(e) => setSalaryPeriodMonth(e.target.value)} className="w-[120px] p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans cursor-pointer bg-white">
                           {['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'].map((m, i) => (
                             <option key={String(i+1)} value={String(i+1)}>{m}</option>
                           ))}
                         </select>
                         <input type="number" value={salaryPeriodYear} onChange={(e) => setSalaryPeriodYear(e.target.value)} className="flex-1 min-w-[80px] p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-center font-mono" placeholder="سال" />
                       </div>
                     </div>

                     <div className="space-y-1.5">
                       <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5 justify-start">
                         <Calendar className="w-4 h-4 text-indigo-500" />
                         تاریخ پرداخت/اصدار
                       </label>
                       <DatePicker
                         value={salaryDate}
                         onChange={setSalaryDate}
                         calendar={storeSettings?.calendarType === 'gregorian' ? undefined : persian}
                         locale={storeSettings?.calendarType === 'gregorian' ? undefined : persian_fa}
                         calendarPosition="bottom-right"
                         inputClass="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-center cursor-pointer"
                         containerClassName="w-full"
                       />
                     </div>

                     <div className="space-y-1.5">
                       <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5 justify-start">
                         <DollarSign className="w-4 h-4 text-indigo-500" />
                         حقوق پایه ({storeSettings.currency})
                       </label>
                       <input 
                          type="number" 
                          value={salaryBaseAmount} 
                          onChange={(e) => setSalaryBaseAmount(e.target.value)} 
                          className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-left font-black text-indigo-950 text-base" 
                          dir="ltr" 
                          required 
                          placeholder="0"
                        />
                        {salaryBaseAmount && !isNaN(Number(salaryBaseAmount)) && Number(salaryBaseAmount) > 0 && (
                          <div className="mt-1.5 p-2 bg-indigo-50/40 border border-indigo-100 rounded-lg text-xs leading-relaxed text-right">
                            <span className="block text-gray-500 font-semibold">به حروف: <strong className="text-indigo-900">{numToPersianWords(Number(salaryBaseAmount))}</strong> {storeSettings.currency}</span>
                          </div>
                        )}
                     </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Earnings */}
                     <div className="bg-emerald-50/55 p-6 rounded-2xl border border-emerald-100/50 space-y-4">
                        <div className="flex items-center justify-between border-b border-emerald-100/60 pb-3">
                          <h3 className="font-extrabold text-emerald-800 text-sm flex items-center gap-1.5">
                            <PlusCircle className="w-5 h-5 text-emerald-600" />
                            آیتم‌های مشمول دریافت (اضافات)
                          </h3>
                        </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                           <label className="block text-xs font-bold text-gray-600 mb-1">حق مسکن</label>
                           <input type="number" value={salaryHousingAllowance} onChange={(e) => setSalaryHousingAllowance(e.target.value)} className="w-full p-2 border border-gray-200 bg-white rounded-lg font-mono text-left" dir="ltr" />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-gray-600 mb-1">بن و خواروبار</label>
                           <input type="number" value={salaryGroceryAllowance} onChange={(e) => setSalaryGroceryAllowance(e.target.value)} className="w-full p-2 border border-gray-200 bg-white rounded-lg font-mono text-left" dir="ltr" />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-gray-600 mb-1">سایر مزایا</label>
                           <input type="number" value={salaryOtherAllowances} onChange={(e) => setSalaryOtherAllowances(e.target.value)} className="w-full p-2 border border-gray-200 bg-white rounded-lg font-mono text-left" dir="ltr" />
                         </div>
                       </div>
                     </div>

                     {/* Deductions */}
                     <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100/50 space-y-4">
                        <div className="flex items-center justify-between border-b border-rose-100/60 pb-3">
                          <h3 className="font-extrabold text-rose-800 text-sm flex items-center gap-1.5">
                            <MinusCircle className="w-5 h-5 text-rose-600" />
                            آیتم‌های کسورات قانونی و انضباطی
                          </h3>
                        </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                           <label className="block text-xs font-bold text-gray-600 mb-1">حق بیمه سهم کارمند</label>
                           <input type="number" value={salaryInsuranceDeduction} onChange={(e) => setSalaryInsuranceDeduction(e.target.value)} className="w-full p-2 border border-gray-200 bg-white rounded-lg font-mono text-left" dir="ltr" />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-gray-600 mb-1">مالیات حقوق</label>
                           <input type="number" value={salaryTaxDeduction} onChange={(e) => setSalaryTaxDeduction(e.target.value)} className="w-full p-2 border border-gray-200 bg-white rounded-lg font-mono text-left" dir="ltr" />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-gray-600 mb-1">سایر کسورات/جریمه</label>
                           <input type="number" value={salaryOtherDeductions} onChange={(e) => setSalaryOtherDeductions(e.target.value)} className="w-full p-2 border border-gray-200 bg-white rounded-lg font-mono text-left" dir="ltr" />
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                     <div className="flex items-center gap-3">
                       <input 
                         type="checkbox" 
                         id="salDirectPay" 
                         checked={salaryDirectPayment} 
                         onChange={(e) => setSalaryDirectPayment(e.target.checked)} 
                         className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                       />
                       <label htmlFor="salDirectPay" className="text-sm font-bold text-gray-800 select-none cursor-pointer">پرداخت و تسویه مستقیم از حساب‌های جاری سیستم (صندوق یا بانک)</label>
                     </div>

                     {salaryDirectPayment && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-fade-in">
                         <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">محل تسویه مالی</label>
                           <select value={salaryResourceType} onChange={(e) => setSalaryResourceType(e.target.value as 'bank' | 'cashbox')} className="w-full p-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500">
                             <option value="bank">حساب بانکی</option>
                             <option value="cashbox">صندوق فروشگاهی</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">نام منبع تسویه</label>
                           {salaryResourceType === 'bank' ? (
                             <select value={salaryResourceId} onChange={(e) => setSalaryResourceId(e.target.value)} className="w-full p-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500" required>
                               <option value="">-- انتخاب بانک --</option>
                               {accounts.map(acc => (
                                 <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>
                               ))}
                             </select>
                           ) : (
                             <select value={salaryResourceId} onChange={(e) => setSalaryResourceId(e.target.value)} className="w-full p-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500" required>
                               <option value="">-- انتخاب صندوق --</option>
                               {cashboxes.map(cb => (
                                 <option key={cb.id} value={cb.id}>{cb.name}</option>
                               ))}
                             </select>
                           )}
                         </div>
                       </div>
                     )}
                   </div>

                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">بابت/شرح فیش حقوقی</label>
                     <input type="text" value={salaryDescription} onChange={(e) => setSalaryDescription(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" placeholder="بابت فیش رسمی حقوق ماه جاری کارمند..." />
                   </div>

                   {(() => {
                     const baseSalaryNum = Number(salaryBaseAmount) || 0;
                     const totalExtras = (Number(salaryHousingAllowance) || 0) + (Number(salaryGroceryAllowance) || 0) + (Number(salaryOtherAllowances) || 0);
                     const totalDeductions = (Number(salaryInsuranceDeduction) || 0) + (Number(salaryTaxDeduction) || 0) + (Number(salaryOtherDeductions) || 0);
                     const netPayable = baseSalaryNum + totalExtras - totalDeductions;

                     return (
                       <div className="space-y-6">
                         {/* Realtime breakdown checklist panel */}
                         <div className="bg-gradient-to-tr from-slate-50 to-slate-100/50 rounded-2xl border border-slate-150 p-5 space-y-4 shadow-3xs">
                           <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider justify-start">
                             <Info className="w-4 h-4 text-indigo-500" />
                             خلاصه محاسبات ارقام فیش حقوقی پرسنل
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-bold">
                             <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-3xs text-right">
                               <span className="text-xs text-slate-400 font-bold">حقوق پایه:</span>
                               <span className="text-slate-800 font-mono font-black" dir="ltr">{formatCurrency(baseSalaryNum)} {storeSettings.currency}</span>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-3xs text-right">
                               <span className="text-xs text-emerald-500 font-bold">جمع کل اضافات (+):</span>
                               <span className="text-emerald-700 font-mono font-black" dir="ltr">{formatCurrency(totalExtras)} {storeSettings.currency}</span>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-3xs text-right">
                               <span className="text-xs text-rose-500 font-bold">جمع کل کسورات (-):</span>
                               <span className="text-rose-700 font-mono font-black" dir="ltr">{formatCurrency(totalDeductions)} {storeSettings.currency}</span>
                             </div>
                             <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 flex flex-col gap-1 shadow-3xs text-right">
                               <span className="text-xs text-indigo-600 font-bold">خالص پرداختی نهایی:</span>
                               <span className="text-indigo-950 font-black text-base font-mono" dir="ltr">{formatCurrency(netPayable)} {storeSettings.currency}</span>
                             </div>
                           </div>
                           {netPayable > 0 && (
                             <div className="text-xs text-slate-500 leading-relaxed text-right mt-1 font-semibold">
                               به حروف: <strong className="text-indigo-900">{numToPersianWords(netPayable)}</strong> {storeSettings.currency}
                             </div>
                           )}
                         </div>

                         {/* Submission Footer with Net Payable highlighted */}
                         <div className="flex flex-col sm:flex-row justify-between items-center bg-indigo-600/5 p-6 rounded-2xl border border-indigo-500/10 gap-4">
                           <div className="text-right">
                             <span className="text-xs text-indigo-600 font-black block mb-1">مبلغ پرداختی خالص کارمند</span>
                             <span className="text-2xl font-black text-indigo-950 font-sans tracking-tight" dir="ltr">
                               {formatCurrency(netPayable)} {storeSettings.currency}
                             </span>
                           </div>
                           <button 
                             type="submit" 
                             disabled={submittingSalary} 
                             className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer border-none"
                           >
                             {submittingSalary ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                             تایید نهایی و صدور فیش حقوقی
                           </button>
                         </div>
                       </div>
                     );
                   })()}
                 </form>
               </div>
             </motion.div>
           );
         }

         case 'list_salary_payroll': {
           const salaryTxs = transactions.filter(t => t.type === 'salary');
           return (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                   <List className="w-6 h-6 text-indigo-600" />
                   فیش‌های حقوق و دستمزد پرسنل صادر شده
                 </h2>
               </div>

               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-right divide-y divide-gray-150">
                     <thead>
                       <tr className="bg-gray-50 text-sm text-gray-500 border-b border-gray-100">
                         <th className="p-4 font-bold text-right">شناسه سند</th>
                         <th className="p-4 font-bold text-right">نام کارمند</th>
                         <th className="p-4 font-bold text-right">تاریخ سند</th>
                         <th className="p-4 font-bold text-right">تسویه مستقیم</th>
                         <th className="p-4 font-bold text-right">حقوق خالص</th>
                         <th className="p-4 font-bold text-center">عملیات</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                       {salaryTxs.map(tx => {
                         const person = persons.find(p => p.id.toString() === tx.personId?.toString());
                         const isDirectPay = tx.resourceType !== 'none';
                         return (
                           <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                             <td className="p-4 font-mono font-bold text-indigo-600">#{toPersianDigits(tx.id)}</td>
                             <td className="p-4 font-bold text-gray-800">{renderPersonLink(person?.id, person?.name)}</td>
                             <td className="p-4 text-gray-500 text-right">
                               <div className="font-mono text-sm mb-1" dir="ltr">{toPersianDigits(tx.jalaliDate || tx.date?.split("T")[0])}</div>
                               {(() => {
                                 try {
                                   const parsed = typeof tx.description === 'string' && tx.description.includes('isPayslip') ? JSON.parse(tx.description) : null;
                                   if(parsed && parsed.periodMonth && parsed.periodYear) {
                                     const pMonthName = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'][Number(parsed.periodMonth)-1];
                                     return <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">{pMonthName} {parsed.periodYear}</span>;
                                   }
                                 } catch(e) {}
                                 return null;
                               })()}
                             </td>
                             <td className="p-4 text-xs font-semibold text-gray-600 text-right">
                               {isDirectPay ? (
                                 <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">بله، تسویه شده</span>
                               ) : (
                                 <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg">خیر، ثبت بدهی</span>
                               )}
                             </td>
                             <td className="p-4 text-right">
                                <div className="font-mono font-black text-indigo-950 text-sm" dir="ltr">
                                  {formatCurrency(tx.amount)} {storeSettings.currency}
                                </div>
                                <div className="text-[10px] text-gray-400 font-bold mt-0.5 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                  {numToPersianWords(tx.amount)} {storeSettings.currency}
                                </div>
                              </td>
                             <td className="p-4 text-center flex items-center justify-center gap-2">
                               <button onClick={() => openPayslip(tx)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-1 text-xs font-bold transition-all cursor-pointer border border-transparent bg-transparent">
                                 <Eye className="w-4 h-4"/> مشاهده فیش حقوقی
                               </button>
                               <button onClick={() => confirmAction('حذف این فیش حقوقی غیرقابل بازگشت است.', () => deleteTransaction(tx.id.toString()).then(fetchTransactions))} className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg cursor-pointer border-none bg-transparent">
                                 <Trash2 className="w-4 h-4"/>
                               </button>
                             </td>
                           </tr>
                         );
                       })}
                       {salaryTxs.length === 0 && (
                         <tr>
                           <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">هیچ فیش حقوقی یافت نشد.</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
             </motion.div>
           );
         }

                 case 'product_categories': {
            // Filter search results
            const filteredCats = productCategories.filter(c => 
              (c.name || '').toLowerCase().includes(categorySearch.toLowerCase()) || 
              (c.description || '').toLowerCase().includes(categorySearch.toLowerCase())
            );

            // Resets the category form
            const resetCategoryForm = () => {
              setNewCatName('');
              setNewCatDesc('');
              setNewCatParentId('');
              setEditingCategoryId(null);
            };

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-right"
              >
                {/* Header Banner */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                      <List className="w-6 h-6 text-indigo-600" />
                      مدیریت گروه‌بندی کالاها
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      دسته‌بندی درختی محصولات و خدمات جهت سازماندهی دقیق کالاها، گزارشات سوددهی و انبارگردانی آسان
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={recalculating}
                      onClick={handleRecalculateStocks}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium cursor-pointer"
                      title="محاسبه مجدد موجودی انبارها بر اساس اسناد رسید و حواله"
                    >
                      <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
                      محاسبه مجدد موجودی
                    </button>
                    <button
                      onClick={handleGenerateDemoData}
                      disabled={submittingProduct}
                      className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg flex items-center gap-2 transition-colors text-sm font-bold"
                    >
                      <Database className="w-4 h-4" />
                      ایجاد دیتای نمونه
                    </button>
                    <button
                      onClick={() => {
                        resetCategoryForm();
                        setIsCategoryModalOpen(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      ثبت گروه جدید
                    </button>
                  </div>
                </div>

                {/* Info Stats Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block mb-1">تعداد کل دسته‌ها</span>
                      <span className="text-2xl font-black text-indigo-950 font-mono" dir="ltr">{productCategories.length}</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <List className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block mb-1">گروه‌های اصلی</span>
                      <span className="text-2xl font-black text-amber-950 font-mono" dir="ltr">{productCategories.filter(c => !c.parentId).length}</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Tag className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block mb-1">زیرمجموعه‌ها</span>
                      <span className="text-2xl font-black text-teal-950 font-mono" dir="ltr">{productCategories.filter(c => c.parentId).length}</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block mb-1">کالاهای دسته‌بندی شده</span>
                      <span className="text-2xl font-black text-rose-950 font-mono" dir="ltr">
                        {products.filter(p => p.categoryId || p.category).length}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Package className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Right: Registration / Edit Form (cols-4) */}
                  <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-150 p-6 flex flex-col gap-5 shadow-sm">
                    <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                      <h3 className="text-base font-black text-gray-800 flex items-center gap-2">
                        {editingCategoryId ? (
                          <>
                            <Edit2 className="w-4 h-4 text-emerald-500" />
                            ویرایش گروه‌بندی
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-indigo-500" />
                            ثبت گروه‌بندی جدید
                          </>
                        )}
                      </h3>
                      {editingCategoryId && (
                        <button 
                          onClick={resetCategoryForm}
                          className="text-xs text-rose-500 hover:text-rose-600 font-extrabold bg-rose-50 hover:bg-rose-100/60 px-2 py-1 rounded-lg border-none cursor-pointer transition-all"
                        >
                          لغو ویرایش
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Name input */}
                      <div>
                        <label className="block text-xs font-black text-gray-650 mb-1.5">
                          نام گروه کالایی <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="مثال: مواد پروتئینی، لبنیات"
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-indigo-950 font-sans font-bold transition-all shadow-xs text-sm"
                            required
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Tag className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Parent selection (Dynamic React Select or Custom Dropdown) */}
                      <div>
                        <label className="block text-xs font-black text-gray-650 mb-1.5 flex justify-between items-center">
                          <span>گروه والد (زیرمجموعه از)</span>
                          <span className="text-[10px] text-gray-400 font-bold">(اختیاری)</span>
                        </label>
                        <Select
                          isRtl
                          value={newCatParentId ? { value: newCatParentId, label: productCategories.find(c => c.id === newCatParentId || c.id.toString() === newCatParentId?.toString())?.name || 'گروه والد' } : null}
                          onChange={(option) => setNewCatParentId(option ? option.value : '')}
                          options={productCategories.filter(c => c.id !== editingCategoryId).map(c => ({
                            value: c.id.toString(),
                            label: c.name
                          }))}
                          placeholder="انتخاب گروه والد..."
                          isClearable
                          styles={{
                            control: (base) => ({
                              ...base,
                              backgroundColor: '#f8fafc',
                              borderRadius: '12px',
                              borderColor: '#e2e8f0',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              padding: '1.5px',
                              boxShadow: 'none',
                              '&:hover': {
                                backgroundColor: '#f1f5f9'
                              }
                            }),
                            menu: (base) => ({
                              ...base,
                              fontSize: '13px',
                              fontWeight: 'bold',
                              zIndex: 10
                            })
                          }}
                        />
                      </div>

                      {/* Description input */}
                      <div>
                        <label className="block text-xs font-black text-gray-650 mb-1.5">
                          توضیحات تکمیلی
                        </label>
                        <textarea
                          value={newCatDesc}
                          onChange={(e) => setNewCatDesc(e.target.value)}
                          placeholder="یک توضیح کوتاه برای این گروه بنویسید..."
                          rows={3}
                          className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-indigo-950 font-sans font-medium text-xs leading-relaxed transition-all shadow-xs resize-none"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={!newCatName}
                          onClick={() => confirmAction(
                            editingCategoryId ? 'آیا از ثبت تغییرات این گروه کالایی اطمینان دارید؟' : 'آیا از ثبت این گروه کالایی جدید اطمینان دارید؟',
                            async () => {
                              await handleSaveCategory();
                              resetCategoryForm();
                            }
                          )}
                          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-md ${
                            newCatName 
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 active:scale-98' 
                              : 'bg-indigo-100 text-indigo-400 cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-4 h-4" />
                          {editingCategoryId ? 'ذخیره تغییرات گروه' : 'ثبت گروه جدید'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Left: Interactive Categories Tree / Table (cols-8) */}
                  <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-150 shadow-sm flex flex-col overflow-hidden">
                    
                    {/* Filter and search bar in header */}
                    <div className="p-4 bg-slate-50/50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="relative w-full sm:w-72">
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="جستجو در نام یا توضیحات گروه..."
                          className="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold font-sans transition-all shadow-xs"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Search className="w-4 h-4" />
                        </div>
                        {categorySearch && (
                          <button 
                            onClick={() => setCategorySearch('')}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer p-0.5 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-400 font-bold">
                        نمایش <span className="text-indigo-600 font-black">{filteredCats.length}</span> گروه از مجموع <span className="text-slate-800 font-black">{productCategories.length}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse text-right">
                        <thead>
                          <tr className="bg-slate-50 text-gray-500 text-xs font-bold border-b border-gray-100 select-none">
                            <th className="p-4 w-[40%]">نام گروه کالایی</th>
                            <th className="p-4 w-[25%]">گروه والد</th>
                            <th className="p-4 w-[15%] text-center">تعداد محصولات</th>
                            <th className="p-4 w-[20%] text-center">عملیات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/70 text-gray-700">
                          {filteredCats.map((cat) => {
                            const isChild = !!cat.parentId;
                            const parentCat = cat.parentId ? productCategories.find(p => p.id === cat.parentId || p.id.toString() === cat.parentId?.toString()) : null;
                            const prodQty = products.filter(p => String(p.categoryId) === String(cat.id) || p.category === cat.name).length;
                            const isEditingCurrent = editingCategoryId === cat.id;

                            return (
                              <tr 
                                key={cat.id} 
                                className={`hover:bg-indigo-50/20 transition-all ${isEditingCurrent ? 'bg-indigo-50/40' : ''}`}
                              >
                                {/* Category Name */}
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    {isChild ? (
                                      <div className="flex items-center gap-1.5 mr-4 font-bold text-gray-800">
                                        <span className="text-indigo-400 font-mono select-none">└─</span>
                                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{cat.name}</span>
                                        {cat.code && <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200 leading-none">{cat.code}</span>}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 font-extrabold text-indigo-950">
                                        <Tag className="w-4 h-4 text-indigo-500" />
                                        <span>{cat.name}</span>
                                        {cat.code && <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200 leading-none">{cat.code}</span>}
                                      </div>
                                    )}
                                    {cat.description && (
                                      <span className={`text-[11px] leading-relaxed max-w-[280px] overflow-hidden text-ellipsis mr-5 block ${isChild ? 'mr-10' : 'mr-6'} text-gray-400 font-medium`}>
                                        {cat.description}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Parent Category */}
                                <td className="p-4">
                                  {parentCat ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100/30">
                                      {parentCat.name}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                      گروه اصلی
                                    </span>
                                  )}
                                </td>

                                {/* Products count badge */}
                                <td className="p-4 text-center">
                                  {prodQty > 0 ? (
                                    <span className="font-sans font-black text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100/70 px-2.5 py-1 rounded-xl transition-all border border-indigo-100/30 inline-block min-w-10">
                                      {prodQty} کالا
                                    </span>
                                  ) : (
                                    <span className="font-sans font-bold text-xs text-gray-400 bg-gray-50/50 px-2.5 py-1 rounded-xl inline-block min-w-10 border border-transparent">
                                      ۰ کالا
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="p-4">
                                  <div className="flex items-center justify-center gap-1.5 no-print">
                                    <button
                                      title="ویرایش"
                                      onClick={() => {
                                        setEditingCategoryId(cat.id);
                                        setNewCatName(cat.name);
                                        setNewCatDesc(cat.description || '');
                                        setNewCatParentId(cat.parentId || '');
                                      }}
                                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg cursor-pointer border border-transparent bg-transparent transition-all"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      title="حذف"
                                      onClick={() => confirmAction(
                                        `آیا از حذف گروه کالایی "${cat.name}" اطمینان دارید؟ با حذف گروه‌بندی، محصولات ثبت‌شده تحت این ردیف بدون دسته‌بندی می‌شوند.`,
                                        async () => {
                                          await deleteProductCategory(cat.id);
                                          setSuccessMsg('گروه‌بندی حذف شد.');
                                          const fc = await getProductCategories();
                                          setProductCategories(fc);
                                          if (editingCategoryId === cat.id) {
                                            resetCategoryForm();
                                          }
                                        }
                                      )}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg cursor-pointer border border-transparent bg-transparent transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {filteredCats.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <Tag className="w-8 h-8 text-gray-300" />
                                  <span>هیچ گروه کالایی یافت نشد.</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          }
        default:
           return <div className="text-center p-8 bg-white rounded-xl">این بخش در حال بازسازی است</div>;
    }
  };

  const renderSidebarGroups = () => (
    <div className="space-y-1 py-4 font-sans text-right">
      {filteredSidebarGroups.map((group) => {
        const hasVisibleItems = group.items.some(item => !user || item.roles.includes(user.role));
        if (!hasVisibleItems) return null;
        
        return (
          <div key={group.id} className="mb-1 px-3">
            <button 
              onClick={() => toggleGroup(group.id)} 
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
               <span className="flex items-center gap-2">
                  {group.icon} {group.label}
               </span>
               <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroups[group.id] ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
               {expandedGroups[group.id] && (
                 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-1 mt-1 border-r border-slate-700/50 mr-6 pr-3">
                       {group.items.filter(item => !user || item.roles.includes(user.role)).map(item => (
                         <button
                           key={item.id}
                           onClick={() => {
                             setActiveTab(item.id as any);
                             setIsSidebarOpen(false);
                           }}
                           className={`w-full text-right block py-2 px-3 rounded-lg text-sm transition-colors ${
                              activeTab === item.id 
                                ? 'bg-indigo-600/20 text-indigo-300 font-bold' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                           }`}
                         >
                           {item.label}
                         </button>
                       ))}
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  const renderHorizontalMenu = () => (
    <div className="flex items-center gap-1.5 px-4 pb-2 flex-wrap border-t border-gray-50 pt-2" dir="rtl">
      {filteredSidebarGroups.map((group) => {
        const visibleItems = group.items.filter(item => !user || item.roles.includes(user.role));
        if (visibleItems.length === 0) return null;
        const isActiveGroup = group.items.some(i => i.id === activeTab);
        
        return (
          <div key={group.id} className="relative group shrink-0">
            <button className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${isActiveGroup ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm' : 'text-slate-600 border-transparent hover:border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 drop-shadow-sm'}`}>
              {group.icon}
              {group.label}
              <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-1.5 z-50 transform origin-top">
              {visibleItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`text-right w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 z-[99999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm ${
              notification.type === 'success' ? 'bg-emerald-600 text-white' :
              notification.type === 'error' ? 'bg-rose-600 text-white' :
              notification.type === 'warning' ? 'bg-amber-500 text-white' :
              'bg-slate-800 text-white'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {(notification.type === 'info' || notification.type === 'warning') && <Info className="w-5 h-5" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirm Action Modal */}      {confirmState.isOpen && (        <div className="fixed inset-0 bg-slate-900/40 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">          <motion.div             initial={{ opacity: 0, scale: 0.95 }}            animate={{ opacity: 1, scale: 1 }}            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center border border-gray-100"             dir="rtl"          >            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">               <AlertTriangle className="w-6 h-6" />            </div>            <h3 className="font-extrabold text-lg mb-2">تایید عملیات</h3>            <p className="text-gray-500 text-sm text-center mb-6">{confirmState.message}</p>            <div className="flex gap-3 w-full">               <button onClick={() => { confirmState.onConfirm(); setConfirmState({...confirmState, isOpen: false}) }} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">بله، تایید</button>               <button onClick={() => setConfirmState({...confirmState, isOpen: false})} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">انصراف</button>            </div>          </motion.div>        </div>      )}

      {systemModule === 'selector' ? (
        <ModuleSelector 
          onSelectModule={(sel) => {
            setSystemModule(sel);
            if (sel === 'commerce') setActiveTab('analytical_dashboard');
            else if (sel === 'inventory') setActiveTab('inventory_report');
            else if (sel === 'accounting') setActiveTab('financial_report');
            else if (sel === 'admin') setActiveTab('settings');
            else setActiveTab('financial_report');
          }}
        />
      ) : (
      <div className={`flex ${menuLayout === 'horizontal' ? 'flex-col h-screen' : 'h-screen'} overflow-hidden bg-gray-50/50 text-gray-800 font-sans print:h-auto print:block print:overflow-visible`} dir="rtl">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] md:hidden transition-opacity print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      {menuLayout === 'vertical' && (
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 shadow-2xl z-40 text-slate-300 flex-shrink-0 transition-all duration-300 overflow-y-auto print:hidden" dir="rtl">
        <div className="p-5 border-b border-slate-800 flex flex-col justify-center">
          <div className="flex items-center gap-3">
             {storeSettings.logoUrl ? <img src={storeSettings.logoUrl} className="w-8 h-8 rounded" alt="logo"/> : <Receipt className="w-8 h-8 text-indigo-500" />}
             <div>
               <h1 className="font-extrabold text-white text-lg">{storeSettings.storeName || 'سیستم مدیریت'}</h1>
               <div className="text-xs text-slate-400 font-mono mt-0.5" dir="ltr">{localStorage.getItem('localAppVersion') || 'Build 2.9.0'}</div>
             </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {renderSidebarGroups()}
        </div>
        <div className="p-4 border-t border-slate-800">
           <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-2.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-xl font-bold transition-colors">
              <LogOut className="w-5 h-5" />
              خروج از حساب
           </button>
        </div>
      </aside>
      )}

      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-y-0 right-0 w-72 bg-slate-900 text-slate-300 shadow-2xl z-40 transform transition-transform duration-300 md:hidden flex flex-col print:hidden ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white">
            <Shield className="w-5 h-5 text-indigo-500"/>
            <span>منوی سیستم</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-800 text-slate-400 rounded-lg">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
           {renderSidebarGroups()}
        </div>
        <div className="p-4 border-t border-slate-800">
           <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-3 text-rose-400 hover:text-white bg-slate-800/50 hover:bg-rose-500/20 rounded-xl font-bold transition-colors">
              <LogOut className="w-5 h-5" />
              خروج از حساب
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full min-w-0 min-h-0 transition-all duration-300 overflow-hidden print:overflow-visible print:bg-white print:h-auto">

        


        {/* Top Header */}
        <div className="flex flex-col bg-white border-b border-gray-100 sticky top-0 z-[60] shadow-sm print:hidden">
          <div className="flex flex-row items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 shadow-xs" dir="rtl">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors cursor-pointer shadow-3xs border border-slate-100 bg-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-extrabold text-slate-900 flex items-center gap-2">
              {storeSettings.logoUrl ? (
                <img src={storeSettings.logoUrl} className={`w-6 h-6 rounded object-contain ${menuLayout === 'vertical' ? 'md:hidden' : ''}`} alt="logo"/>
              ) : (
                <Receipt className={`w-5 h-5 text-indigo-600 ${menuLayout === 'vertical' ? 'md:hidden' : ''}`} />
              )}
              <span className={`${menuLayout === 'vertical' ? 'md:hidden' : ''}`}>{storeSettings.storeName || 'سیستم مدیریت'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSystemModule('selector')}
              className="px-3 py-2 border rounded-xl transition-all cursor-pointer font-black gap-2 flex items-center text-xs shadow-3xs active:scale-95 text-slate-600 hover:text-emerald-700 bg-white border-emerald-200"
              title="تغییر ماژول کاری"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline-block">تغییر بخش کاری</span>
            </button>
            {user && (
               <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                 <div className="flex flex-col text-left">
                   <div className="text-sm font-black text-slate-800 leading-tight">{user.name}</div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase">{user.role === 'admin' ? 'مدیر سیستم' : user.role === 'accountant' ? 'حسابدار' : user.role === 'cashier' ? 'صندوق‌دار' : 'کاربر عادی'}</div>
                 </div>
                 <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black shadow-sm">
                   {user.name?.charAt(0) || <User className="w-5 h-5" />}
                 </div>
                 <button onClick={signOut} className="w-8 h-8 flex items-center justify-center mr-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="خروج از حساب">
                   <LogOut className="w-4 h-4" />
                 </button>
               </div>
            )}
            <button
              onClick={() => setMenuLayout(menuLayout === 'vertical' ? 'horizontal' : 'vertical')}
              className={`px-3 py-2 border rounded-xl transition-all cursor-pointer font-black gap-2 hidden md:flex items-center text-xs shadow-3xs active:scale-95 text-slate-600 hover:text-indigo-700 bg-white border-slate-200`}
              title={menuLayout === 'vertical' ? "نمایش منوی افقی" : "نمایش منوی عمودی"}
            >
              {menuLayout === 'vertical' ? <LayoutList className="w-4 h-4" /> : <GripHorizontal className="w-4 h-4" />}
              <span className="hidden sm:inline-block">{menuLayout === 'vertical' ? 'منوی افقی' : 'منوی عمودی'}</span>
            </button>
            <button
              onClick={() => setIsFullWidth(!isFullWidth)}
              className={`px-3 py-2 border rounded-xl transition-all cursor-pointer font-black gap-2 flex items-center text-xs shadow-3xs active:scale-95 ${isFullWidth ? 'text-indigo-700 bg-indigo-50 border-indigo-200' : 'text-slate-600 hover:text-indigo-700 hover:bg-slate-50 bg-white border-slate-200'}`}
              title={isFullWidth ? "بازگشت به نمایش کلاسیک" : "حالت تمام صفحه گسترده"}
            >
              {isFullWidth ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span className="hidden sm:inline-block">{isFullWidth ? 'نمایش کلاسیک' : 'تمام صفحه'}</span>
            </button>
          </div>
        </div>

        
          {menuLayout === 'horizontal' && renderHorizontalMenu()}
          </div>
          <main className="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 bg-slate-50/50 print:overflow-visible print:bg-white print:p-0">
          <div className={`mx-auto transition-all duration-300 print:max-w-none print:w-full print:px-0 ${isFullWidth ? 'max-w-full xl:px-14' : 'max-w-6xl'}`}>

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
                     onClick={handleGenerateDemoData}
                     disabled={submittingProduct}
                     className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg flex items-center gap-2 transition-colors text-sm font-bold"
                   >
                     <Database className="w-4 h-4" />
                     ایجاد دیتای نمونه
                   </button>
                   <div className="flex gap-1 border-l border-gray-200 pl-2 ml-2">
                     <button
                       onClick={handleExportProductsData}
                       className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors text-sm font-bold border border-slate-200"
                       title="خروجی کالاها به فایل اکسل"
                     >
                        <ArrowDownToLine className="w-4 h-4" />
                        صدور
                     </button>
                     <button
                       onClick={handleImportProductsData}
                       className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors text-sm font-bold border border-slate-200"
                       title="ورود اطلاعات کالاها از فایل اکسل"
                     >
                        <ArrowUpFromLine className="w-4 h-4" />
                        ورود
                     </button>
                   </div>
                   <button
                     onClick={() => setShowProductBarcodesList(true)}
                     className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-2 transition-colors text-sm font-bold border border-slate-200"
                   >
                     <Printer className="w-4 h-4" />
                     چاپ بارکد کالاها
                   </button>
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
                        setNewProductSecondaryUnit('');
                        setNewProductUnitRatio('');
                        setNewProductDesc('');
                        setProductFormTab('general');
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

          {/* Product Search & Filter */}
          <div className="mx-6 mt-6 space-y-4">
             <div className="relative">
               <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                 <Search className="w-5 h-5 text-gray-400" />
               </div>
               <input
                 type="text"
                 className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors text-sm text-gray-950 font-bold"
                 placeholder="جستجوی پیشرفته کالا (نام، کد، بارکد)..."
                 value={productSearchTerm}
                 onChange={(e) => setProductSearchTerm(e.target.value)}
               />
             </div>
             <div className="flex flex-wrap items-center gap-2 bg-slate-50/50 p-2 rounded-2xl border border-slate-100 flex-row-reverse justify-end">
               <span className="text-xs font-black text-slate-500 flex items-center gap-1">
                 <Tag className="w-3.5 h-3.5 text-indigo-500" />
                 فیلتر گروه:
               </span>
               <button
                 onClick={() => setSelectedProductCategory('all')}
                 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedProductCategory === 'all' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
               >
                 همه گروه‌ها
               </button>
               {productCategories.map(cat => (
                 <button
                   key={cat.id}
                   onClick={() => setSelectedProductCategory(cat.id.toString())}
                   className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedProductCategory === cat.id.toString() ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                 >
                   {cat.name}
                 </button>
               ))}
             </div>
          </div>
          
          <div className="p-0 overflow-x-auto mt-6">
            {(() => {
              const filteredProducts = products.filter(p => {
                const matchString = (p.name + ' ' + (p.code || '') + ' ' + (p.barcode || '') + ' ' + (p.description || '')).toLowerCase();
                const matchesSearch = matchString.includes(productSearchTerm.toLowerCase());
                const matchesCat = selectedProductCategory === 'all' || p.categoryId?.toString() === selectedProductCategory.toString();
                return matchesSearch && matchesCat;
              });

              const totalPages = Math.ceil(filteredProducts.length / productPageSize);
              const safeCurrentPage = Math.max(1, Math.min(productCurrentPage, totalPages));
              const paginatedProducts = filteredProducts.slice((safeCurrentPage - 1) * productPageSize, safeCurrentPage * productPageSize);

              const getPaginationItems = () => {
                const items: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) items.push(i);
                } else {
                  if (safeCurrentPage <= 4) {
                    items.push(1, 2, 3, 4, 5, '...', totalPages);
                  } else if (safeCurrentPage >= totalPages - 3) {
                    items.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    items.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
                  }
                }
                return items;
              };

              return filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>هیچ کالایی یافت نشد.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
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
                        {paginatedProducts.map((p, index) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-4 px-6 text-gray-400 font-sans text-center">
                            <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto text-[10px] font-bold shadow-sm">
                               {((safeCurrentPage - 1) * productPageSize + index + 1).toLocaleString('fa-IR')}
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
                                <span className="font-sans font-bold text-gray-700 text-base">{calculateProductCurrentStock(p.id)}</span>
                                {p.unit && <span className="text-[10px] text-gray-500">{p.unit}</span>}
                                {calculateProductCurrentStock(p.id) <= (p.minStock || 0) && (p.minStock || 0) > 0 && (
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
                                onClick={() => { setViewingProduct(p); setActiveTab('product_view'); }}
                                className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                title="مشاهده کارت کالا"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicateProduct(p)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all inline-block"
                                title="کپی کردن کالا"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
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
                                onClick={() => setPrintingBarcodeProduct(p)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all inline-block"
                                title="چاپ بارکد"
                              >
                                <Printer className="w-4 h-4" />
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
                  </div>

                  {/* Beautiful Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 rounded-xl">
                      <div className="text-xs text-slate-500 font-bold">
                        نمایش ردیف‌های <span className="text-slate-850 font-sans font-black">{((safeCurrentPage - 1) * productPageSize + 1).toLocaleString('fa-IR')}</span> تا <span className="text-slate-850 font-sans font-black">{Math.min(filteredProducts.length, safeCurrentPage * productPageSize).toLocaleString('fa-IR')}</span> از مجموع <span className="text-indigo-600 font-sans font-bold">{filteredProducts.length.toLocaleString('fa-IR')}</span> کالا یافت‌شده
                      </div>

                      <div className="flex items-center gap-1.5" dir="ltr">
                        <button
                          disabled={safeCurrentPage === 1}
                          onClick={() => setProductCurrentPage(prev => Math.max(1, prev - 1))}
                          className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 bg-white rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-3xs"
                          title="صفحه قبل"
                        >
                          <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>

                        {getPaginationItems().map((pg, idx) => {
                          if (pg === '...') {
                            return (
                              <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-black tracking-widest flex items-end pb-1">
                                ...
                              </span>
                            );
                          }
                          const isCurrent = pg === safeCurrentPage;
                          return (
                            <button
                              key={pg}
                              onClick={() => setProductCurrentPage(pg as number)}
                              className={`w-8 h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center border cursor-pointer ${
                                isCurrent
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {Number(pg).toLocaleString('fa-IR')}
                            </button>
                          );
                        })}

                        <button
                          disabled={safeCurrentPage === totalPages}
                          onClick={() => setProductCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className="p-2 border border-slate-200 hover:bg-slate-150 text-slate-600 bg-white rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-3xs"
                          title="صفحه بعد"
                        >
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </motion.div>
      ) : activeTab === 'persons' ? (
        (() => {
          const totalPages = Math.ceil(filteredPersons.length / personPageSize);
          const safeCurrentPage = Math.max(1, Math.min(personCurrentPage, totalPages));
          const paginatedPersons = filteredPersons.slice((safeCurrentPage - 1) * personPageSize, safeCurrentPage * personPageSize);

          const paginatedPersonBalances: Record<string, number> = {};
          paginatedPersons.forEach(p => {
             const pid = p.id.toString();
             const balResult = calculatePersonBalance(p.id);
             let b = balResult.amount;
             if (balResult.status === 'بستانکار') {
                b = -Math.abs(b);
             } else if (balResult.status === 'بدهکار') {
                b = Math.abs(b);
             } else {
                b = 0;
             }
             paginatedPersonBalances[pid] = b;
          });

          const getPaginationItems = () => {
            const items: (number | string)[] = [];
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) items.push(i);
            } else {
              if (safeCurrentPage <= 4) {
                items.push(1, 2, 3, 4, 5, '...', totalPages);
              } else if (safeCurrentPage >= totalPages - 3) {
                items.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
              } else {
                items.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
              }
            }
            return items;
          };

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="bg-gradient-to-l from-indigo-50/50 to-white px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-indigo-500" />
                    لیست اشخاص
                  </h1>
                  <p className="text-xs text-slate-500 font-bold mt-1">پرونده‌ی اطلاعاتی جامع مشتریان و همکاران</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGenerateMissingAccountingCodes}
                    disabled={isGeneratingCodes}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 bg-white rounded-xl flex items-center gap-2 transition-all text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
                    title="صدور کد حسابداری برای اشخاصی که کد حسابداری ندارند"
                  >
                    {isGeneratingCodes ? <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" /> : <Key className="w-4 h-4 text-indigo-500" />}
                    صدور کد حسابداری
                  </button>
                  <button
                    onClick={() => {
                      setPersonIOAction('export');
                      setIsPersonIOModalOpen(true);
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 bg-white rounded-xl flex items-center gap-2 transition-all text-xs font-black shadow-xs cursor-pointer"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                    اکسل
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingPersonId(null);
                      setNewPersonType('real');
                      setNewPersonTitle('');
                      setNewPersonAlias('');
                      setNewPersonFirstName('');
                      setNewPersonLastName('');
                      setNewPersonCompanyName('');
                      setNewPersonFatherName('');
                      setNewPersonNationalId('');
                      setNewPersonAccountingCode('');
                      setNewPersonAddress('');
                      setNewPersonPhone('');
                      setNewPersonRole('customer');
                      setNewPersonInitialBalance('');
                      setNewPersonInitialBalanceType('settled');
                      setIsPersonModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-xs font-black shadow-md shadow-indigo-200 cursor-pointer border-none"
                  >
                    <Plus className="w-4 h-4" />
                    شخص جدید
                  </button>
                </div>
              </div>
              
              {successMsg && (
                <div className="mx-6 mt-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 border border-green-100">
                  <CheckCircle className="w-5 h-5" />
                  {successMsg}
                </div>
              )}
              
              <div className="flex border-b border-gray-100 mx-6 mt-6 overflow-x-auto">
                <button
                  onClick={() => { setSelectedPersonRole('all'); setPersonCurrentPage(1); }}
                  className={`px-6 py-3 border-b-2 font-bold text-sm transition-colors cursor-pointer whitespace-nowrap outline-none ${selectedPersonRole === 'all' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  همه اشخاص
                </button>
                {personRoles.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedPersonRole(r.id); setPersonCurrentPage(1); }}
                    className={`px-6 py-3 border-b-2 font-bold text-sm transition-colors cursor-pointer whitespace-nowrap outline-none ${selectedPersonRole === r.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>

              <div className="mx-6 mt-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between animate-fade-in">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors text-sm text-gray-950 font-bold"
                    placeholder="جستجوی سریع شخص (نام، شماره تماس، کد ملی، شماره شخص، کد حسابداری، گروه)..."
                    value={personSearchTerm}
                    onChange={(e) => setPersonSearchTerm(e.target.value)}
                  />
                </div>

                {/* Group Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                  <span className="text-xs font-black text-slate-500 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    فیلتر گروه:
                  </span>
                  
                  <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-xs border border-slate-200/65">
                    <button
                      onClick={() => setSelectedPersonGroup('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border-none cursor-pointer ${
                        selectedPersonGroup === 'all'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      همه ({persons.length.toLocaleString('fa-IR')})
                    </button>
                    
                    <button
                      onClick={() => setSelectedPersonGroup('none')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border-none cursor-pointer ${
                        selectedPersonGroup === 'none'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      بدون گروه ({persons.filter(p => !p.group || p.group.trim() === '').length.toLocaleString('fa-IR')})
                    </button>

                    {personGroups.slice(0, 4).map((g) => {
                      const count = persons.filter(p => p.group === g.id).length;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setSelectedPersonGroup(g.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border-none cursor-pointer ${
                            selectedPersonGroup === g.id
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                          }`}
                        >
                          {g.name} ({count.toLocaleString('fa-IR')})
                        </button>
                      );
                    })}

                    {personGroups.length > 4 && (
                      <select
                        value={selectedPersonGroup !== 'all' && selectedPersonGroup !== 'none' && personGroups.find(g => g.id === selectedPersonGroup) ? selectedPersonGroup : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedPersonGroup(e.target.value);
                          }
                        }}
                        className="bg-slate-50 border border-slate-200 font-extrabold text-xs text-slate-800 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>گروه‌های بیشتر...</option>
                        {personGroups.slice(4).map((g) => {
                          const count = persons.filter(p => p.group === g.id).length;
                          return (
                            <option key={g.id} value={g.id}>{g.name} ({count.toLocaleString('fa-IR')} نفر)</option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-0 overflow-x-auto mt-4">
                {filteredPersons.length === 0 ? (
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
                        <th className="py-4 px-6 text-center">کد حسابداری</th>
                        <th className="py-4 px-6 text-right">نام / عنوان</th>
                        <th className="py-4 px-6 text-right">گروه شخص</th>
                        <th className="py-4 px-6 text-right">نوع کاربر</th>
                        <th className="py-4 px-6 text-right">کد / شناسه ملی</th>
                        <th className="py-4 px-6 text-right">نقش</th>
                        <th className="py-4 px-6 text-right">شماره تماس</th>
                        <th className="py-4 px-6 text-right">در حساب / مانده</th>
                        <th className="py-4 px-6 w-24">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedPersons.map((p, index) => (
                        <tr 
                          key={p.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer group"
                          onClick={() => setDrawerPersonId(p.id)}
                        >
                          <td className="py-4 px-6 text-gray-500 w-16 text-center font-sans font-bold text-xs">
                            {((safeCurrentPage - 1) * personPageSize + index + 1).toLocaleString('fa-IR')}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {p.personCode ? (
                              <span className="font-sans font-black bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-xl text-xs">{toPersianDigits(p.personCode)}</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {p.accountingCode ? (
                              <span className="font-mono text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-md">{toPersianDigits(p.accountingCode)}</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-semibold text-gray-900 border-r-2 border-transparent hover:border-indigo-500">
                            <div className="flex flex-col">
                              <span>{p.alias || p.name}</span>
                              {p.alias && p.alias !== p.name && (
                                <span className="text-[10px] text-gray-400 font-normal">{p.name}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm">
                            {p.group ? (
                              (() => {
                                const g = personGroups.find(grp => grp.id === p.group);
                                if (!g) return <span className="text-slate-350 select-none text-xs font-bold">بدون گروه</span>;
                                
                                let bg = 'bg-slate-100';
                                let text = 'text-slate-600';
                                let border = 'border-slate-200';
                                if (g.color === 'indigo') { bg = 'bg-indigo-50'; text = 'text-indigo-800'; border = 'border-indigo-100'; }
                                else if (g.color === 'emerald') { bg = 'bg-emerald-50'; text = 'text-emerald-800'; border = 'border-emerald-100'; }
                                else if (g.color === 'amber') { bg = 'bg-amber-50'; text = 'text-amber-800'; border = 'border-amber-100'; }
                                else if (g.color === 'rose') { bg = 'bg-rose-50'; text = 'text-rose-800'; border = 'border-rose-100'; }
                                else if (g.color === 'purple') { bg = 'bg-purple-50'; text = 'text-purple-800'; border = 'border-purple-100'; }
                                else if (g.color === 'cyan') { bg = 'bg-cyan-50'; text = 'text-cyan-800'; border = 'border-cyan-100'; }

                                return (
                                  <span className={`inline-flex items-center gap-1 ${bg} ${text} border ${border} px-2.5 py-1 rounded-xl text-xs font-black shadow-3xs`}>
                                    <Tag className={`w-3 h-3 ${g.color ? `text-${g.color}-500` : 'text-slate-500'}`} />
                                    {g.name}
                                  </span>
                                );
                              })()
                            ) : (
                              <span className="text-slate-350 select-none text-xs font-bold">بدون گروه</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm">
                            {p.personType === 'legal' ? 'حقوقی' : 'حقیقی'}
                          </td>
                          <td className="py-4 px-6 text-slate-700 font-sans font-bold text-xs">
                            {p.nationalId ? toPersianDigits(p.nationalId) : '-'}
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm">
                            <span className={`px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-bold text-xs ${getRoleBadgeClasses(p.role)}`}>
                              {getRoleName(p.role)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-700 font-sans font-bold text-xs">
                            {p.phone ? toPersianDigits(p.phone) : '-'}
                          </td>
                          <td className="py-4 px-6 text-sm" dir="rtl">
                            {(() => {
                              const bal = paginatedPersonBalances[p.id.toString()] || 0;
                              if (bal === 0) {
                                return <span className="text-slate-400 font-sans font-black text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-xl">تسویه (۰)</span>;
                              } else if (bal > 0) {
                                return <span className="text-rose-600 font-black tracking-tight inline-flex items-center gap-1 bg-rose-50 border border-rose-100/40 px-2 py-1 rounded-xl"><span className="font-sans text-xs">{toPersianDigits(formatNumber(bal))}</span> <span className="text-[9px] text-rose-500 font-bold">بدهکار</span></span>;
                              } else {
                                return <span className="text-emerald-600 font-black tracking-tight inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100/40 px-2 py-1 rounded-xl"><span className="font-sans text-xs">{toPersianDigits(formatNumber(Math.abs(bal)))}</span> <span className="text-[9px] text-emerald-500 font-bold">بستانکار</span></span>;
                              }
                            })()}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDrawerPersonId(p.id);
                                }}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                                title="پیش‌نمایش سریع حساب"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLedgerPersonId(p.id);
                                  setActiveTab('person_ledger');
                                }}
                                className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors inline-block"
                                title="مشاهده کارت حساب تخصصی"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPersonExtraId(p.id);
                                  setPersonBankName(p.bankName || '');
                                  setPersonBankAcc(p.bankAccountNumber || '');
                                  setPersonCard(p.cardNumber || '');
                                  setPersonSheba(p.shebaNumber || '');
                                  setPersonNotes(p.additionalNotes || '');
                                  setIsPersonExtraModalOpen(true);
                                }}
                                className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors inline-block"
                                title="اطلاعات تکمیلی بانکی"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPerson(p);
                                }}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                                title="ویرایش شخص"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmAction('آیا از حذف این شخص اطمینان دارید؟', () => handleDeletePerson(p.id));
                                }}
                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block"
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

              {/* Beautiful Pagination Footer */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                  <div className="text-xs text-slate-500 font-bold">
                    نمایش ردیف‌های <span className="text-slate-850 font-sans font-black">{( (safeCurrentPage - 1) * personPageSize + 1 ).toLocaleString('fa-IR')}</span> تا <span className="text-slate-850 font-sans font-black">{Math.min(filteredPersons.length, safeCurrentPage * personPageSize).toLocaleString('fa-IR')}</span> از مجموع <span className="text-indigo-600 font-sans font-bold">{filteredPersons.length.toLocaleString('fa-IR')}</span> شخص یافت‌شده
                  </div>

                  <div className="flex items-center gap-1.5" dir="ltr">
                    <button
                      disabled={safeCurrentPage === 1}
                      onClick={() => setPersonCurrentPage(prev => Math.max(1, prev - 1))}
                      className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 bg-white rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-3xs"
                      title="صفحه قبل"
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>

                    {getPaginationItems().map((pg, idx) => {
                      if (pg === '...') {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-black tracking-widest flex items-end pb-1">
                            ...
                          </span>
                        );
                      }
                      const isCurrent = pg === safeCurrentPage;
                      return (
                        <button
                          key={pg}
                          onClick={() => setPersonCurrentPage(pg as number)}
                          className={`w-8 h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center border cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {Number(pg).toLocaleString('fa-IR')}
                        </button>
                      );
                    })}

                    <button
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => setPersonCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="p-2 border border-slate-200 hover:bg-slate-150 text-slate-600 bg-white rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-3xs"
                      title="صفحه بعد"
                    >
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">تعداد در صفحه:</span>
                    <select
                      value={personPageSize}
                      onChange={(e) => setPersonPageSize(Number(e.target.value))}
                      className="bg-transparent border-none text-xs font-extrabold text-indigo-700 outline-none cursor-pointer focus:ring-0"
                    >
                      <option value={10}>۱۰ شخص</option>
                      <option value={20}>۲۰ شخص</option>
                      <option value={50}>۵۰ شخص</option>
                      <option value={100}>۱۰۰ شخص</option>
                    </select>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()
      ) : activeTab === 'person_groups' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-l from-indigo-50/50 to-white px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="w-6 h-6 text-indigo-500" />
                  مدیریت گروه‌های اشخاص
                </h1>
                <p className="text-xs text-slate-500 font-bold mt-1">دسته‌بندی سفارشی برای مشتریان، تامین‌کنندگان، همکاران و کارمندان</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-4">{editingPersonGroupId ? 'ویرایش گروه' : 'ثبت گروه جدید'}</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newPersonGroupName}
                  onChange={(e) => setNewPersonGroupName(e.target.value)}
                  placeholder="نام گروه (مثلا خریداران عمده)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 font-bold text-sm"
                />
              </div>
              <div>
                <select
                  value={newPersonGroupColor}
                  onChange={(e) => setNewPersonGroupColor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-sm text-slate-800 h-full"
                >
                  <option value="indigo">نیلی (Indigo)</option>
                  <option value="emerald">سبز (Emerald)</option>
                  <option value="amber">زرد (Amber)</option>
                  <option value="rose">قرمز (Rose)</option>
                  <option value="purple">بنفش (Purple)</option>
                  <option value="cyan">فیروزه‌ای (Cyan)</option>
                </select>
              </div>
              <button
                onClick={handleSavePersonGroup}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 justify-center"
              >
                {editingPersonGroupId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingPersonGroupId ? 'ذخیره تغییرات' : 'افزودن گروه'}
              </button>
              {editingPersonGroupId && (
                <button
                  onClick={() => {
                    setEditingPersonGroupId(null);
                    setNewPersonGroupName('');
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  انصراف
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {personGroups.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold text-sm">هیچ گروهی ثبت نشده است.</div>
            ) : (
              <table className="w-full text-right whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-black">
                    <th className="py-4 px-6 w-16">رنگبندی</th>
                    <th className="py-4 px-6 w-full">نام گروه</th>
                    <th className="py-4 px-6 text-center">تعداد اشخاص</th>
                    <th className="py-4 px-6 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {personGroups.map(g => {
                    const count = persons.filter(p => p.group === g.id).length;
                    let bg = 'bg-slate-100';
                    let text = 'text-slate-600';
                    if (g.color === 'indigo') { bg = 'bg-indigo-100'; text = 'text-indigo-600'; }
                    else if (g.color === 'emerald') { bg = 'bg-emerald-100'; text = 'text-emerald-600'; }
                    else if (g.color === 'amber') { bg = 'bg-amber-100'; text = 'text-amber-600'; }
                    else if (g.color === 'rose') { bg = 'bg-rose-100'; text = 'text-rose-600'; }
                    else if (g.color === 'purple') { bg = 'bg-purple-100'; text = 'text-purple-600'; }
                    else if (g.color === 'cyan') { bg = 'bg-cyan-100'; text = 'text-cyan-600'; }

                    return (
                      <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className={`w-6 h-6 rounded-lg ${bg} shadow-inner`}></div>
                        </td>
                        <td className="py-4 px-6 font-bold text-sm text-slate-900">{g.name}</td>
                        <td className="py-4 px-6 text-center font-black text-xs text-slate-500">{count} نفر</td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingPersonGroupId(g.id);
                                setNewPersonGroupName(g.name);
                                setNewPersonGroupColor(g.color || 'indigo');
                              }}
                              className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="ویرایش گروه"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePersonGroup(g.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف گروه"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : activeTab === 'person_roles' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-l from-indigo-50/50 to-white px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="w-6 h-6 text-indigo-500" />
                  مدیریت نقش‌های ارتباطی اشخاص
                </h1>
                <p className="text-xs text-slate-500 font-bold mt-1">تعریف نقش‌ها (مثل راننده، بازاریاب) و مدیریت کدهای پیش‌فرض برای صدور کد اشخاص</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-4">{editingPersonRoleId ? 'ویرایش نقش' : 'ثبت نقش جدید'}</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-[2]">
                <input
                  type="text"
                  value={newPersonRoleName}
                  onChange={(e) => setNewPersonRoleName(e.target.value)}
                  placeholder="عنوان نقش (مثلا راننده پایانه)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 font-bold text-sm"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newPersonRoleCode}
                  onChange={(e) => setNewPersonRoleCode(e.target.value)}
                  placeholder="کد پیش‌فرض (مثلا 40)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 font-bold text-sm"
                />
              </div>
              <button
                onClick={handleSavePersonRole}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 justify-center"
              >
                {editingPersonRoleId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingPersonRoleId ? 'ذخیره تغییرات' : 'افزودن نقش'}
              </button>
              {editingPersonRoleId && (
                <button
                  onClick={() => {
                    setEditingPersonRoleId(null);
                    setNewPersonRoleName('');
                    setNewPersonRoleCode('');
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  انصراف
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {personRoles.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold text-sm">هیچ نقشی ثبت نشده است.</div>
            ) : (
              <table className="w-full text-right whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-black">
                    <th className="py-4 px-6 w-full">عنوان نقش</th>
                    <th className="py-4 px-6 text-center">کد پایه (Prefix)</th>
                    <th className="py-4 px-6 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {personRoles.map(g => (
                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-sm text-slate-900">{g.name}</td>
                      <td className="py-4 px-6 text-center font-mono font-black text-xs text-indigo-600">{g.code}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingPersonRoleId(g.id);
                              setNewPersonRoleName(g.name);
                              setNewPersonRoleCode(g.code);
                            }}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="ویرایش نقش"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePersonRole(g.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف نقش"
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
      ) : activeTab === 'warehouses' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Header with Switcher Tab */}
          <div className="bg-gradient-to-l from-indigo-50 to-white px-8 py-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Box className="w-6 h-6 text-indigo-600" />
                  {warehouseSubTab === 'list' ? 'مدیریت و شعب انبارها' : 'موجودی و موازنه کالاها'}
                </h1>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  {warehouseSubTab === 'list' 
                    ? 'مدیریت انبارهای فیزیکی، شعبه‌ها و مسیرهای نگهداری کالا' 
                    : 'مشاهده و موازنه دقیق‌ترین موجودی لحظه‌ای فیزیکی، رزرو شده و آماده فروش کالاها'}
                </p>
              </div>

              {/* Sub-tab segment bar */}
              <div className="flex gap-1.5 bg-indigo-150 p-1.5 rounded-xl border border-indigo-150/40">
                <button
                  type="button"
                  onClick={() => setWarehouseSubTab('list')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${warehouseSubTab === 'list' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-800 hover:bg-indigo-200/50'}`}
                >
                  شعبه‌ها و انبارها
                </button>
                <button
                  type="button"
                  onClick={() => setWarehouseSubTab('stocks')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${warehouseSubTab === 'stocks' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-800 hover:bg-indigo-200/50'}`}
                >
                  تراز موجودی انبارها
                </button>
              </div>
            </div>

            {warehouseSubTab === 'list' ? (
              <button
                type="button"
                onClick={() => {
                  setEditingWarehouseId(null);
                  setNewWarehouseName('');
                  setNewWarehouseManager('');
                  setNewWarehouseLocation('');
                  setNewWarehouseIsActive(true);
                  setIsWarehouseModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm font-semibold self-start lg:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                انبار جدید
              </button>
            ) : (
              <button
                type="button"
                disabled={recalculating}
                onClick={handleRecalculateStocks}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm font-semibold self-start lg:self-auto cursor-pointer"
                title="محاسبه مجدد موجودی بر اساس اسناد رسید و حواله"
              >
                <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
                محاسبه مجدد موجودی انبارها
              </button>
            )}
          </div>

          {/* Sub-tab panels */}
          {warehouseSubTab === 'list' ? (
            <div className="overflow-x-auto">
              {warehouses.length === 0 ? (
                <div className="py-12 text-center text-gray-500 font-medium">
                  هیچ انباری ثبت نشده است. برای شروع یک انبار جدید ثبت کنید.
                </div>
              ) : (
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                      <th className="py-4 px-6 font-semibold">ردیف</th>
                      <th className="py-4 px-6 font-semibold">نام انبار</th>
                      <th className="py-4 px-6 font-semibold">مسئول انبار</th>
                      <th className="py-4 px-6 font-semibold">موقعیت / مکان</th>
                      <th className="py-4 px-6 font-semibold">وضعیت فعالیت</th>
                      <th className="py-4 px-6 font-semibold text-center w-24">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {warehouses.map((wh, index) => (
                      <tr key={wh.id} className="hover:bg-gray-50/50 transition-colors text-gray-700">
                        <td className="py-4 px-6 font-medium text-gray-400">{index + 1}</td>
                        <td className="py-4 px-6 font-semibold text-gray-950">
                          <span className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-indigo-500" />
                            {wh.name}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">{wh.manager || '-'}</td>
                        <td className="py-4 px-6 text-sm">{wh.location || '-'}</td>
                        <td className="py-4 px-6 text-sm">
                          {wh.isActive ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">فعال</span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-bold">غیرفعال</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditWarehouse(wh)}
                              className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors inline-block cursor-pointer"
                              title="ویرایش انبار"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmAction('آیا از حذف این انبار اطمینان دارید؟', () => handleDeleteWarehouse(wh.id))}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block cursor-pointer"
                              title="حذف انبار"
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
          ) : (
            <div>
              {/* Search Stocks bar */}
              <div className="p-5 border-b border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 max-w-md relative">
                  <span className="absolute inset-y-0 right-3 flex items-center pr-1 text-gray-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={whStockSearch}
                    onChange={e => setWhStockSearch(e.target.value)}
                    placeholder="جستجوی سریع بر اساس کالا یا انبار..."
                    className="w-full pr-10 pl-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                
                <div className="text-right text-xs text-gray-400 font-bold">
                  تعداد رکوردهای تراز: <span className="text-indigo-650 font-black font-sans">{
                    warehouseStocks.filter(stock => {
                      const prodName = products.find(p => p.id?.toString() === stock.productId?.toString())?.name || '';
                      const whName = warehouses.find(w => w.id?.toString() === stock.warehouseId?.toString())?.name || '';
                      const searchLower = whStockSearch.toLowerCase();
                      return prodName.toLowerCase().includes(searchLower) || whName.toLowerCase().includes(searchLower);
                    }).length
                  }</span> کالا-انبار
                </div>
              </div>

              {/* Recalculated stock logs table */}
              <div className="overflow-x-auto">
                {(() => {
                  const filteredStocks = warehouseStocks.filter(stock => {
                    const prodName = products.find(p => p.id?.toString() === stock.productId?.toString())?.name || '';
                    const whName = warehouses.find(w => w.id?.toString() === stock.warehouseId?.toString())?.name || '';
                    const searchLower = whStockSearch.toLowerCase();
                    return prodName.toLowerCase().includes(searchLower) || whName.toLowerCase().includes(searchLower);
                  });

                  if (filteredStocks.length === 0) {
                    return (
                      <div className="py-12 text-center text-gray-500 font-medium">
                        {whStockSearch ? 'هیچ رکوردی منطبق با عبارت جستجو پیدا نشد.' : 'هیچ رکورد موجودی ثبت نشده است. ابتدا اسناد ورود و خروج ثبت کنید.'}
                      </div>
                    );
                  }

                  return (
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                          <th className="py-4 px-6 font-semibold w-16 text-center">ردیف</th>
                          <th className="py-4 px-6 font-semibold">نام کالا</th>
                          <th className="py-4 px-6 font-semibold">انبار ذخیره‌سازی</th>
                          <th className="py-4 px-6 font-semibold text-center bg-gray-100/30">موجودی فیزیکی</th>
                          <th className="py-4 px-6 font-semibold text-center bg-amber-50/20">رزرو شده</th>
                          <th className="py-4 px-6 font-semibold text-center bg-emerald-50/20 text-emerald-900">آماده فروش و تحویل</th>
                          <th className="py-4 px-6 font-semibold text-center w-28">واحد</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-sans font-bold">
                        {filteredStocks.map((stock, index) => {
                          const associatedProd = products.find(p => p.id?.toString() === stock.productId?.toString());
                          const associatedWh = warehouses.find(w => w.id?.toString() === stock.warehouseId?.toString());
                          
                          // Highlight low stock
                          const isNegative = stock.availableStock < 0; 
                          const isZero = stock.availableStock === 0;

                          return (
                            <tr key={`${stock.productId}-${stock.warehouseId}`} className="hover:bg-slate-50/50 transition-colors text-gray-700">
                              <td className="py-4 px-6 text-center text-gray-400 font-medium">{index + 1}</td>
                              <td className="py-4 px-6 text-gray-950 font-semibold">
                                <span className="flex flex-col">
                                  <span className="font-extrabold text-slate-900">{associatedProd?.name || 'کالای ناشناخته'}</span>
                                  {associatedProd?.code && <span className="text-[10px] text-gray-400 mt-0.5">کد کالا: {associatedProd.code}</span>}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-indigo-900">
                                <span className="flex items-center gap-1.5 text-xs text-indigo-950">
                                  <Box className="w-3.5 h-3.5 text-indigo-500" />
                                  {associatedWh?.name || 'انبار صادرکننده'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center bg-gray-100/10 font-bold text-gray-800 text-sm">
                                {formatNumber(stock.physicalStock)}
                              </td>
                              <td className="py-4 px-6 text-center bg-amber-50/10 font-bold text-amber-700 text-sm">
                                {formatNumber(stock.reservedStock)}
                              </td>
                              <td className={`py-4 px-6 text-center font-black text-sm bg-emerald-50/10 ${
                                isNegative ? 'text-red-650 bg-rose-50/30' :
                                isZero ? 'text-gray-400' : 'text-emerald-700'
                              }`}>
                                <span className="inline-flex items-center gap-1.5">
                                  {formatNumber(stock.availableStock)}
                                  {isNegative && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">کسری موجودی</span>}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center text-xs text-gray-500">
                                {associatedProd?.unit || 'عدد'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          )}
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
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                 <span className="text-xs font-bold text-gray-500">بازه زمانی:</span>
                 <DatePicker
                   range
                   dateSeparator=" تا "
                   value={reportDateRange as any}
                   onChange={setReportDateRange as any}
                   calendar={storeSettings?.calendarType === 'gregorian' ? undefined : persian}
                   locale={storeSettings?.calendarType === 'gregorian' ? undefined : persian_fa}
                   calendarPosition="bottom-right"
                   inputClass="text-sm font-bold text-indigo-700 bg-transparent border-none outline-none max-w-[170px] text-center"
                   placeholder="انتخاب بازه تاریخ..."
                 />
                 {reportDateRange && reportDateRange.length > 0 && (
                   <button onClick={() => setReportDateRange([])} className="text-gray-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
                 )}
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
          </div>

          {/* Upcoming Checks Notification */}
          {(() => {
            const normalizeDateStr = (dStr: string) => {
              if (!dStr) return 0;
              const englishDStr = dStr.replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
              const parts = englishDStr.split(/[/-]/).map(p => p.padStart(2, '0'));
              if (parts.length === 3) return parseInt(parts[0] + parts[1] + parts[2], 10);
              return 0;
            };

            const today = new Date();
            const startStr = today.toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
            
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 3);
            const endStr = maxDate.toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });

            const startNorm = normalizeDateStr(startStr);
            const endNorm = normalizeDateStr(endStr);
            
            const upcomingIssued = issuedChecks.filter((c: any) => {
              if (['cashed', 'bounced', 'cancelled'].includes(c.status)) return false;
              const n = normalizeDateStr(c.dueDate);
              return n >= startNorm && n <= endNorm;
            });
            const upcomingReceived = receivedChecks.filter((c: any) => {
              if (['cashed', 'deposited', 'bounced', 'returned'].includes(c.status)) return false;
              const n = normalizeDateStr(c.dueDate);
              return n >= startNorm && n <= endNorm;
            });
            
            const totalUpcoming = upcomingIssued.length + upcomingReceived.length;

            if (totalUpcoming > 0) {
              return (
                <div 
                  onClick={() => setActiveTab('check_calendar')}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
                      <AlertCircle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-amber-900 font-extrabold text-sm flex items-center gap-2">
                        هشدار سررسید چک‌ها (تا ۳ روز آینده)
                        <span className="bg-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{toPersianDigits(totalUpcoming)} مورد</span>
                      </h4>
                      <p className="text-amber-700 text-xs font-semibold mt-1">
                        شما {toPersianDigits(totalUpcoming)} چک در ۳ روز آینده دارای سررسید دارید ({toPersianDigits(upcomingIssued.length)} پرداختی و {toPersianDigits(upcomingReceived.length)} دریافتی). برای مشاهده تقویم سررسید کلیک کنید.
                      </p>
                    </div>
                  </div>
                  <div className="text-amber-500 bg-amber-100/50 p-2 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    invoices.filter(inv => (inv.type === 'sale' || inv.type === 'sale_return') && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.type === 'sale' ? (inv.totalAmount || 0) : -(inv.totalAmount || 0)) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0)
                  )}{' '}
                  <span className="text-xs font-medium text-gray-500">{storeSettings.currency}</span>
                </span>
                <span className="text-xs text-indigo-600 font-bold mt-1 block">
                  {formatNumber(invoices.filter(inv => inv.type === 'sale' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).length)} فاکتور فروش ثبت شده
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
                    invoices.filter(inv => (inv.type === 'purchase' || inv.type === 'purchase_return') && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.type === 'purchase' ? (inv.totalAmount || 0) : -(inv.totalAmount || 0)) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0)
                  )}{' '}
                  <span className="text-xs font-medium text-gray-500">{storeSettings.currency}</span>
                </span>
                <span className="text-xs text-amber-600 font-bold mt-1 block">
                  {formatNumber(invoices.filter(inv => inv.type === 'purchase' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).length)} فاکتور خرید ثبت شده
                </span>
              </div>
            </div>

            {/* Net Difference Card */}
            {(() => {
              const salesValRaw = invoices.filter(inv => inv.type === 'sale' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);
              const salesReturnVal = invoices.filter(inv => inv.type === 'sale_return' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);
              const salesVal = salesValRaw - salesReturnVal;
              /* && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);
              */
              const purchasesValRaw = invoices.filter(inv => inv.type === 'purchase' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);
              const purchasesReturnVal = invoices.filter(inv => inv.type === 'purchase_return' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);
              const purchasesVal = purchasesValRaw - purchasesReturnVal;
              /* && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);
              */
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

            {/* Due Checks Today Card */}
            {(() => {
              const todayStr = new Date().toLocaleDateString('fa-IR');
              const dueIssued = issuedChecks.filter((c: any) => c.dueDate === todayStr).length;
              const dueReceived = receivedChecks.filter((c: any) => c.dueDate === todayStr).length;
              const totalDue = dueIssued + dueReceived;

              return (
                <div 
                  onClick={() => setActiveTab('check_calendar')}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${totalDue > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                  <div className={`p-3.5 rounded-2xl transition-colors ${totalDue > 0 ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-gray-400">چک‌های سررسیده امروز</h3>
                    <span className={`text-xl font-extrabold block mt-1 ${totalDue > 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                      {totalDue} <span className="text-sm font-medium text-gray-500">مورد</span>
                    </span>
                    <span className="text-xs font-bold mt-1 block text-gray-500">
                      {dueIssued} پرداختی | {dueReceived} دریافتی
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
                  {formatNumber(transactions.filter(t => t.type === 'receive' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(t.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(t.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, t) => sum + (t.amount || 0), 0))} {storeSettings.currency}
                </span>
              </div>
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 flex justify-between items-center">
                <div>
                  <span className="text-xs text-rose-800 font-bold block">مجموع پرداخت‌ها (رسید پرداخت)</span>
                  <span className="text-[10px] text-gray-500 font-semibold">(آمارهای حاصل از اسناد پرداختی صادره)</span>
                </div>
                <span className="text-lg font-black text-rose-700 font-sans">
                  {formatNumber(transactions.filter(t => t.type === 'pay' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(t.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(t.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, t) => sum + (t.amount || 0), 0))} {storeSettings.currency}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              * ارقام مربوط به گردش اسناد براساس مبالغ ثبت شده در رسیدهای دریافت و پرداخت رسمی صادر شده در بخش خزانه‌داری محاسبه شده و مستقیماً روی تراز مالی صندوق‌ها و حساب‌های بانکی بالا اثرگذار بوده‌اند.
            </p>
          </div>

          {/* Checks Dashboard Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
            <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              آمار زمان‌بندی و وضعیت چک‌ها بر اساس سررسید
            </h3>
            
            {(() => {
              const allC = [
                ...receivedChecks.map(c => ({ ...c, type: 'receive', isPending: c.status === 'pending' })),
                ...issuedChecks.map(c => ({ ...c, type: 'issue', isPending: c.status === 'pending' }))
              ];
              
              if (allC.length === 0) {
                 return <p className="text-sm text-gray-500 py-4 text-center">هیچ چکی در سیستم ثبت نشده است.</p>;
              }
              
              const groups: Record<string, any> = {};
              allC.forEach(c => {
                 const d = c.dueDate || 'نامشخص';
                 if (!groups[d]) {
                    groups[d] = {
                       name: d,
                       receivedAmount: 0,
                       issuedAmount: 0,
                       pendingReceivedCount: 0,
                       pendingIssuedCount: 0
                    };
                 }
                 if (c.type === 'receive') {
                    groups[d].receivedAmount += c.amount || 0;
                    if (c.isPending) groups[d].pendingReceivedCount += 1;
                 } else {
                    groups[d].issuedAmount += c.amount || 0;
                    if (c.isPending) groups[d].pendingIssuedCount += 1;
                 }
              });
              
              let chartData = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
              
              return (
                 <div className="w-full h-80 mt-4" dir="ltr">
                   <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                       <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6B7280'}} tickMargin={10} />
                       <YAxis yAxisId="left" tickFormatter={(val) => Math.abs(val) > 999 ? (val/1000).toFixed(0)+'k' : val} tick={{fontSize: 12, fill: '#6B7280'}} />
                       <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} />
                       <RechartsTooltip 
                         formatter={(value: any, name: string) => {
                            if (name === 'مبلغ دریافتی' || name === 'مبلغ پرداختی') return [addCommas(value) + ' ' + (storeSettings?.currency || 'تومان'), name];
                            return [value, name];
                         }}
                         labelStyle={{ fontWeight: 'bold', color: '#374151', textAlign: 'right' }}
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'right' }}
                       />
                       <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                       <Bar yAxisId="left" dataKey="receivedAmount" name="مبلغ دریافتی" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                       <Bar yAxisId="left" dataKey="issuedAmount" name="مبلغ پرداختی" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={40} />
                       <Line yAxisId="right" type="monotone" dataKey="pendingReceivedCount" name="تعداد وصول‌نشده دریافتی" stroke="#059669" strokeWidth={3} dot={{r: 4}} />
                       <Line yAxisId="right" type="monotone" dataKey="pendingIssuedCount" name="تعداد وصول‌نشده پرداختی" stroke="#E11D48" strokeWidth={3} dot={{r: 4}} />
                     </ComposedChart>
                   </ResponsiveContainer>
                 </div>
              );
            })()}
          </div>
        </motion.div>
      ) : activeTab === 'person_ledger' ? (
        /* Contact/Person Ledger Card View (کارت حساب اشخاص) */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-right print:p-0 print:bg-white print:min-h-screen"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-indigo-50 to-white rounded-2xl shadow-sm border border-gray-100 px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6 text-violet-600 font-bold" />
                کارت حساب و دفتر معین اشخاص
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                گزارش یکپارچه و به ترتیب زمان از تمام فاکتورهای فروش/خرید و رسیدهای دریافت/پرداخت هر یک از طرف حساب‌ها
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!ledgerPersonId) {
                    customAlert('ابتدا یک شخص را انتخاب کنید.');
                    return;
                  }
                  const person = persons.find(p => p.id.toString() === ledgerPersonId.toString());
                  if (person && person.phone) {
                    if (storeSettings?.notify_method === 'none' || !storeSettings?.notify_method) {
                        customAlert('ارسال پیامک تنظیم نشده است. ابتدا به تنظیمات بروید.');
                        return;
                    }
                    sendNotification(`${person.name} گرامی، به استحضار می رساند مانده حساب شما در سیستم ${storeSettings?.storeName || 'ما'} بررسی و یادآوری می‌گردد. لطفا در صورت امکان جهت تسویه حساب اقدام فرمایید.`, person.phone, storeSettings?.notify_method);
                  } else {
                    customAlert('شماره تماس این شخص در سیستم ثبت نشده است.');
                  }
                }}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl flex items-center gap-2 transition-all font-semibold text-sm border border-emerald-100 shadow-sm"
              >
                <span className="text-lg">💬</span>
                یادآوری پیامکی
              </button>
              <button
                onClick={() => {
                   setPrintingPersonLedger(true);
                   setTimeout(() => {
                      window.print();
                      setTimeout(() => setPrintingPersonLedger(false), 500);
                   }, 300);
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl flex items-center gap-2 transition-all font-semibold text-sm border border-indigo-100 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                چاپ حساب
              </button>
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
          </div>

          {/* Selector Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:hidden">
            <div className="max-w-xl">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-violet-500" />
                شخص مورد نظر را انتخاب کنید:
              </label>
              <Select
                isRtl
                value={ledgerPersonId ? (persons.find(p => p.id.toString() === ledgerPersonId.toString()) ? mapPersonToOption(persons.find(p => p.id.toString() === ledgerPersonId.toString())!) : null) : null}
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
              .filter(inv => inv.customerId?.toString() === ledgerPersonId.toString() && inv.type !== 'warehouse_receipt' && inv.type !== 'warehouse_remittance')
              .map(inv => {
                const isSale = inv.type === 'sale';
                  const isProforma = inv.type === 'proforma';
                  const amount = (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency);
                  const itemsSummary = inv.items && inv.items.length > 0
                    ? ` (شامل: ${inv.items.map((it: any) => it.name).join('، ')})`
                    : '';
                  const baseDesc = inv.title || (inv.type === 'proforma' ? 'ثبت پیش‌فاکتور' : (inv.type === 'purchase' ? 'خرید طی فاکتور' : inv.type === 'purchase_return' ? 'برگشت از خرید' : inv.type === 'sale_return' ? 'برگشت از فروش' : 'فروش طی فاکتور'));
                return {
                  id: `inv-${inv.id}`,
                  refId: inv.invoiceNumber || `#${inv.id}`,
                  date: inv.date,
                  jalaliDate: inv.jalaliDate || new Date(inv.date).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'),
                  type: inv.type === 'proforma' ? 'پیش‌فاکتور' : inv.type === 'purchase_return' ? 'برگشت از خرید' : inv.type === 'sale_return' ? 'برگشت از فروش' : (inv.type === 'purchase' ? 'فاکتور خرید کالا' : 'فاکتور فروش کالا'),
                  desc: `${baseDesc}${itemsSummary}`,
                  debit: (isSale && !isProforma) ? amount : 0,  // Sale increases how much they owe us
                  credit: (!isSale && !isProforma) ? amount : 0, // Purchase decreases how much they owe us
                  rawItem: inv,
                  entryType: 'invoice'
                };
              });

            // Transactions
            const transactionEntries = transactions
              .filter(t => t.personId?.toString() === ledgerPersonId.toString() && t.method !== 'check')
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
                  refId: t.receiptNumber || `سند #${t.id}`,
                  date: t.date,
                  jalaliDate: t.jalaliDate || new Date(t.date).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'),
                  type: typeLabel,
                  desc: finalDesc,
                  debit,
                  credit,
                  rawItem: t,
                  entryType: 'transaction'
                };
              });

            // Issued Checks
            const issuedCheckEntries = issuedChecks
              .filter(c => c.payeeId?.toString() === ledgerPersonId.toString() && c.status !== 'blank')
              .flatMap(c => {
                const entries = [];
                
                // Base entry for Issuance
                entries.push({
                  id: `ic-${c.id}-issued`,
                  refId: c.checkNumber || `چک صادره #${c.id}`,
                  date: c.issueDate || c.dueDate || new Date().toISOString(),
                  jalaliDate: c.issueDate || c.dueDate || '-',
                  type: `چک صادره${c.status === 'issued' || c.status === 'cashed' ? '' : ' (اولیه)'}`,
                  desc: (c.description && !c.description.includes(c.checkNumber)) ? `${c.description} (شماره چک: ${c.checkNumber})` : (c.description || `برگه چک صادره شماره ${c.checkNumber} به سررسید ${c.dueDate}`),
                  debit: c.amount || 0,
                  credit: 0,
                  rawItem: c,
                  entryType: 'issued_check'
                });

                if (c.status === 'bounced') {
                   const bounceHistory = c.history?.find(h => h.status === 'bounced');
                   entries.push({
                     id: `ic-${c.id}-bounced`,
                     refId: c.checkNumber || `چک صادره #${c.id}`,
                     date: bounceHistory?.date || new Date().toISOString(),
                     jalaliDate: bounceHistory?.date ? new Date(bounceHistory.date).toLocaleDateString('fa-IR') : '-',
                     type: `برگشت چک صادره`,
                     desc: `برگشت خوردن چک صادره شماره ${c.checkNumber}`,
                     debit: 0,
                     credit: c.amount || 0,
                     rawItem: c,
                     entryType: 'issued_check'
                   });
                }
                
                if (c.status === 'cancelled') {
                   const cancelHistory = c.history?.find(h => h.status === 'cancelled');
                   entries.push({
                     id: `ic-${c.id}-cancelled`,
                     refId: c.checkNumber || `چک صادره #${c.id}`,
                     date: cancelHistory?.date || new Date().toISOString(),
                     jalaliDate: cancelHistory?.date ? new Date(cancelHistory.date).toLocaleDateString('fa-IR') : '-',
                     type: `ابطال چک صادره`,
                     desc: `ابطال چک صادره شماره ${c.checkNumber}`,
                     debit: 0,
                     credit: c.amount || 0,
                     rawItem: c,
                     entryType: 'issued_check'
                   });
                }

                return entries;
              });

            // Received Checks
            const receivedCheckEntries = receivedChecks
              .filter(c => c.payerId?.toString() === ledgerPersonId.toString())
              .flatMap(c => {
                const entries = [];
                
                entries.push({
                  id: `rc-${c.id}-received`,
                  refId: c.checkNumber || `چک دریافتی #${c.id}`,
                  date: c.receiveDate || c.dueDate || new Date().toISOString(),
                  jalaliDate: c.receiveDate || c.dueDate || '-',
                  type: `چک دریافتی${(c.status === 'received' || c.status === 'deposited' || c.status === 'cashed') ? '' : ' (اولیه)'}`,
                  desc: c.description || `برگه چک دریافتی شماره ${c.checkNumber} - بانک ${c.bankName} به سررسید ${c.dueDate}`,
                  debit: 0,
                  credit: c.amount || 0,
                  rawItem: c,
                  entryType: 'received_check'
                });

                if (c.status === 'bounced') {
                   const bounceHistory = c.history?.find(h => h.status === 'bounced');
                   entries.push({
                     id: `rc-${c.id}-bounced`,
                     refId: c.checkNumber || `چک دریافتی #${c.id}`,
                     date: bounceHistory?.date || new Date().toISOString(),
                     jalaliDate: bounceHistory?.date ? new Date(bounceHistory.date).toLocaleDateString('fa-IR') : '-',
                     type: `برگشت چک دریافتی`,
                     desc: `برگشت خوردن چک دریافتی شماره ${c.checkNumber}`,
                     debit: c.amount || 0,
                     credit: 0,
                     rawItem: c,
                     entryType: 'received_check'
                   });
                }

                if (c.status === 'returned') {
                   const returnHistory = c.history?.find(h => h.status === 'returned');
                   entries.push({
                     id: `rc-${c.id}-returned`,
                     refId: c.checkNumber || `چک دریافتی #${c.id}`,
                     date: returnHistory?.date || new Date().toISOString(),
                     jalaliDate: returnHistory?.date ? new Date(returnHistory.date).toLocaleDateString('fa-IR') : '-',
                     type: `عودت چک دریافتی`,
                     desc: `عودت برگه چک دریافتی شماره ${c.checkNumber}`,
                     debit: c.amount || 0,
                     credit: 0,
                     rawItem: c,
                     entryType: 'received_check'
                   });
                }

                return entries;
              });

            const getJalaliSortValue = (jalaliStr: string) => {
              if (!jalaliStr || jalaliStr === '-') return 0;
              const normalized = jalaliStr.replace(/[۰-۹]/g, (d: string) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
              const parts = normalized.split('/');
              if (parts.length === 3) {
                 const y = parts[0];
                 const m = parts[1].padStart(2, '0');
                 const d = parts[2].split(' ')[0].padStart(2, '0');
                 return parseInt(y + m + d, 10);
              }
              return 0;
            };

            // Combine and sort chronologically
            let allEntries = [...invoiceEntries, ...transactionEntries, ...issuedCheckEntries, ...receivedCheckEntries].sort((a, b) => {
              const jA = getJalaliSortValue(a.jalaliDate);
              const jB = getJalaliSortValue(b.jalaliDate);
              if (jA !== jB && jA !== 0 && jB !== 0) {
                 return jA - jB;
              }
              
              const tA = new Date(a.date).getTime();
              const tB = new Date(b.date).getTime();
              const dateDiff = (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB);
              
              if (dateDiff === 0) {
                return (a.rawItem?.createdAt || 0) - (b.rawItem?.createdAt || 0);
              }
              return dateDiff;
            });
            
            // Inject initial balance as the very first theoretical entry
            if (selectedPerson.initialBalance && selectedPerson.initialBalanceType !== 'settled') {
               const ibAmount = selectedPerson.initialBalance;
               const isDebtor = selectedPerson.initialBalanceType === 'debtor';
               const ibEntry = {
                 id: 'opening-balance',
                 refId: 'افتتاحیه',
                 date: selectedPerson.registrationDate || new Date().toISOString(),
                 jalaliDate: selectedPerson.registrationDate ? new Date(selectedPerson.registrationDate).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR') : '-',
                 type: 'مانده از قبل',
                 desc: `ثبت سند افتتاحیه ${isDebtor ? '(بدهکار)' : '(بستانکار)'}`,
                 debit: isDebtor ? ibAmount : 0,
                 credit: isDebtor ? 0 : ibAmount,
                 rawItem: null,
                 entryType: 'opening'
               };
               allEntries = [ibEntry, ...allEntries];
            }

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
            
            const isOwed = finalBalance > 0;
            const isClr = finalBalance === 0;

            return (
              <div className="space-y-6">
              
                {printingPersonLedger && (
                  <div className="fixed inset-0 z-[9999] bg-white text-black p-8 print-section overflow-visible flex flex-col font-sans" dir="rtl">
                    <div className="border-2 border-gray-900 p-6 rounded-2xl mb-8 shadow-sm print:shadow-none">
                       <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
                         <div className="text-right">
                           <h1 className="text-2xl font-black text-gray-900">{storeSettings.storeName || 'سیستم مدیریت'}</h1>
                           <h2 className="text-lg font-bold text-gray-600 mt-1">کارت حساب (دفتر معین) ویژه اشخاص</h2>
                         </div>
                         <div className="text-left select-none text-sm font-semibold text-gray-500">
                           تاریخ چاپ: {toPersianDigits(new Date().toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'))}
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-8 text-sm">
                         <div className="space-y-3 font-medium">
                           <p><span className="text-gray-500 w-24 inline-block font-bold">نام طرف حساب:</span> <span className="font-extrabold text-lg text-gray-900">{getPersonDisplayName(selectedPerson)} {selectedPerson.personCode ? `[${selectedPerson.personCode}]` : ''}</span></p>
                           <p><span className="text-gray-500 w-24 inline-block font-bold">تلفن تماس:</span> <span className="text-gray-900">{toPersianDigits(selectedPerson.phone ? selectedPerson.phone : '---')}</span></p>
                           <p><span className="text-gray-500 w-24 inline-block font-bold">آدرس:</span> <span className="text-gray-900">{selectedPerson.address || '---'}</span></p>
                         </div>
                         
                         <div className="space-y-3 font-medium">
                            <p><span className="text-gray-500 inline-block font-bold">جمع مبالغ بدهکار:</span> <span className="text-gray-900 font-extrabold text-base">{toPersianDigits(formatNumber(totalDebits))} {storeSettings.currency}</span></p>
                            <p><span className="text-gray-500 inline-block font-bold">جمع مبالغ بستانکار:</span> <span className="text-gray-900 font-extrabold text-base">{toPersianDigits(formatNumber(totalCredits))} {storeSettings.currency}</span></p>
                            <p className="pt-2 border-t border-gray-200">
                               <span className="text-gray-600 inline-block font-bold text-lg">مانده نهایی حساب:</span>{' '}
                               <span className={`text-lg font-black tracking-tight ${isClr ? 'text-gray-800' : isOwed ? 'text-rose-700' : 'text-emerald-700'}`}>
                                 {isClr ? 'تسویه کامل' : (
                                   <>
                                     {toPersianDigits(formatNumber(Math.abs(finalBalance)))} {storeSettings.currency} <span className="text-xs mr-2 font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">{isOwed ? 'بدهکار به ما' : 'بستانکار از ما'}</span>
                                   </>
                                 )}
                               </span>
                            </p>
                         </div>
                       </div>
                    </div>
                    
                    <div className="overflow-visible">
                          <table className="w-full text-right min-w-[0px] text-[11px] print:text-[11px] mb-8">
                            <thead>
                              <tr className="bg-slate-100/60 text-slate-500 border-b border-slate-400 font-bold text-[10px] uppercase tracking-wider print:bg-slate-100">
                                <th className="py-3 px-2 text-center w-8 print:border-b-2 print:border-gray-500">ردیف</th>
                                <th className="py-3 px-2 text-right w-24 print:border-b-2 print:border-gray-500">تاریخ و ارجاع</th>
                                <th className="py-3 px-2 text-right print:border-b-2 print:border-gray-500">عنوان و شرح جزئیات رویداد مالی</th>
                                <th className="py-3 px-2 text-left w-28 print:border-b-2 print:border-gray-500">بدهکار</th>
                                <th className="py-3 px-2 text-left w-28 print:border-b-2 print:border-gray-500">بستانکار</th>
                                <th className="py-3 px-2 text-left w-32 print:border-b-2 print:border-gray-500">مانده نهایی</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 font-medium font-sans">
                              {ledgerEntries.map((entry, index) => {
                                const isDeb = entry.runningBalance > 0;
                                const isBalZero = entry.runningBalance === 0;
                                return (
                                  <tr key={index} className="break-inside-avoid border-b border-gray-100">
                                    <td className="py-3 px-2 text-center align-top pt-4">
                                      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center mx-auto text-[9px] font-bold shrink-0">
                                        {toPersianDigits(index + 1)}
                                      </div>
                                    </td>
                                    <td className="py-3 px-2 align-top pt-3">
                                      <div className="flex flex-col gap-1.5 text-right relative">
                                        <span className="text-gray-800 font-bold flex items-center justify-end gap-1 text-xs pr-0" dir="ltr">
                                          <span className="whitespace-nowrap">{toPersianDigits(entry.jalaliDate)}</span>
                                        </span>
                                        <span className="text-[10px] text-gray-600 border border-gray-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                                          {toPersianDigits(entry.refId)}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-2 align-top pt-3 max-w-sm">
                                      <div className="flex flex-col items-start gap-1">
                                        <span className="font-extrabold text-[10px] bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{entry.type}</span>
                                        <p className="text-gray-800 text-[11px] whitespace-normal leading-relaxed break-words text-justify">
                                          {toPersianDigits(entry.desc)}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="py-3 px-2 text-left align-top pt-4">
                                      <span className={`font-black text-[12px] ${entry.debit > 0 ? 'text-black' : 'text-gray-400 font-medium'}`}>
                                        {entry.debit > 0 ? toPersianDigits(formatNumber(entry.debit)) : '---'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-2 text-left align-top pt-4">
                                      <span className={`font-black text-[12px] ${entry.credit > 0 ? 'text-black' : 'text-gray-400 font-medium'}`}>
                                        {entry.credit > 0 ? toPersianDigits(formatNumber(entry.credit)) : '---'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-2 text-left align-top pt-3">
                                      <div className={`flex flex-col items-end gap-1 font-extrabold ${isBalZero ? 'text-gray-600' : 'text-black'}`}>
                                        {isBalZero ? (
                                          <span className="border border-gray-300 px-2 py-1 rounded text-xs mt-0.5">صفر (تسویه)</span>
                                        ) : (
                                          <>
                                            <span className="text-[13px] tracking-tight">{toPersianDigits(formatNumber(Math.abs(entry.runningBalance)))}</span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isDeb ? 'border-gray-400 text-gray-700' : 'border-gray-400 text-gray-700'}`}>
                                              {isDeb ? 'بدهکار' : 'بستانکار'}
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
                          <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                             امضاء و مهر (صرفاً جهت اطلاع)
                          </div>
                    </div>
                  </div>
                )}
                
                {/* Person Summary KPI Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
                  
                  {/* Persona Info Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRoleBadgeClasses(selectedPerson.role)}`}>
                          {getRoleName(selectedPerson.role)}
                        </span>
                        <span className="text-xs text-gray-400 font-medium font-mono text-left">کد شخص: #{toPersianDigits(selectedPerson.personCode ? selectedPerson.personCode : selectedPerson.id)}</span>
                      </div>
                      <h2 className="text-lg font-extrabold text-gray-900 mb-3">{getPersonDisplayName(selectedPerson)}</h2>
                      
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
                      const borderStripe = isClear ? 'bg-slate-500' : (isOwedToUs ? 'bg-rose-500' : 'bg-emerald-500');
                      
                      return (
                        <>
                          <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${borderStripe}`}></div>
                          <div>
                            <span className="text-xs font-bold text-gray-400 block mb-2">وضعیت نهایی تراز حساب شخص</span>
                            <div className="py-2 font-semibold">
                              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md inline-block mb-2 ${
                                isClear 
                                  ? 'bg-slate-50 text-slate-700' 
                                  : isOwedToUs 
                                    ? 'bg-rose-50 text-rose-700' 
                                    : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {isClear ? '✔ کاملاً تسویه شده' : isOwedToUs ? '🔺 بدهکار به فروشگاه' : '🔻 بستانکار از فروشگاه'}
                              </span>
                              
                              <span className={`text-2xl font-black block tracking-tight ${
                                isClear ? 'text-slate-700' : isOwedToUs ? 'text-rose-700' : 'text-emerald-700'
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
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:overflow-visible">
                  <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-gray-800 flex items-center gap-2">
                      <List className="w-5 h-5 text-violet-500" />
                      ریز و گردش جزئیات حساب معین (کارت حساب اشخاص)
                    </h3>
                  </div>

                  <div className="overflow-x-auto print:overflow-visible">
                    {ledgerEntries.length === 0 ? (
                      <div className="p-12 text-center text-gray-400">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        هیچ گردش مالی یا سندی برای این شخص ثبت نشده است.
                      </div>
                    ) : (
                      <table className="w-full text-right min-w-[950px] print:min-w-[0px] print:text-[12px] text-sm">
                        <thead>
                          <tr className="bg-slate-100/60 text-slate-500 border-b border-slate-200 font-bold text-xs uppercase tracking-wider print:text-[10px]">
                            <th className="py-5 px-4 text-center w-10 print:w-8 print:px-2">ردیف</th>
                            <th className="py-5 px-4 text-right w-36 print:w-28 print:px-2">تاریخ و ارجاع</th>
                            <th className="py-5 px-6 text-right print:px-2">عنوان و شرح جزئیات رویداد مالی</th>
                            <th className="py-5 px-4 text-left w-36 print:w-28 print:px-2">بدهکار (افزایش بدهی)</th>
                            <th className="py-5 px-4 text-left w-36 print:w-28 print:px-2">بستانکار (کاهش بدهی)</th>
                            <th className="py-5 px-6 text-left w-44 print:w-32 print:px-2">مانده نهایی حساب</th>
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
                            const isCheck = entry.entryType === 'issued_check' || entry.entryType === 'received_check';
                            
                            const badgeColor = isSale 
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : isPurchase
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : isReceive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isPay
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : isCheck
                                      ? 'bg-violet-50 text-violet-700 border-violet-200'
                                      : 'bg-slate-50 text-slate-700 border-slate-200';

                            return (
                              <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => {
                                if (entry.entryType === 'invoice' && entry.rawItem) {
                                  setViewingInvoice(entry.rawItem);
                                } else if (entry.entryType === 'transaction' && entry.rawItem) {
                                  if (entry.rawItem.type === 'salary') {
                                    try {
                                      const parsedDesc = JSON.parse(entry.rawItem.description);
                                      if (parsedDesc.isPayslip) {
                                        setViewingPayslip({ ...entry.rawItem, parsed: parsedDesc, computedPersonName: selectedPerson.name });
                                        return;
                                      }
                                    } catch (e) {}
                                  }
                                  setPreviewReceiptData({ ...entry.rawItem, jalaliDate: entry.jalaliDate, personId: selectedPerson.id, _isReadOnly: true });
                                } else if (entry.entryType === 'issued_check') {
                                  setActiveTab('issued_checks');
                                } else if (entry.entryType === 'received_check') {
                                  setActiveTab('received_checks');
                                }
                              }}>
                                <td className="py-5 px-4 text-center text-gray-400 font-sans align-top pt-6 print:py-3 print:px-2 print:pt-4">
                                  <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto text-[10px] font-bold shadow-sm group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors shrink-0">
                                    {toPersianDigits(index + 1)}
                                  </div>
                                </td>
                                <td className="py-5 px-4 align-top pt-5 print:py-3 print:px-2 print:pt-4">
                                  <div className="flex flex-col gap-2.5 text-right relative">
                                    <span className="text-gray-700 font-bold flex items-center justify-end gap-2 text-sm max-w-fit pr-0 print:text-xs" dir="ltr">
                                      <span className="mt-0.5 whitespace-nowrap">{toPersianDigits(entry.jalaliDate)}</span>
                                      <Calendar className="w-4 h-4 text-indigo-500/70" />
                                    </span>
                                    <span className="text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg inline-flex w-max items-center gap-1.5 shadow-sm">
                                      <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                      {toPersianDigits(entry.refId)}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-5 px-6 align-top pt-5 max-w-sm print:py-3 print:px-2 print:pt-4">
                                  <div className="flex flex-col items-start gap-2.5">
                                    <span className={`w-max px-3 py-1 rounded-lg text-xs font-extrabold border shadow-sm ${badgeColor}`}>
                                      {entry.type}
                                    </span>
                                    <p className="text-gray-700 text-[13px] print:text-xs whitespace-normal leading-loose font-medium break-words text-justify">
                                      {toPersianDigits(entry.desc)}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-5 px-4 text-left align-top pt-6 print:py-3 print:px-2 print:pt-4">
                                  <span className={`font-black text-[15px] print:text-[13px] ${entry.debit > 0 ? 'text-indigo-600' : 'text-gray-300 font-medium'}`}>
                                    {entry.debit > 0 ? toPersianDigits(formatNumber(entry.debit)) : '---'}
                                  </span>
                                </td>
                                <td className="py-5 px-4 text-left align-top pt-6 print:py-3 print:px-2 print:pt-4">
                                  <span className={`font-black text-[15px] print:text-[13px] ${entry.credit > 0 ? 'text-emerald-600' : 'text-gray-300 font-medium'}`}>
                                    {entry.credit > 0 ? toPersianDigits(formatNumber(entry.credit)) : '---'}
                                  </span>
                                </td>
                                <td className="py-5 px-6 text-left align-top pt-5 print:py-3 print:px-2 print:pt-4">
                                  <div className={`flex flex-col items-end gap-1.5 font-extrabold ${
                                    isBalZero 
                                      ? 'text-slate-600' 
                                      : isDeb 
                                        ? 'text-rose-600' 
                                        : 'text-emerald-600'
                                  }`}>
                                    {isBalZero ? (
                                      <span className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-sm mt-0.5 text-slate-700">صفر (تسویه)</span>
                                    ) : (
                                      <>
                                        <span className="text-[17px] print:text-[14px] tracking-tight">{toPersianDigits(formatNumber(Math.abs(entry.runningBalance)))}</span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shadow-sm ${isDeb ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
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
      ) : activeTab === 'debts_credits' ? (
        <DebtsCreditsReport showNotification={showNotification} />
      ) : activeTab === 'checkbooks' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><CheckManagement activeTab="checkbooks" showNotification={showNotification} onDataChange={() => fetchChecks()} currentUser={user?.name || 'کاربر سیستم'} /></motion.div>
      ) : activeTab === 'issued_checks' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><CheckManagement activeTab="issued_checks" showNotification={showNotification} onDataChange={() => fetchChecks()} currentUser={user?.name || 'کاربر سیستم'} /></motion.div>
      ) : activeTab === 'received_checks' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><CheckManagement activeTab="received_checks" showNotification={showNotification} onDataChange={() => fetchChecks()} currentUser={user?.name || 'کاربر سیستم'} /></motion.div>
      ) : activeTab === 'check_calendar' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><CheckManagement activeTab="check_calendar" showNotification={showNotification} onDataChange={() => fetchChecks()} currentUser={user?.name || 'کاربر سیستم'} /></motion.div>
      ) : activeTab === 'check_charts' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><CheckManagement activeTab="check_charts" showNotification={showNotification} onDataChange={() => fetchChecks()} currentUser={user?.name || 'کاربر سیستم'} /></motion.div>
      ) : activeTab === 'transfer' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><FinancialTransfer /></motion.div>
            ) : activeTab === 'invoice_allocation' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <InvoiceAllocation 
            customAlert={customAlert} 
            formatCurrency={formatCurrency} 
            getDefaultExchangeRate={getDefaultExchangeRate} 
          />
        </motion.div>
      ) : activeTab === 'quick_refund' ? (
        <QuickRefund 
          showNotification={showNotification} 
          onComplete={() => {
            fetchTransactions();
            fetchPersons();
            fetchAccounts();
            fetchCashboxes();
          }} 
        />
      ) : activeTab === 'loans' ? (
        <LoansManager loans={loans} setLoans={setLoans} installments={installments} setInstallments={setInstallments} persons={persons} accounts={accounts} setAccounts={setAccounts} transactions={transactions} setTransactions={setTransactions} />
      ) : activeTab === 'users_manager' ? (
        <UserManager />
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

          <div className="border-b border-gray-100 flex gap-6 px-6 bg-white overflow-x-auto">
            <button
               onClick={() => setSettingsTab('general')}
               className={`py-4 font-bold text-sm whitespace-nowrap transition-colors relative ${settingsTab === 'general' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            >
               عمومی و اطلاعات فروشگاه
               {settingsTab === 'general' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
               onClick={() => setSettingsTab('features')}
               className={`py-4 font-bold text-sm whitespace-nowrap transition-colors relative ${settingsTab === 'features' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            >
               امکانات سیستم (انبار/فروش)
               {settingsTab === 'features' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
               onClick={() => setSettingsTab('numbering')}
               className={`py-4 font-bold text-sm whitespace-nowrap transition-colors relative ${settingsTab === 'numbering' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            >
               شماره‌گذاری اسناد
               {settingsTab === 'numbering' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
               onClick={() => setSettingsTab('printing')}
               className={`py-4 font-bold text-sm whitespace-nowrap transition-colors relative ${settingsTab === 'printing' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            >
               چاپ و امضائات
               {settingsTab === 'printing' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
               onClick={() => setSettingsTab('notification')}
               className={`py-4 font-bold text-sm whitespace-nowrap transition-colors relative ${settingsTab === 'notification' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            >
               پیامک و اطلاع‌رسانی
               {settingsTab === 'notification' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
          </div>
          <div className="p-6 bg-white">
            <form id="settingsForm" onSubmit={(e) => { e.preventDefault(); confirmAction('آیا از ذخیره تنظیمات اطمینان دارید؟', () => handleSaveSettings(e as any)) }} className="flex flex-col gap-6">
              
              {settingsTab === 'general' && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full text-right md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">لوگو فروشگاه / شرکت</label>
                      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        {settingsForm.logoUrl ? (
                          <div className="relative group">
                            <img src={settingsForm.logoUrl} alt="Logo preview" className="w-16 h-16 object-contain rounded bg-white shadow-sm border border-gray-100" />
                            <button type="button" onClick={() => setSettingsForm({...settingsForm, logoUrl: ''})} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-white border border-gray-200 rounded flex items-center justify-center text-gray-400 shadow-sm">
                            <Image className="w-6 h-6" />
                          </div>
                        )}
                        <div className="flex-1">
                          <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm inline-block">
                            انتخاب تصویر
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                          </label>
                          <p className="text-xs text-gray-500 mt-2">حداکثر حجم فایل ۲ مگابایت. فرمت‌های JPG و PNG.</p>
                        </div>
                      </div>
                    </div>
                    
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">واحد پولی سیستم (غیرقابل تغییر)</label>
                      <input
                        type="text"
                        value={storeSettings.currency}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 shadow-sm font-bold cursor-not-allowed"
                      />
                    </div>
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ و تقویم سیستم (غیرقابل تغییر)</label>
                      <input
                        type="text"
                        value={storeSettings.calendarType === 'gregorian' ? 'میلادی' : 'شمسی (جلالی)'}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 shadow-sm font-bold cursor-not-allowed"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">فونت سیستم</label>
                      <select
                        value={settingsForm.fontFamily || 'Vazirmatn'}
                        onChange={(e) => setSettingsForm({...settingsForm, fontFamily: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold"
                      >
                        <option value="Vazirmatn">وزیرمتن (Vazirmatn)</option>
                        <option value="IRANYekanXFaNum">ایران یکان (IRANYekanX)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-2">انتخاب فونت برای نمایش در کل سیستم.</p>
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">تلفن تماس</label>
                      <input
                        type="text"
                        value={settingsForm.phone || ''}
                        onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        dir="ltr"
                      />
                    </div>

                    <div className="w-full text-right md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">آدرس</label>
                      <input
                        type="text"
                        value={settingsForm.address || ''}
                        onChange={e => setSettingsForm({...settingsForm, address: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ شروع سال مالی</label>
                      <input
                        type="date"
                        value={settingsForm.financialYearStart || ''}
                        onChange={e => setSettingsForm({...settingsForm, financialYearStart: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-sans"
                      />
                    </div>
                    
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ پایان سال مالی</label>
                      <input
                        type="date"
                        value={settingsForm.financialYearEnd || ''}
                        onChange={e => setSettingsForm({...settingsForm, financialYearEnd: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'features' && (
                <div className="flex flex-col gap-6">
                  <div className="col-span-full border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                      تنظیمات انبار و فروش
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer" onClick={() => setSettingsForm({...settingsForm, allowNegativeStock: !settingsForm.allowNegativeStock})}>
                        <div className="pr-2">
                          <div className="font-bold text-gray-800 text-sm">مجوز فروش موجودی منفی انبار</div>
                          <div className="text-xs text-gray-500 mt-1">امکان ثبت فاکتور فروش برای کالاهایی که موجودی آنها صفر یا ناکافی است فراهم می‌شود.</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settingsForm.allowNegativeStock ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform transform ${settingsForm.allowNegativeStock ? '-translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer" onClick={() => setSettingsForm({...settingsForm, requireWarehouse: !settingsForm.requireWarehouse})}>
                        <div className="pr-2">
                          <div className="font-bold text-gray-800 text-sm">اجباری بودن انتخاب انبار در ردیف فاکتور</div>
                          <div className="text-xs text-gray-500 mt-1">هنگام ثبت فاکتورهای فروش و خرید، انتخاب انبار برای هر سطر کالا الزامی خواهد شد.</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settingsForm.requireWarehouse ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform transform ${settingsForm.requireWarehouse ? '-translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer" onClick={() => setSettingsForm({...settingsForm, allowDuplicateInvoiceRows: !settingsForm.allowDuplicateInvoiceRows})}>
                        <div className="pr-2">
                          <div className="font-bold text-gray-800 text-sm">مجوز تکراری بودن ردیف‌ها در فاکتور</div>
                          <div className="text-xs text-gray-500 mt-1">در صورت غیرفعال بودن، افزودن مجدد کالای تکراری صرفاً تعداد آن را در فاکتور افزایش می‌دهد.</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settingsForm.allowDuplicateInvoiceRows ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform transform ${settingsForm.allowDuplicateInvoiceRows ? '-translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'numbering' && (
                <div className="flex flex-col gap-6">
                  <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl mb-2">
                    <p className="text-sm text-indigo-800 font-medium text-right">در این بخش الگو، پیشوند، شماره شروع و تعداد ارقام قسمت عددی انواع اسناد را به صورت جداگانه تعیین کنید.</p>
                  </div>

                  <div className="flex flex-col gap-6">
                    {[
                      {
                        title: 'فروش و انبار',
                        items: [
                          { key: 'sale', label: 'فاکتور فروش', defaultPrefix: 'INV-' },
                          { key: 'proforma', label: 'پیش‌فاکتور (Proforma)', defaultPrefix: 'PF-' },
                          { key: 'purchase', label: 'فاکتور خرید', defaultPrefix: 'PUR-' },
                          { key: 'sale_return', label: 'برگشت از فروش', defaultPrefix: 'RTN-S-' },
                          { key: 'purchase_return', label: 'برگشت از خرید', defaultPrefix: 'RTN-P-' },
                          { key: 'warehouse_receipt', label: 'رسید انبار (ورود)', defaultPrefix: 'REC-' },
                          { key: 'warehouse_remittance', label: 'حواله انبار (خروج)', defaultPrefix: 'REM-' },
                        ]
                      },
                      {
                        title: 'خزانه‌داری (دریافت و پرداخت)',
                        items: [
                          { key: 'receive_receipt', label: 'رسید دریافت وجه', defaultPrefix: 'RD-' },
                          { key: 'pay_receipt', label: 'رسید پرداخت وجه', defaultPrefix: 'PD-' },
                          { key: 'salary', label: 'فیش حقوقی', defaultPrefix: 'PAY-' },
                        ]
                      },
                      {
                        title: 'مدیریت چک',
                        items: [
                          { key: 'check_issued', label: 'چک پرداختی', defaultPrefix: 'CHK-O-' },
                          { key: 'check_received', label: 'چک دریافتی', defaultPrefix: 'CHK-I-' },
                        ]
                      },
                      {
                        title: 'اشخاص و کالاها',
                        items: [
                          { key: 'person', label: 'کد شخص / مشتری', defaultPrefix: 'P-' },
                          { key: 'product', label: 'کد کالا', defaultPrefix: 'PRD-' },
                        ]
                      },
                      {
                        title: 'حسابداری',
                        items: [
                          { key: 'accounting_document', label: 'سند حسابداری', defaultPrefix: 'ACC-' },
                        ]
                      },
                      {
                        title: 'وام و اقساط',
                        items: [
                          { key: 'loan', label: 'پرونده وام', defaultPrefix: 'LN-' },
                          { key: 'installment', label: 'رسید قسط', defaultPrefix: 'INS-' },
                        ]
                      }
                    ].map((section, sIndex) => (
                      <div key={sIndex} className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
                        <div className="bg-slate-100 px-4 py-3 border-b border-gray-200 font-extrabold text-slate-800 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                           {section.title}
                        </div>
                        <table className="w-full text-sm text-right" dir="rtl">
                          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                            <tr>
                              <th className="p-4 w-1/4">نوع سند / فرم</th>
                              <th className="p-4 w-1/4">پیشوند نمادین</th>
                              <th className="p-4 w-1/4">شماره شروع</th>
                              <th className="p-4 w-1/4">تعداد مجاز ارقام</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 table-fixed">
                            {section.items.map(doc => (
                              <tr key={doc.key} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 font-bold text-gray-800 border-l border-gray-100">{doc.label}</td>
                                <td className="p-4 border-l border-gray-100">
                                  <input
                                    type="text"
                                    value={settingsForm[`prefix_${doc.key}`] || ''}
                                    onChange={e => setSettingsForm({...settingsForm, [`prefix_${doc.key}`]: e.target.value})}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 font-mono text-left bg-white transition-all shadow-sm"
                                    dir="ltr"
                                    placeholder={doc.defaultPrefix}
                                  />
                                </td>
                                <td className="p-4 border-l border-gray-100">
                                  <input
                                    type="number"
                                    value={settingsForm[`start_${doc.key}`] || ''}
                                    onChange={e => setSettingsForm({...settingsForm, [`start_${doc.key}`]: e.target.value})}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 font-mono text-left bg-white transition-all shadow-sm"
                                    dir="ltr"
                                    placeholder="1000"
                                  />
                                </td>
                                <td className="p-4">
                                  <input
                                    type="number"
                                    min="1" max="15"
                                    value={settingsForm[`len_${doc.key}`] || ''}
                                    onChange={e => setSettingsForm({...settingsForm, [`len_${doc.key}`]: parseInt(e.target.value) || ''})}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 font-mono text-left bg-white transition-all shadow-sm"
                                    dir="ltr"
                                    placeholder="6"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === 'printing' && (
                <div className="flex flex-col gap-6">
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">تنظیمات چاپ فاکتور و رسید</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="w-full text-right md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">سایز کاغذ چاپ (A4, A5, فیش پرینتر)</label>
                          <select
                            value={settingsForm.print_paper_size || 'A4'}
                            onChange={e => setSettingsForm({...settingsForm, print_paper_size: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                          >
                            <option value="A4">A4 (استاندارد)</option>
                            <option value="A5">A5 (نصف صفحه)</option>
                            <option value="receipt80">فیش پرینتر عرض 80mm</option>
                            <option value="receipt58">فیش پرینتر عرض 58mm</option>
                          </select>
                       </div>
                       
                       <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">نمایش لوگو در فاکتور</label>
                          <select
                            value={settingsForm.print_show_logo !== false ? 'true' : 'false'}
                            onChange={e => setSettingsForm({...settingsForm, print_show_logo: e.target.value === 'true'})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                          >
                            <option value="true">بله، نمایش داده شود</option>
                            <option value="false">خیر، مخفی شود</option>
                          </select>
                       </div>

                       <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">نمایش خلاصه مالی (دریافتی/باقیمانده)</label>
                          <select
                            value={settingsForm.print_show_financial !== false ? 'true' : 'false'}
                            onChange={e => setSettingsForm({...settingsForm, print_show_financial: e.target.value === 'true'})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                          >
                            <option value="true">بله، نمایش داده شود</option>
                            <option value="false">خیر، مخفی شود</option>
                          </select>
                       </div>

                       <div className="w-full text-right md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">یادداشت ثابت انتهای فاکتورها (فوتر)</label>
                          <textarea
                            value={settingsForm.print_footer_note || ''}
                            onChange={e => setSettingsForm({...settingsForm, print_footer_note: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                            placeholder="متنی که مایلید همیشه در پایین فاکتورهای چاپ شده نمایش داده شود..."
                            rows={3}
                          ></textarea>
                       </div>
                       
                       <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان امضاکننده 1 (خریدار/تحویل‌گیرنده)</label>
                          <input
                            type="text"
                            value={settingsForm.print_signature_1 || ''}
                            onChange={e => setSettingsForm({...settingsForm, print_signature_1: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                            placeholder="مثال: مهر و امضای خریدار"
                          />
                       </div>

                       <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان امضاکننده 2 (فروشنده/تحویل‌دهنده)</label>
                          <input
                            type="text"
                            value={settingsForm.print_signature_2 || ''}
                            onChange={e => setSettingsForm({...settingsForm, print_signature_2: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                            placeholder="مثال: مهر و امضای فروشنده"
                          />
                       </div>
                       
                       <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان امضاکننده 3 (مدیر/تایید کننده)</label>
                          <input
                            type="text"
                            value={settingsForm.print_signature_3 || ''}
                            onChange={e => setSettingsForm({...settingsForm, print_signature_3: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                            placeholder="مثال: مدیریت"
                          />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'notification' && (
                <div className="flex flex-col gap-6">
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">تنظیمات روش ارسال پیام</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="w-full text-right md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">روش پیش‌فرض اطلاع‌رسانی</label>
                          <select
                            value={settingsForm.notify_method || 'none'}
                            onChange={e => setSettingsForm({...settingsForm, notify_method: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                          >
                            <option value="none">غیرفعال</option>
                            <option value="sms">سامانه پیامکی (API)</option>
                            <option value="whatsapp">واتساپ</option>
                            <option value="gsm">دستگاه GSM</option>
                          </select>
                       </div>
                       
                       {settingsForm.notify_method && settingsForm.notify_method !== 'none' && (
                         <>
                           <div className="w-full text-right md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">کلید API / تنظیمات درگاه / پورت COM</label>
                              <input
                                type="text"
                                value={settingsForm.notify_api_key || ''}
                                onChange={e => setSettingsForm({...settingsForm, notify_api_key: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                                placeholder="مثال: p1h2g3... یا پورت COM3"
                                dir="ltr"
                              />
                           </div>
                         </>
                       )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">رویدادهای اطلاع‌رسانی خودکار</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={settingsForm.notify_on_invoice || false}
                          onChange={e => setSettingsForm({...settingsForm, notify_on_invoice: e.target.checked})}
                          className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-gray-800 font-medium">ارسال فاکتور خرید/فروش برای مشتری</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={settingsForm.notify_on_receipt || false}
                          onChange={e => setSettingsForm({...settingsForm, notify_on_receipt: e.target.checked})}
                          className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-gray-800 font-medium">ارسال رسید ثبت دریافتی / پرداختی</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={settingsForm.notify_on_balance || false}
                          onChange={e => setSettingsForm({...settingsForm, notify_on_balance: e.target.checked})}
                          className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-gray-800 font-medium">گزارش مانده حساب (پس از هر تراکنش)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-start border-t border-gray-100 pt-6 mt-4">
                <button
                  type="submit"
                  disabled={submittingSettings}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {submittingSettings ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : <Save className="w-5 h-5" />}
                  ذخیره تغییرات و اعمال در سیستم
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      ) : activeTab === 'inventory_report' ? (
        <InventoryReport showNotification={showNotification} />
      ) : activeTab === 'analytical_dashboard' ? (
        <AnalyticalDashboard showNotification={showNotification} />
      ) : activeTab === 'system_logs' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><SystemLogs /></motion.div>
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
              بروزرسانی هوشمند سیستم
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
                 </div>
               </div>
             )}

             {!updatingStr && latestCommits && latestCommits.length > 0 && (
                <div className="w-full mb-8" dir="rtl">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    لیست تغییرات بسته آپدیت
                  </h3>
                  <div className="space-y-3">
                    {latestCommits.map((commitData: any, idx: number) => (
                      <div key={idx} className="bg-white border text-right border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm font-bold text-gray-800 mb-2 truncate">
                          {commitData.commit?.message?.split('\n')[0] || 'بروزرسانی سیستم'}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                              <Shield className="w-3 h-3" />
                            </div>
                            تیم توسعه مرکز
                          </span>
                          <span className="font-sans font-bold text-indigo-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            {new Date(commitData.commit?.author?.date).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs font-bold flex items-start gap-3 w-full">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="leading-relaxed text-right">
                      تغییرات فوق در نسخه جدید اعمال شده‌اند. در صورت تایید، می‌توانید با دکمه زیر سیستم را اسکن و آپدیت کنید.
                    </p>
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

              {latestCommits.length > 0 || checkingUpdateVersion || updatingStr ? (
               <button
                 id="auto-update-btn"
                 onClick={handleSystemUpdate}
                 disabled={updatingStr || checkingUpdateVersion}
                 className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-[240px] cursor-pointer"
               >
                 {updatingStr || checkingUpdateVersion ? (
                   <>
                     <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                     <span>در حال بررسی وضعیت سیستم...</span>
                   </>
                 ) : (
                   <>
                     <RefreshCw className="w-5 h-5" />
                     <span>دریافت و بروزرسانی به آخرین نسخه</span>
                   </>
                 )}
               </button>
             ) : (
               <div className="flex flex-col md:flex-row gap-4 items-center w-full justify-center mt-4">
                 <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-3 justify-center text-center flex-1">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    شما در حال استفاده از آخرین و جدیدترین نسخه سیستم هستید. نیازی به بروزرسانی نیست.
                 </div>
                 <button
                   onClick={() => {
                     setCheckingUpdateVersion(false);
                     setHasPromptedUpdate(false);
                     setLatestCommits([]);
                     localStorage.removeItem('localCommitSha');
                   }}
                   className="px-6 py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                 >
                   <RefreshCw className="w-5 h-5" />
                   بررسی مجدد و اسکن مستقیم
                 </button>
               </div>
             )}
          </div>
        </motion.div>
      ) : activeTab === 'quick_price_inquiry' ? (
        <QuickPriceInquiry products={products} settings={storeSettings} />
      ) : activeTab === 'product_view' ? (
        viewingProduct ? (
          <ProductCardModal 
            product={viewingProduct} 
            warehouses={warehouses}
            currency={storeSettings?.currency || 'تومان'} 
            isModal={false}
            onClose={() => {
              setViewingProduct(null);
            }} 
          />
        ) : (
          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity:1, y:0}} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl mx-auto mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package className="w-8 h-8 text-indigo-600" />
              جستجوی پیشرفته کارت کالا
            </h2>
            <div className="relative">
              <SearchableSelect
                options={products.map(p => ({
                  value: p.id,
                  label: p.name,
                  subLabel: formatProductStockDetails(p),
                  badge: p.type === 'service' ? 'خدمات' : 'کالا',
                  searchStr: `${p.code || ''} ${p.barcode || ''}`
                }))}
                value=""
                onChange={(val) => {
                  const p = products.find(prod => prod.id.toString() === val);
                  if (p) setViewingProduct(p);
                }}
                placeholder="جستجو کالا (نام، کد، بارکد)..."
                searchPlaceholder="نام، کد یا بارکد کالا را وارد کنید..."
              />
            </div>
            <div className="mt-8 text-center text-gray-500 text-sm">
               جهت مشاهده تاریخچه و گردش کالا، جستجو و انتخاب کنید
            </div>
          </motion.div>
        )
      ) : activeTab === 'checklist' ? (
        <SystemChecklist />
      ) : activeTab === 'stocktaking' ? (
        <StocktakingManager showNotification={showNotification} currentUser={user?.name} onNavigateToDocs={() => setActiveTab('create_warehouse_doc')} />
      ) : activeTab === 'financial_years' ? (
        <FinancialYearManager showNotification={showNotification} />
      ) : activeTab === 'chart_of_accounts' ? (
        <ChartOfAccounts showNotification={showNotification} currentUser={user?.name} />
      ) : activeTab === 'accounting_docs_list' ? (
        <AccountingDocsList showNotification={showNotification} onNavigateToCreate={() => setActiveTab('accounting_doc_create')} onNavigateToView={(doc: any) => { setViewingAccountingDoc(doc); setActiveTab('accounting_doc_view'); }} />
      ) : activeTab === 'accounting_doc_create' ? (
        <AccountingDocCreate showNotification={showNotification} onBack={() => setActiveTab('accounting_docs_list')} />
      ) : activeTab === 'accounting_doc_view' && viewingAccountingDoc ? (
        <AccountingDocView doc={viewingAccountingDoc} storeSettings={storeSettings} onBack={() => setActiveTab('accounting_docs_list')} />
      ) : activeTab === 'accounting_auto_sync' ? (
        <AccountingAutoSync showNotification={showNotification} />
      ) : activeTab === 'accounting_verification' ? (
        <AccountingVerification showNotification={showNotification} />
      ) : null}
          {(!['products', 'product_view', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'analytical_dashboard', 'person_ledger', 'inventory_report', 'database', 'update', 'checklist', 'checkbooks', 'issued_checks', 'received_checks', 'check_calendar', 'check_charts', 'transfer', 'quick_refund', 'stocktaking', 'financial_years', 'chart_of_accounts', 'accounting_docs_list', 'accounting_doc_create', 'accounting_doc_view', 'accounting_auto_sync', 'accounting_verification'].includes(activeTab)) && renderTabContent()}
          </div>
        </main>

      <AnimatePresence>
        {viewingPayslip && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/55 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-3xl max-h-[95vh] flex flex-col print-section print:max-h-none print:h-auto print:overflow-visible print:border-none print:shadow-none print:rounded-none"
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
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-gray-800 text-sm print:overflow-visible print:p-0">
                
                {/* Official Slip Header */}
                <div className="border-4 border-double border-gray-300 p-5 rounded-2xl bg-gray-50/20 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-right space-y-1">
                    <span className="text-xs text-indigo-600 font-bold tracking-wider">سند مالی شماره #{toPersianDigits(viewingPayslip.id)}</span>
                    <h2 className="text-xl font-black text-gray-950">{storeSettings.storeName || 'مجموعه تجاری و مالی صبا'}</h2>
                    <p className="text-xs text-gray-500 font-medium">{viewingPayslip.parsed?.userNote || 'فیش رسمی حقوق و دستمزد کارمند'}</p>
                  </div>
                  <div className="text-center bg-white border border-gray-200 py-2.5 px-4 rounded-xl min-w-[150px] shadow-sm">
                    <span className="text-xs text-gray-400 font-semibold block m-0">تاریخ صدور سند</span>
                    <span className="text-sm font-extrabold text-gray-900 font-sans mt-0.5 block">{toPersianDigits(viewingPayslip.jalaliDate || viewingPayslip.date)}</span>
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
                    <span className="font-semibold text-gray-800 mr-2">
                       {viewingPayslip.parsed?.periodMonth && viewingPayslip.parsed?.periodYear ? 
                          ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'][Number(viewingPayslip.parsed.periodMonth)-1] + ' ' + viewingPayslip.parsed.periodYear 
                          : (viewingPayslip.parsed?.userNote || 'بدون بابت')
                       }
                    </span>
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
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-mono text-left" dir="ltr">{formatNumber(viewingPayslip.parsed?.base || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">حق مسکن و معیشت رفاهی</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-mono text-left" dir="ltr">{formatNumber(viewingPayslip.parsed?.allowances?.housing || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">حق بن و خواربار رفاهی</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-mono text-left" dir="ltr">{formatNumber(viewingPayslip.parsed?.allowances?.grocery || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">اضافه کار و سایر مزایا</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-mono text-left" dir="ltr">{formatNumber(viewingPayslip.parsed?.allowances?.other || 0)}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-emerald-50/50 font-extrabold text-emerald-950 border-t border-emerald-100">
                          <td className="py-3 px-4 text-right">جمع مبالغ ناخالص:</td>
                          <td className="py-3 px-4 font-mono text-left text-sm text-emerald-800" dir="ltr">
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
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-mono text-left" dir="ltr">{formatNumber(viewingPayslip.parsed?.deductions?.insurance || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">مالیات حقوق و درآمد معین</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-mono text-left" dir="ltr">{formatNumber(viewingPayslip.parsed?.deductions?.tax || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-600 font-medium text-right">مساعده دریافتی و سایر کسورات</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-mono text-left" dir="ltr">{formatNumber(viewingPayslip.parsed?.deductions?.penalty || 0)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 text-gray-400/50 text-[10px] text-right">---</td>
                          <td className="py-2.5 px-4 font-bold text-gray-400/50 font-mono text-left text-[10px]" dir="ltr">۰</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-rose-50/50 font-extrabold text-rose-950 border-t border-rose-100">
                          <td className="py-3 px-4 text-right">جمع مبالغ کسورات:</td>
                          <td className="py-3 px-4 font-mono text-left text-sm text-rose-800" dir="ltr">
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
                <div className="bg-indigo-950 text-white rounded-2xl p-5 border border-indigo-950 flex flex-col gap-3 shadow">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right w-full">
                    <div>
                      <h4 className="text-sm font-bold text-indigo-200">مبلغ خالص دریافتی پرداختنی کارمند</h4>
                      <p className="text-xs text-indigo-300 mt-1">حقوق پرداختی حاصل از کسر حقوق و مزایا از کسورات معین</p>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-amber-300 tracking-tight block">
                        {formatNumber(viewingPayslip.parsed?.netSalary || viewingPayslip.amount)}{' '}
                        <span className="text-xs text-indigo-200">{storeSettings.currency}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-indigo-100/90 text-right border-t border-indigo-900 pt-2.5 w-full leading-relaxed">
                    مبلغ به حروف: <span className="text-amber-300">{numToPersianWords(viewingPayslip.parsed?.netSalary || viewingPayslip.amount)} {storeSettings.currency}</span> تمام.
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
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

        {showProductBarcodesList && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-y-auto print:absolute print:z-auto print:block" dir="rtl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 print:hidden sticky top-0 z-10 shadow-sm">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                چاپ لیستی بارکد کالاها (A4)
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700"
                >
                  <Printer className="w-5 h-5" />
                  چاپ
                </button>
                <button
                  onClick={() => setShowProductBarcodesList(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-8 print:p-0">
               <div className="bg-white print:shadow-none shadow-sm border border-gray-200 print:border-none mx-auto print:mx-0 w-[210mm] min-h-[297mm] p-[10mm] print:p-0 print:w-full print:h-auto">
                 <h2 className="text-center font-black text-2xl mb-6 border-b-2 border-black/10 pb-4 text-gray-900">لیست بارکد کالاها - {storeSettings?.storeName || 'فروشگاه'}</h2>
                 
                 <table className="w-full text-sm border-collapse border border-gray-400 print:border-black">
                   <thead>
                     <tr className="bg-gray-100 print:bg-gray-200 uppercase font-black text-xs text-gray-800">
                       <th className="border border-gray-400 print:border-black p-3 text-center w-12">ردیف</th>
                       <th className="border border-gray-400 print:border-black p-3 text-right">نام کالا</th>
                       <th className="border border-gray-400 print:border-black p-3 text-center w-32">کد کالا</th>
                       <th className="border border-gray-400 print:border-black p-3 text-center w-40">قیمت فروش</th>
                       <th className="border border-gray-400 print:border-black p-3 text-center w-44">بارکد</th>
                     </tr>
                   </thead>
                   <tbody>
                     {products.filter(p => p.type !== 'service').map((prod, idx) => (
                       <tr key={prod.id} className="break-inside-avoid">
                         <td className="border border-gray-400 print:border-black p-3 text-center font-bold text-gray-700">{toPersianDigits(idx + 1)}</td>
                         <td className="border border-gray-400 print:border-black p-3 text-right"><span className="font-black text-base text-gray-900">{prod.name}</span></td>
                         <td className="border border-gray-400 print:border-black p-3 text-center font-mono font-bold text-gray-600">{toPersianDigits(prod.code || '---')}</td>
                         <td className="border border-gray-400 print:border-black p-3 text-center font-bold">
                           {prod.price ? 
                             <span><span className="text-lg tracking-wider font-extrabold text-gray-900" dir="ltr">{toPersianDigits(formatNumber(prod.price))}</span> <span className="text-xs text-gray-600">{storeSettings?.currency || 'تومان'}</span></span> 
                             : <span className="text-gray-400 font-bold text-xs">---</span>}
                         </td>
                         <td className="border border-gray-400 print:border-black p-2 text-center align-middle">
                           {prod.barcode ? (
                             <div className="flex justify-center h-16 overflow-hidden">
                               <Barcode value={prod.barcode} width={1.8} height={50} fontSize={12} margin={0} background="transparent" />
                             </div>
                           ) : <span className="text-gray-400 text-xs font-bold">---</span>}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

                {isGroupPriceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-xl flex flex-col shadow-xl">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800"><Percent className="w-5 h-5 text-emerald-500" /> بروزرسانی گروهی لیست قیمت</h3>
                 <button onClick={() => setIsGroupPriceModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                <form id="groupPriceForm" onSubmit={(e) => {
                  e.preventDefault();
                  confirmAction('آیا از بروزرسانی گروهی قیمت‌ها اطمینان دارید؟', async () => {
                     const isInc = groupUpdateDirection === 'increase';
                     const isFix = groupUpdateAmountType === 'fixed';
                     const val = Number(groupUpdateAmount.replace(/,/g, ''));
                     let targets = products;
                     
                     if (groupUpdateType === 'category' && groupUpdateTargetCategory !== 'all') {
                        targets = products.filter(p => p.category === groupUpdateTargetCategory || p.categoryId === groupUpdateTargetCategory);
                     } else if (groupUpdateType === 'single' && groupUpdateTargetProduct) {
                        targets = products.filter(p => p.id.toString() === groupUpdateTargetProduct);
                     }
                     
                     for (let p of targets) {
                        let newSell = Number(p.price || 0);
                        let newBuy = Number(p.purchasePrice || 0);
                        
                        if (groupUpdatePriceTarget === 'sell' || groupUpdatePriceTarget === 'both') {
                           if (isFix) { newSell = isInc ? newSell + val : newSell - val; }
                           else { newSell = isInc ? newSell * (1 + val/100) : newSell * (1 - val/100); }
                        }
                        if (groupUpdatePriceTarget === 'buy' || groupUpdatePriceTarget === 'both') {
                           if (isFix) { newBuy = isInc ? newBuy + val : newBuy - val; }
                           else { newBuy = isInc ? newBuy * (1 + val/100) : newBuy * (1 - val/100); }
                        }
                        await updateProduct(p.id.toString(), { ...p, price: Math.max(0, newSell), purchasePrice: Math.max(0, newBuy) });
                     }
                     
                     await fetchProducts();
                     setIsGroupPriceModalOpen(false);
                  });
                }} className="space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-bold mb-1">نوع بروزرسانی</label>
                       <select value={groupUpdateType} onChange={e => setGroupUpdateType(e.target.value as any)} className="w-full p-2 border rounded-xl">
                          <option value="category">روی دسته‌بندی</option>
                          <option value="single">روی کالای خاص</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-bold mb-1">هدف اعمال</label>
                       {groupUpdateType === 'category' ? (
                          <select value={groupUpdateTargetCategory} onChange={e => setGroupUpdateTargetCategory(e.target.value)} className="w-full p-2 border rounded-xl">
                             <option value="all">کلیه محصولات سیستم</option>
                             {productCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       ) : (
                          <Select
                            isRtl
                            options={products.map(p => ({value: p.id.toString(), label: p.name}))}
                            onChange={(o: any) => setGroupUpdateTargetProduct(o ? o.value : '')}
                            placeholder="انتخاب کالا"
                          />
                       )}
                     </div>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                     <div>
                       <label className="block text-sm font-bold mb-1">تغییر</label>
                       <select value={groupUpdateDirection} onChange={e => setGroupUpdateDirection(e.target.value as any)} className="w-full p-2 border rounded-xl">
                          <option value="increase">افزایش</option>
                          <option value="decrease">کاهش</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-bold mb-1">نوع مقدار</label>
                       <select value={groupUpdateAmountType} onChange={e => setGroupUpdateAmountType(e.target.value as any)} className="w-full p-2 border rounded-xl">
                          <option value="percent">درصد (%)</option>
                          <option value="fixed">مبلغ ثابت (تومان)</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-bold mb-1">اعمال قیمت</label>
                       <select value={groupUpdatePriceTarget} onChange={e => setGroupUpdatePriceTarget(e.target.value as any)} className="w-full p-2 border rounded-xl">
                          <option value="sell">قیمت فروش</option>
                          <option value="buy">قیمت خرید</option>
                          <option value="both">خرید و فروش</option>
                       </select>
                     </div>
                   </div>
                   <div>
                       <label className="block text-sm font-bold mb-1">مقدار افزایشی/کاهشی</label>
                       <CurrencyInput value={groupUpdateAmount} onChange={(e: any) => setGroupUpdateAmount(e.target.value)} placeholder={groupUpdateAmountType === 'percent' ? 'مثال: 15' : 'مثال: 10000'} className="w-full p-2 border rounded-xl" />
                   </div>
                </form>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                 <button type="button" onClick={() => setIsGroupPriceModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-bold">انصراف</button>
                 <button form="groupPriceForm" type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">اجرای تغییرات</button>
              </div>
            </motion.div>
          </div>
        )}
{isScannerOpen && (<BarcodeScannerModal onClose={() => setIsScannerOpen(false)} onScan={handleBarcodeScan} />)}
{isEditReceiptModalOpen && editingReceipt && (
  <EditReceiptModal
    isOpen={isEditReceiptModalOpen}
    onClose={() => {
      setIsEditReceiptModalOpen(false);
      setEditingReceipt(null);
    }}
    receipt={editingReceipt}
    onSave={handleSaveReceipt}
    persons={persons}
    accounts={accounts}
    cashboxes={cashboxes}
    checkbooks={checkbooks}
    storeSettings={storeSettings}
  />
)}
        {printingBarcodeProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm print:bg-white print:p-0 print:absolute print:z-auto print:block" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto print:shadow-none print:w-[60mm] print:h-auto print:max-w-none print:max-h-none print:overflow-visible print:p-0 print:m-0"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center print:hidden">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-500" />
                  چاپ لیبل بارکد
                </h3>
                <button
                  onClick={() => setPrintingBarcodeProduct(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 print:p-0 flex flex-col items-center justify-center min-h-[250px] print:min-h-0 text-center mx-auto print:mx-0">
                <div className="border border-gray-100 p-6 rounded-2xl shadow-sm text-center w-full max-w-xs mx-auto print:border-none print:shadow-none bg-white print:m-0 print:p-1 print:max-w-[58mm] flex flex-col justify-center items-center">
                   <div className="font-extrabold text-gray-900 text-lg mb-2 truncate px-2 print:text-[12px] print:mb-1 print:leading-tight">{printingBarcodeProduct.name}</div>
                   
                   <div className="flex justify-center my-2 text-center items-center overflow-hidden w-full print:my-0 scale-100 print:scale-[0.80] origin-top">
                     {(printingBarcodeProduct.barcode && printingBarcodeProduct.barcode.length > 0) ? (
                       <Barcode value={printingBarcodeProduct.barcode} format="CODE128" width={2} height={50} fontSize={12} textMargin={2} margin={0} background="#ffffff" lineColor="#000000" />
                     ) : (printingBarcodeProduct.code && printingBarcodeProduct.code.length > 0) ? (
                       <Barcode value={printingBarcodeProduct.code} format="CODE128" width={2} height={50} fontSize={12} textMargin={2} margin={0} background="#ffffff" lineColor="#000000" />
                     ) : (
                       <div className="py-8 text-gray-400 text-sm font-bold bg-gray-50 rounded-xl w-full border border-gray-100 print:hidden">بدون کد/بارکد</div>
                     )}
                   </div>
                   
                   <div className="text-sm font-bold text-gray-500 flex justify-between w-full mt-4 px-3 print:hidden">
                     <span>قیمت مصرف‌کننده:</span>
                     <span className="text-indigo-600">{typeof formatNumber === 'function' ? formatNumber(printingBarcodeProduct.price) : printingBarcodeProduct.price} {storeSettings?.currency || 'تومان'}</span>
                   </div>
                   <div className="text-[14px] font-black tracking-wider text-gray-900 justify-between items-center hidden print:flex mt-0 pt-1 text-center w-full">
                     <span className="mx-auto block w-full text-center">{typeof formatNumber === 'function' ? formatNumber(printingBarcodeProduct.price) : printingBarcodeProduct.price} {storeSettings?.currency || 'تومان'}</span>
                   </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 print:hidden">
                 <button
                   onClick={() => setPrintingBarcodeProduct(null)}
                   className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all shadow-sm"
                 >
                   بستن
                 </button>
                 <button
                   onClick={() => window.print()}
                   className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                   disabled={!(printingBarcodeProduct.barcode || printingBarcodeProduct.code)}
                 >
                   <Printer className="w-5 h-5" />
                   چاپ لیبل استاندارد
                 </button>
              </div>
            </motion.div>
          </div>
        )}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
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
              
              <div className="p-0 overflow-y-auto flex-1">
                <div className="flex border-b border-gray-200 px-6 pt-4 gap-6 sticky top-0 bg-white z-10">
                  <button
                    type="button"
                    onClick={() => setProductFormTab('general')}
                    className={`pb-3 font-bold text-sm border-b-2 transition-colors ${productFormTab === 'general' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    اطلاعات عمومی
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductFormTab('financial')}
                    className={`pb-3 font-bold text-sm border-b-2 transition-colors ${productFormTab === 'financial' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    اطلاعات مالی
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductFormTab('inventory')}
                    className={`pb-3 font-bold text-sm border-b-2 transition-colors ${productFormTab === 'inventory' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    انبار و تکمیلی
                  </button>
                  {editingProductId && (
                     <button
                       type="button"
                       onClick={() => setProductFormTab('history')}
                       className={`pb-3 font-bold text-sm border-b-2 transition-colors ${productFormTab === 'history' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                     >
                       تاریخچه قیمت‌ها
                     </button>
                  )}
                </div>
                
                <form id="productForm" onSubmit={(e) => { e.preventDefault(); confirmAction('آیا از ثبت اطلاعات کالا/خدمات اطمینان دارید؟', () => handleSubmitProduct(e as any)) }} className="p-6">
                  
                  {/* General Info Tab */}
                  {productFormTab === 'general' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="w-full md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            عنوان کالا / خدمات <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            placeholder="مثال: گوشی موبایل سامسونگ S23"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 bg-gray-50 focus:bg-white"
                            required
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            نوع <span className="text-red-500">*</span>
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
                        <div className="w-full">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
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
                      </div>

                      <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                        <h4 className="text-sm font-black text-blue-800 mb-4 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          تعریف واحد شمارش
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="w-full">
                            <label className="block text-xs font-bold text-blue-800 mb-2">
                              واحد اصلی (کوچکترین جزء)
                            </label>
                            <input
                              type="text"
                              value={newProductUnit}
                              onChange={(e) => setNewProductUnit(e.target.value)}
                              placeholder="مثال: عدد، کیلوگرم"
                              className="w-full px-3 py-2.5 rounded-lg border border-blue-200 focus:ring-max focus:ring-blue-500 shadow-sm text-sm"
                            />
                          </div>
                          <div className="w-full">
                            <label className="block text-xs font-bold text-blue-800 mb-2">
                              واحد فرعی (بسته‌بندی بزرگتر)
                            </label>
                            <input
                              type="text"
                              value={newProductSecondaryUnit}
                              onChange={(e) => setNewProductSecondaryUnit(e.target.value)}
                              placeholder="مثال: کارتن، بسته"
                              className="w-full px-3 py-2.5 rounded-lg border border-blue-200 focus:ring-max focus:ring-blue-500 shadow-sm text-sm"
                            />
                            <p className="text-[10px] text-blue-600 mt-1 opacity-80">(اختیاری)</p>
                          </div>
                          <div className="w-full">
                            <label className="block text-xs font-bold text-blue-800 mb-2">
                              ضریب تبدیل (هر واحد فرعی چند واحد اصلی است؟)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={newProductUnitRatio}
                              onChange={(e) => setNewProductUnitRatio(e.target.value)}
                              placeholder="مثال: 24"
                              className="w-full px-3 py-2.5 rounded-lg border border-blue-200 focus:ring-max focus:ring-blue-500 shadow-sm text-sm"
                              disabled={!newProductSecondaryUnit}
                            />
                            {newProductSecondaryUnit && newProductUnitRatio && newProductUnit && (
                               <p className="text-xs font-bold text-emerald-600 mt-2">
                                 1 {newProductSecondaryUnit} = {newProductUnitRatio} {newProductUnit}
                               </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Financial Info Tab */}
                  {productFormTab === 'financial' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="w-full">
                          <label className="block text-sm font-bold text-emerald-950 mb-2">
                            قیمت خرید بر اساس کوچکترین واحد ({newProductUnit || 'واحد اصلی'}) ({storeSettings?.currency || 'تومان'})
                          </label>
                          <CurrencyInput
                            value={newProductPurchasePrice}
                            onChange={(e: any) => setNewProductPurchasePrice(e.target.value)}
                            placeholder="مثال: 100000"
                            className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors text-emerald-900 font-mono text-left font-bold bg-white"
                          />
                          {newProductSecondaryUnit && newProductUnitRatio && Number(newProductUnitRatio) > 1 && newProductPurchasePrice && (
                            <p className="text-xs font-bold text-emerald-700 mt-1.5 bg-emerald-100/50 px-3 py-1.5 rounded-lg border border-emerald-200">
                              معادل <span className="font-mono text-sm font-black text-indigo-700">{formatNumber(Number(newProductPurchasePrice.replace(/,/g, '')) * Number(newProductUnitRatio))}</span> {storeSettings?.currency || 'تومان'} به ازای هر <span className="underline">{newProductSecondaryUnit}</span> (ضریب {newProductUnitRatio})
                            </p>
                          )}
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-bold text-emerald-950 mb-2">
                            قیمت فروش بر اساس کوچکترین واحد ({newProductUnit || 'واحد اصلی'}) ({storeSettings?.currency || 'تومان'})
                          </label>
                          <CurrencyInput
                            value={newProductPrice}
                            onChange={(e: any) => setNewProductPrice(e.target.value)}
                            placeholder="مثال: 150000"
                            className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors text-emerald-900 font-mono text-left font-bold bg-white"
                          />
                          {newProductSecondaryUnit && newProductUnitRatio && Number(newProductUnitRatio) > 1 && newProductPrice && (
                            <p className="text-xs font-bold text-indigo-700 mt-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                              معادل <span className="font-mono text-sm font-black text-indigo-800">{formatNumber(Number(newProductPrice.replace(/,/g, '')) * Number(newProductUnitRatio))}</span> {storeSettings?.currency || 'تومان'} به ازای هر <span className="underline">{newProductSecondaryUnit}</span> (ضریب {newProductUnitRatio})
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-xl">
                         <div>
                            <p className="text-sm font-bold text-gray-700">حاشیه سود حدودی:</p>
                            <p className="text-xs text-gray-500 mt-1">تفاوت قیمت فروش و خرید</p>
                         </div>
                         <div className="font-mono text-lg font-black text-indigo-600" dir="ltr">
                            {newProductPrice && newProductPurchasePrice ? (
                                (() => {
                                    const diff = Number(newProductPrice) - Number(newProductPurchasePrice);
                                    const percent = Number(newProductPurchasePrice) > 0 ? ((diff / Number(newProductPurchasePrice)) * 100).toFixed(1) : 100;
                                    return <span className={diff > 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatNumber(diff)} {storeSettings.currency} <span className="text-sm">({percent}%)</span></span>;
                                })()
                            ) : (
                                <span className="text-gray-400">---</span>
                            )}
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Inventory & Advanced Tab */}
                  {productFormTab === 'inventory' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {newProductType === 'product' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
                          <div className="w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              انبار مرجع
                            </label>
                            <select
                              value={newProductWarehouseId}
                              onChange={(e) => setNewProductWarehouseId(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 bg-white"
                            >
                              <option value="">بدون انبار (موجودی کلی)</option>
                              {warehouses.filter(w => w.isActive).map(wh => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              موجودی اولیه در انبار
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={newProductStock}
                              onChange={(e) => setNewProductStock(e.target.value)}
                              placeholder="تعداد در انبار"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 font-mono text-left"
                            />
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              حداقل موجودی (هشدار شارژ)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={newProductMinStock}
                              onChange={(e) => setNewProductMinStock(e.target.value)}
                              placeholder="مثال: 5"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 font-mono text-left"
                            />
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              کد کالا (سیستمی)
                            </label>
                            <input
                              type="text"
                              value={newProductCode}
                              onChange={(e) => setNewProductCode(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 font-mono text-left"
                              dir="ltr"
                            />
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              بارکد
                            </label>
                            <input
                              type="text"
                              value={newProductBarcode}
                              onChange={(e) => setNewProductBarcode(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 font-mono text-left tracking-widest"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      )}

                      <div className="w-full">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          توضیحات تکمیلی
                        </label>
                        <textarea
                          value={newProductDesc}
                          onChange={(e) => setNewProductDesc(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors text-gray-900 min-h-[100px] resize-y"
                          rows={3}
                          placeholder="توضیحات کالا که ممکن است در فاکتور چاپ شود..."
                        />
                      </div>
                    </div>
                  )}

                                    {/* History Tab */}
                  {productFormTab === 'history' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <h3 className="text-lg font-extrabold text-gray-900">تاریخچه تغییرات قیمت</h3>
                       <div className="bg-white border flex-1 border-gray-100 shadow-sm rounded-xl overflow-hidden">
                         <table className="min-w-full divide-y divide-gray-100">
                           <thead className="bg-gray-50/50">
                             <tr>
                               <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">تاریخ و زمان</th>
                               <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">قیمت خرید</th>
                               <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">قیمت فروش</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                             {(() => {
                                const prod = products.find(p => p.id === editingProductId);
                                if (!prod || !prod.priceHistory || prod.priceHistory.length === 0) {
                                   return <tr><td colSpan={3} className="text-center py-6 text-sm text-gray-500">تاریخچه‌ای برای این کالا ثبت نشده است.</td></tr>;
                                }
                                return prod.priceHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((h, i) => (
                                   <tr key={i} className="hover:bg-slate-50">
                                     <td className="px-4 py-3 text-sm text-gray-700" dir="ltr">{new Date(h.date).toLocaleString('fa-IR')}</td>
                                     <td className="px-4 py-3 text-sm font-bold text-gray-900">{addCommas(h.buyPrice)}</td>
                                     <td className="px-4 py-3 text-sm font-bold text-gray-900">{addCommas(h.sellPrice)}</td>
                                   </tr>
                                ));
                             })()}
                           </tbody>
                         </table>
                       </div>
                     </div>
                  )}

                  {/* Hidden required fields for HTML5 validation validation to still work across tabs */}
                  <div className="hidden">
                      <input type="text" required value={newProductName} onChange={() => {}} />
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

        
        {isPersonExtraModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-lg flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-500" />
                  ثبت اطلاعات تکمیلی بانکی و یادداشت‌ها
                </h3>
                <button
                  onClick={() => setIsPersonExtraModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <form id="personExtraForm" onSubmit={async (e) => {
                  e.preventDefault();
                  confirmAction('آیا از ذخیره اطلاعات بانکی و تکمیلی اطمینان دارید؟', async () => {
                  if (personExtraId) {
                    const existing = persons.find(p => p.id === personExtraId);
                    if (existing) {
                      const updated = await updatePerson(personExtraId as string, { ...existing, bankName: personBankName, bankAccountNumber: personBankAcc, cardNumber: personCard, shebaNumber: personSheba, additionalNotes: personNotes });
                      if (updated) { setPersons(persons.map(p => p.id === personExtraId ? updated : p)); }
                    }
                  }
                  setIsPersonExtraModalOpen(false);
                });
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نام بانک</label>
                      <input type="text" value={personBankName} onChange={(e) => setPersonBankName(e.target.value)} className="w-full px-4 py-2 border rounded-xl" placeholder="مثال: ملت" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">شماره حساب</label>
                      <input type="text" value={personBankAcc} onChange={(e) => setPersonBankAcc(e.target.value)} className="w-full px-4 py-2 border rounded-xl" dir="ltr" placeholder="123456789" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">شماره کارت</label>
                      <input type="text" value={personCard} onChange={(e) => setPersonCard(e.target.value)} className="w-full px-4 py-2 border rounded-xl" dir="ltr" placeholder="6104-337X-XXXX-XXXX" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">شماره شبا</label>
                      <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono">IR</span>
                         <input type="text" value={personSheba} onChange={(e) => setPersonSheba(e.target.value)} className="w-full px-4 py-2 pl-9 border rounded-xl text-left" dir="ltr" placeholder="123456..." />
                      </div>
                    </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">یادداشت‌های اضافی اطلاعات شخص (آدرس‌های بیشتر و ...)</label>
                      <textarea value={personNotes} onChange={(e) => setPersonNotes(e.target.value)} className="w-full px-4 py-2 border rounded-xl" rows={3} placeholder="یادداشت و اطلاعات بیشتر خود را وارد کنید..." />
                  </div>
                </form>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setIsPersonExtraModalOpen(false)}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm"
                >
                  انصراف
                </button>
                <button
                  form="personExtraForm"
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  ذخیره اطلاعات تکمیلی
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Modal for Import / Export of Persons */}
        {isPersonIOModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-150 overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col font-sans text-right"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                  ورود و خروج اطلاعات اشخاص (فرمت استاندارد و خاص)
                </h3>
                <button
                  onClick={() => setIsPersonIOModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs inside Modal */}
              <div className="flex border-b border-slate-150 bg-slate-50">
                <button
                  onClick={() => setPersonIOAction('export')}
                  className={`flex-1 py-3 text-sm font-bold transition-all border-none cursor-pointer ${
                    personIOAction === 'export'
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowDownToLine className="w-4 h-4" />
                    صدور اطلاعات (خروجی گرفتن از سیستم)
                  </div>
                </button>
                <button
                  onClick={() => setPersonIOAction('import')}
                  className={`flex-1 py-3 text-sm font-bold transition-all border-none cursor-pointer ${
                    personIOAction === 'import'
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowUpFromLine className="w-4 h-4" />
                    ورود اطلاعات (وارد کردن به سیستم)
                  </div>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-750 space-y-6">
                
                {/* EXPORT TAB content */}
                {personIOAction === 'export' && (
                  <div className="space-y-4">
                    <div className="bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-xl text-indigo-950 font-medium leading-relaxed">
                      در این بخش می‌توانید لیست جامع اطلاعات تمامی اشخاص ثبت شده در سیستم ({persons.length} شخص) را با فرمت استانداردی چون JSON یا اکسل (CSV کاملاً سازگار با حروف فارسی) دریافت و بر روی سیستم خود ذخیره نمایید.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* CSV Export Option Card */}
                      <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50/5 transition-all flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">CSV</div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800">خروجی اکسل استاندارد (CSV فارسی)</h4>
                            <span className="text-xs text-slate-400 font-medium">مناسب باز کردن مستقیم در اکسل و سایر جداول</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed min-h-12 font-medium">
                          این فرمت به همراه شناسه UTF-8 BOM ثبت می‌شود که به صورت کاملاً خودکار در نرم افزار Excel با زبان فارسی باز شده و در آن حروف فارسی به صورت بهم ریخته دیده نمی‌شوند.
                        </p>
                        <button
                          onClick={() => {
                            // Column mapping in standard csv
                            const headers = [
                              'کد شخص', 'نام کامل', 'نوع شخص', 'کد ملی/شناسه ملی', 'نقش', 'شماره تماس', 
                              'نام پدر', 'نام شرکت', 'آدرس', 'نام بانک', 'شماره حساب', 'شماره کارت', 'شماره شبا', 'یادداشت تکمیلی'
                            ];
                            
                            const csvContent = [
                              headers.join(','),
                              ...persons.map(p => {
                                const row = [
                                  p.personCode || '',
                                  p.name || '',
                                  p.personType === 'legal' ? 'حقوقی' : 'حقیقی',
                                  p.nationalId || '',
                                  getRoleName(p.role),
                                  p.phone || '',
                                  p.fatherName || '',
                                  p.companyName || '',
                                  (p.address || '').replace(/,/g, ' - '),
                                  p.bankName || '',
                                  p.bankAccountNumber || '',
                                  p.cardNumber || '',
                                  p.shebaNumber || '',
                                  (p.additionalNotes || '').replace(/[\r\n,]/g, ' - ')
                                ];
                                // wrapping each cell with quotes to hand characters spacing/commas
                                return row.map(v => `"${v.replace(/"/g, '""')}"`).join(',');
                              })
                            ].join('\r\n');

                            // BOM prefix is crucial for persian excel compatibility
                            const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.setAttribute('href', url);
                            link.setAttribute('download', `persons_list_export_${new Date().toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR').replace(/\//g, '-')}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="w-full mt-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none shadow-sm shadow-teal-50"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          دانلود فایل اکسل CSV
                        </button>
                      </div>

                      {/* JSON Export Option Card */}
                      <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50/5 transition-all flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">JSON</div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800">خروجی بک آپ سیستمی (Standard JSON)</h4>
                            <span className="text-xs text-slate-400 font-medium">بک آپ خام دقیق جهت انتقال بین سرورها یا سیستم‌های دیگر</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed min-h-12 font-medium">
                          این فایل شامل ساختار آرایه داده کل اشخاص به روش JSON است. این فرمت بسیار دقیق بوده و برای انتقال بی‌نقص اطلاعات به نرم افزار حسابداری در دستگاه‌های دیگر فوق‌العاده است.
                        </p>
                        <button
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(persons, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.setAttribute('href', url);
                            link.setAttribute('download', `persons_data_export_${new Date().toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR').replace(/\//g, '-')}.json`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none shadow-sm shadow-indigo-50"
                        >
                          <Database className="w-4 h-4" />
                          دانلود فایل پشتیبان JSON
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* IMPORT TAB content */}
                {personIOAction === 'import' && (
                  <div className="space-y-6">
                    {/* Choose Source Format Type */}
                    <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700">۱. نوع فایل / شیوه ورود اطلاعات خود را انتخاب کنید:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPersonsIOFileType('excel_pasted');
                              setPastedPersonsText('');
                              setParsedHeaders([]);
                              setParsedRows([]);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                              personsIOFileType === 'excel_pasted'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-350'
                            }`}
                          >
                            کپی-پیست از اکسل (ساده‌ترین روش)
                          </button>
                          <button
                            onClick={() => {
                              setPersonsIOFileType('json');
                              setParsedHeaders([]);
                              setParsedRows([]);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                              personsIOFileType === 'json'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-350'
                            }`}
                          >
                            بارگذاری فایل JSON (سیستمی)
                          </button>
                          <button
                            onClick={() => {
                              setPersonsIOFileType('csv');
                              setParsedHeaders([]);
                              setParsedRows([]);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                              personsIOFileType === 'csv'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-350'
                            }`}
                          >
                            بارگذاری فایل CSV یا اکسل
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SUB-TABS Content */}
                    
                    {/* Method 1: excel_pasted */}
                    {personsIOFileType === 'excel_pasted' && (
                      <div className="space-y-4">
                        <div className="text-slate-600 space-y-1">
                          <p className="font-extrabold text-slate-800">راهنمای کپی-پیست مستقیم از اکسل / جدول:</p>
                          <p className="text-xs font-medium">۱. در برنامه اکسل یا گوگل‌شیت، ستون‌های دلخواه از اطلاعات مشتریان خود را کپی کنید.</p>
                          <p className="text-xs font-medium">۲. اطلاعات کپی شده را مستقیماً در کادر زیر قرار دهید (Paste کنید).</p>
                          <p className="text-xs font-medium">۳. در مرحله بعدی، مشخص می‌کنید که هر کدام از ستون‌های ثبت شده متعلق به کدام ویژگی شخص است.</p>
                        </div>

                        <textarea
                          value={pastedPersonsText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPastedPersonsText(val);
                            
                            // Auto parse on input
                            if (!val.trim()) {
                              setParsedHeaders([]);
                              setParsedRows([]);
                              return;
                            }
                            
                            const lines = val.split(/\r?\n/).filter(line => line.trim() !== '');
                            if (lines.length > 0) {
                              const matrix = lines.map(line => line.split('\t'));
                              // Let's analyze if first row looks like header
                              if (matrix.length > 0) {
                                setParsedHeaders(matrix[0]);
                                setParsedRows(matrix.slice(1));
                              }
                            }
                          }}
                          placeholder="اطلاعات کپی شده از اکسل را در این فضا پیست کنید..."
                          rows={6}
                          className="w-full p-4 border border-slate-200 bg-slate-50 hover:bg-slate-100/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-indigo-950 font-mono text-xs leading-relaxed transition-all shadow-xs"
                        />
                      </div>
                    )}

                    {/* Method 2: json file */}
                    {personsIOFileType === 'json' && (
                      <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 text-center space-y-4 hover:border-indigo-400 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
                          <Database className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">بارگذاری فایل پشتیبان JSON اشخاص</p>
                          <p className="text-xs text-slate-400 font-medium mt-1">فایلی را که قبلاً صادر کرده‌اید انتخاب نمایید تا تمام اشخاص موجود در آن بازیابی شوند.</p>
                        </div>
                        <div className="inline-block relative">
                          <input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImportSelectedFile(file);
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  try {
                                    const parsedObj = JSON.parse(event.target?.result as string);
                                    if (Array.isArray(parsedObj)) {
                                      // It's already the array format!
                                      setParsedRows(parsedObj.map(p => [
                                        p.name || '', p.personType || 'real', p.role || 'customer', p.phone || '', p.nationalId || '',
                                        p.fatherName || '', p.companyName || '', p.address || '', p.bankName || '',
                                        p.bankAccountNumber || '', p.cardNumber || '', p.shebaNumber || '', p.additionalNotes || '', p.personCode || ''
                                      ]));
                                      // Mock standard header
                                      setParsedHeaders([
                                        'name', 'personType', 'role', 'phone', 'nationalId', 'fatherName', 'companyName',
                                        'address', 'bankName', 'bankAccountNumber', 'cardNumber', 'shebaNumber', 'additionalNotes', 'personCode'
                                      ]);
                                      // Auto establish mapper to match index directly
                                      setPersonIOMappings({
                                        name: 0, personType: 1, role: 2, phone: 3, nationalId: 4, fatherName: 5, companyName: 6,
                                        address: 7, bankName: 8, bankAccountNumber: 9, cardNumber: 10, shebaNumber: 11, additionalNotes: 12, personCode: 13
                                      });
                                    } else {
                                      alert('فرمت فایل پشتیبانی نمی‌شود. فایل خروجی استاندارد نیست.');
                                    }
                                  } catch (err) {
                                    alert('خطا در خواندن فایل JSON. از صحت فایل مطمئن شوید.');
                                  }
                                };
                                reader.readAsText(file);
                              }
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                          <button className="px-5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                            <Plus className="w-4 h-4" />
                            انتخاب فایل از سیستم
                          </button>
                        </div>
                        {importSelectedFile && (
                          <div className="text-xs text-slate-500 font-bold bg-slate-100 inline-block px-3 py-1 rounded-lg">
                            فایل انتخاب شده: {importSelectedFile.name}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Method 3: csv file */}
                    {personsIOFileType === 'csv' && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 text-center space-y-4 hover:border-indigo-400 transition-all">
                          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center mx-auto">
                            <FileSpreadsheet className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">بارگذاری فایل CSV یا فایل‌های اکسل صادر شده</p>
                            <p className="text-xs text-slate-400 font-medium mt-1">یک فایل CSV و متنی با هر جداکننده‌ای متداول (کاما، سیمی‌کولن، تب) را بارگذاری نمایید.</p>
                          </div>
                          <div className="flex justify-center items-center gap-4">
                            <div className="flex items-center gap-1 bg-white p-2 rounded-lg border border-slate-150 text-xs">
                              <span className="font-bold">جداکننده ستون‌ها:</span>
                              <select 
                                value={detectedDelimiter} 
                                onChange={(e) => {
                                  const d = e.target.value;
                                  setDetectedDelimiter(d);
                                  // Re-parse if text or file exists
                                  if (pastedPersonsText) {
                                    const lines = pastedPersonsText.split(/\r?\n/).filter(line => line.trim() !== '');
                                    const delim = d === '\	' ? '\t' : d;
                                    const matrix = lines.map(line => line.split(delim));
                                    if (matrix.length > 0) {
                                      setParsedHeaders(matrix[0]);
                                      setParsedRows(matrix.slice(1));
                                    }
                                  }
                                }} 
                                className="border-none font-bold text-indigo-700 outline-none p-1 bg-transparent"
                              >
                                <option value="\t">تب (Tab-spaced)</option>
                                <option value=",">کامبل (Comma ,)</option>
                                <option value=";">سیمی‌کولن (Semicolon ;)</option>
                              </select>
                            </div>
                            <div className="relative">
                              <input
                                type="file"
                                accept=".csv,.txt"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setImportSelectedFile(file);
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      try {
                                        const fileContent = event.target?.result as string;
                                        setPastedPersonsText(fileContent);
                                        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
                                        const actualDelim = detectedDelimiter === '\	' ? '\t' : detectedDelimiter;
                                        
                                        // Auto-detect comma or semicolon if not tab
                                        let finalDelim = actualDelim;
                                        if (lines[0]) {
                                          if (lines[0].includes(',') && actualDelim === '\	') {
                                            finalDelim = ',';
                                            setDetectedDelimiter(',');
                                          } else if (lines[0].includes(';') && actualDelim === '\	') {
                                            finalDelim = ';';
                                            setDetectedDelimiter(';');
                                          }
                                        }

                                        const matrix = lines.map(line => line.split(finalDelim));
                                        if (matrix.length > 0) {
                                          setParsedHeaders(matrix[0]);
                                          setParsedRows(matrix.slice(1));
                                        }
                                      } catch (err) {
                                        alert('خطا در خواندن فایل. لطفاً فرمت مناسبی را انتخاب نماید.');
                                      }
                                    };
                                    reader.readAsText(file);
                                  }
                                }}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              />
                              <button className="px-5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                                <Plus className="w-4 h-4" />
                                انتخاب فایل CSV از سیستم
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TWO: COLUMN MAPPER STEP (show when we have parsed rows and headers) */}
                    {parsedHeaders.length > 0 && personsIOFileType !== 'json' && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-1.5 border-b border-slate-150 pb-2">
                          <ClipboardList className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-sm font-extrabold text-slate-800">۲. مشخص کردن ستون‌ها (تناظر اطلاعات با ستون‌های اکسل شما)</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold">
                          مشخص کنید هر کدام از فیلدهای خریدار/فروشنده در سیستم شما، به کدام یک از ستون‌های موجود در جدول چسبانده شده مطابقت دارد:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Name mapper (Required) */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-2xs">
                            <label className="text-xs font-black text-slate-700 flex justify-between items-center">
                              <span>نام و نام‌خانوادگی / عنوان شخص <span className="text-rose-500">*</span></span>
                            </label>
                            <select
                              value={personIOMappings.name}
                              onChange={(e) => setPersonIOMappings(prev => ({ ...prev, name: Number(e.target.value) }))}
                              className="w-full text-xs font-bold border rounded-lg p-1.5 mt-1 text-slate-800 outline-none"
                            >
                              <option value={-1}>-- لطفا انتخاب کنید --</option>
                              {parsedHeaders.map((hdr, idx) => (
                                <option key={idx} value={idx}>ستون {idx + 1}: {hdr || '(خالی)'}</option>
                              ))}
                            </select>
                          </div>

                          {/* Phone mapper */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-2xs">
                            <label className="text-xs font-black text-slate-700">شماره موبایل / تماس</label>
                            <select
                              value={personIOMappings.phone}
                              onChange={(e) => setPersonIOMappings(prev => ({ ...prev, phone: Number(e.target.value) }))}
                              className="w-full text-xs font-bold border rounded-lg p-1.5 mt-1 text-slate-800 outline-none"
                            >
                              <option value={-1}>-- انتخاب نشده (پیش فرض خالی/ندارد) --</option>
                              {parsedHeaders.map((hdr, idx) => (
                                <option key={idx} value={idx}>ستون {idx + 1}: {hdr || '(خالی)'}</option>
                              ))}
                            </select>
                          </div>

                          {/* National ID mapper */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-2xs">
                            <label className="text-xs font-black text-slate-700">کد ملی / شناسه ملی ملکی</label>
                            <select
                              value={personIOMappings.nationalId}
                              onChange={(e) => setPersonIOMappings(prev => ({ ...prev, nationalId: Number(e.target.value) }))}
                              className="w-full text-xs font-bold border rounded-lg p-1.5 mt-1 text-slate-800 outline-none"
                            >
                              <option value={-1}>-- انتخاب نشده --</option>
                              {parsedHeaders.map((hdr, idx) => (
                                <option key={idx} value={idx}>ستون {idx + 1}: {hdr || '(خالی)'}</option>
                              ))}
                            </select>
                          </div>

                          {/* Person Type mapper */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-2xs">
                            <label className="text-xs font-black text-slate-700">نوع شخصیت (حقیقی یا حقوقی)</label>
                            <select
                              value={personIOMappings.personType}
                              onChange={(e) => setPersonIOMappings(prev => ({ ...prev, personType: Number(e.target.value) }))}
                              className="w-full text-xs font-bold border rounded-lg p-1.5 mt-1 text-slate-800 outline-none"
                            >
                              <option value={-1}>پذیرفته شده همه حقیقی</option>
                              {parsedHeaders.map((hdr, idx) => (
                                <option key={idx} value={idx}>ستون {idx + 1}: {hdr || '(خالی)'}</option>
                              ))}
                            </select>
                          </div>

                          {/* Role mapper */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-2xs">
                            <label className="text-xs font-black text-slate-700">نقش شخص در سیستم (مشتری، کارمند...)</label>
                            <select
                              value={personIOMappings.role}
                              onChange={(e) => setPersonIOMappings(prev => ({ ...prev, role: Number(e.target.value) }))}
                              className="w-full text-xs font-bold border rounded-lg p-1.5 mt-1 text-slate-800 outline-none"
                            >
                              <option value={-1}>نقش پیش فرض: مشتری (Customer)</option>
                              {parsedHeaders.map((hdr, idx) => (
                                <option key={idx} value={idx}>ستون {idx + 1}: {hdr || '(خالی)'}</option>
                              ))}
                            </select>
                          </div>

                          {/* Company Name */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-2xs">
                            <label className="text-xs font-black text-slate-700">شناسه یا نام شرکت (برای حقوقی‌ها)</label>
                            <select
                              value={personIOMappings.companyName}
                              onChange={(e) => setPersonIOMappings(prev => ({ ...prev, companyName: Number(e.target.value) }))}
                              className="w-full text-xs font-bold border rounded-lg p-1.5 mt-1 text-slate-800 outline-none"
                            >
                              <option value={-1}>ندارد</option>
                              {parsedHeaders.map((hdr, idx) => (
                                <option key={idx} value={idx}>ستون {idx + 1}: {hdr || '(خالی)'}</option>
                              ))}
                            </select>
                          </div>

                          {/* Father Name */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-2xs">
                            <label className="text-xs font-black text-slate-700">نام پدر</label>
                            <select
                              value={personIOMappings.fatherName}
                              onChange={(e) => setPersonIOMappings(prev => ({ ...prev, fatherName: Number(e.target.value) }))}
                              className="w-full text-xs font-bold border rounded-lg p-1.5 mt-1 text-slate-800 outline-none"
                            >
                              <option value={-1}>ندارد</option>
                              {parsedHeaders.map((hdr, idx) => (
                                <option key={idx} value={idx}>ستون {idx + 1}: {hdr || '(خالی)'}</option>
                              ))}
                            </select>
                          </div>

                          {/* Address mapper */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-2xs">
                            <label className="text-xs font-black text-slate-700">آدرس محل اقامت یا سکونت</label>
                            <select
                              value={personIOMappings.address}
                              onChange={(e) => setPersonIOMappings(prev => ({ ...prev, address: Number(e.target.value) }))}
                              className="w-full text-xs font-bold border rounded-lg p-1.5 mt-1 text-slate-800 outline-none"
                            >
                              <option value={-1}>ندارد</option>
                              {parsedHeaders.map((hdr, idx) => (
                                <option key={idx} value={idx}>ستون {idx + 1}: {hdr || '(خالی)'}</option>
                              ))}
                            </select>
                          </div>

                          {/* Notes */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-2xs">
                            <label className="text-xs font-black text-slate-700">یادداشت تکمیلی / کد شخص قدیمی</label>
                            <select
                              value={personIOMappings.additionalNotes}
                              onChange={(e) => setPersonIOMappings(prev => ({ ...prev, additionalNotes: Number(e.target.value) }))}
                              className="w-full text-xs font-bold border rounded-lg p-1.5 mt-1 text-slate-800 outline-none"
                            >
                              <option value={-1}>ندارد</option>
                              {parsedHeaders.map((hdr, idx) => (
                                <option key={idx} value={idx}>ستون {idx + 1}: {hdr || '(خالی)'}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Quick preview of mapping before clicking Import */}
                        <div className="bg-indigo-50/30 p-4 border border-indigo-150/50 rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-black text-indigo-900">پیش‌نمایش ستون‌های تفکیک شده (سه ردیف نخست):</span>
                          </div>
                          
                          <div className="overflow-x-auto text-[11px] font-medium text-indigo-950 max-h-36">
                            <table className="w-full bg-white border border-slate-150 rounded-lg overflow-hidden divide-y divide-slate-100">
                              <thead>
                                <tr className="bg-indigo-50 text-indigo-900 font-extrabold select-none">
                                  {parsedHeaders.slice(0, 7).map((h, i) => (
                                    <th key={i} className="py-2 px-3 text-right">ستون {i + 1}: {h || '-'}</th>
                                  ))}
                                  {parsedHeaders.length > 7 && <th className="py-2 px-3">... ({parsedHeaders.length - 7} ستون دیگر)</th>}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {parsedRows.slice(0, 3).map((row, rowIdx) => (
                                  <tr key={rowIdx}>
                                    {row.slice(0, 7).map((cell, colIdx) => (
                                      <td key={colIdx} className="py-2 px-3 text-slate-700 truncate max-w-48">{cell || <span className="text-slate-300">-</span>}</td>
                                    ))}
                                    {row.length > 7 && <td className="py-2 px-3 text-slate-400">...</td>}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preview Table for JSON (Standard Backups) */}
                    {parsedHeaders.length > 0 && personsIOFileType === 'json' && (
                      <div className="bg-emerald-50/50 border border-emerald-150/50 p-4 rounded-xl space-y-2 text-emerald-950">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-black">فایل آرشیو استاندارد با موفقیت تایید و بارگذاری شد!</span>
                          </div>
                          <span className="text-xs font-bold text-slate-500">تعداد افراد برای ایمپورت: <strong className="text-emerald-700 font-sans font-black">{parsedRows.length}</strong> نفر</span>
                        </div>
                        <p className="text-xs leading-relaxed font-semibold">
                          فایل بارگذاری شده حاوی تمامی فیلدهای تکمیلی، کدهای سیستمی، حساب‌های بانکی و یادداشت‌های اشخاص است. با کلیک بر روی دکمه ثبت نهایی، بدون نیاز به نقشه‌برداری ستون‌ها، تمامی پرونده‌ها مستقیماً بازیابی خواهند شد.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center rounded-b-2xl">
                <div className="text-xs text-slate-450 font-bold">
                  توسعه‌یافته مطابق دقیق‌ترین سناریوهای حسابداری بازرگانی
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPersonIOModalOpen(false)}
                    className="px-5 py-2.5 text-slate-700 font-extrabold hover:bg-slate-200/70 border-none bg-slate-100 rounded-xl transition-all text-sm cursor-pointer"
                  >
                    انصراف و بازگشت
                  </button>
                  
                  {personIOAction === 'import' && (
                    <button
                      type="button"
                      disabled={parsedRows.length === 0 || (personsIOFileType !== 'json' && personIOMappings.name === -1)}
                      onClick={() => {
                        const confirmMsg = personsIOFileType === 'json' 
                          ? `آیا از ورود نهایی ${parsedRows.length} نفر شخص جدید به پایگاه داده از روی فایل پشتیبان اطمینان دارید؟`
                          : `آیا از ثبت گروهی ${parsedRows.length} شخص طبق تناظر ستونی انتخاب‌شده اطمینان دارید؟`;
                        
                        confirmAction(confirmMsg, async () => {
                          let successCount = 0;
                          
                          for (const row of parsedRows) {
                            let mappedName = '';
                            
                            if (personsIOFileType === 'json') {
                              mappedName = row[0] || '';
                            } else {
                              const nameIdx = personIOMappings.name;
                              if (nameIdx !== -1 && row[nameIdx]) {
                                mappedName = row[nameIdx].trim();
                              }
                            }
                            
                            if (!mappedName) continue; // Skip rows with no name
                            
                            let mappedType: 'real' | 'legal' = 'real';
                            let mappedRole: 'customer' | 'supplier' | 'employee' = 'customer';
                            let phone = '';
                            let nationalId = '';
                            let fatherName = '';
                            let companyName = '';
                            let address = '';
                            let bankName = '';
                            let bankAccountNumber = '';
                            let cardNumber = '';
                            let shebaNumber = '';
                            let additionalNotes = '';
                            let personCode = '';
                            
                            if (personsIOFileType === 'json') {
                              mappedType = (row[1] || 'real') as any;
                              mappedRole = (row[2] || 'customer') as any;
                              phone = row[3] || '';
                              nationalId = row[4] || '';
                              fatherName = row[5] || '';
                              companyName = row[6] || '';
                              address = row[7] || '';
                              bankName = row[8] || '';
                              bankAccountNumber = row[9] || '';
                              cardNumber = row[10] || '';
                              shebaNumber = row[11] || '';
                              additionalNotes = row[12] || '';
                              personCode = row[13] || '';
                            } else {
                              // Custom Mapper Parser
                              const phoneIdx = personIOMappings.phone;
                              if (phoneIdx !== -1 && row[phoneIdx]) phone = row[phoneIdx].trim();
                              
                              const idIdx = personIOMappings.nationalId;
                              if (idIdx !== -1 && row[idIdx]) nationalId = row[idIdx].trim();
                              
                              const fatIdx = personIOMappings.fatherName;
                              if (fatIdx !== -1 && row[fatIdx]) fatherName = row[fatIdx].trim();

                              const cmpIdx = personIOMappings.companyName;
                              if (cmpIdx !== -1 && row[cmpIdx]) companyName = row[cmpIdx].trim();

                              const adrIdx = personIOMappings.address;
                              if (adrIdx !== -1 && row[adrIdx]) address = row[adrIdx].trim();

                              const noteIdx = personIOMappings.additionalNotes;
                              if (noteIdx !== -1 && row[noteIdx]) additionalNotes = row[noteIdx].trim();

                              // Auto-detect type
                              const typeIdx = personIOMappings.personType;
                              if (typeIdx !== -1 && row[typeIdx]) {
                                const tVal = row[typeIdx].trim().toLowerCase();
                                if (tVal.includes('حقوق') || tVal.includes('legal') || tVal.includes('co') || tVal.includes('شرکت')) {
                                  mappedType = 'legal';
                                }
                              }
                              
                              // Auto-detect role
                              const rIdx = personIOMappings.role;
                              if (rIdx !== -1 && row[rIdx]) {
                                const rVal = row[rIdx].trim().toLowerCase();
                                if (rVal.includes('تامین') || rVal.includes('supplier') || rVal.includes('فروشنده')) {
                                  mappedRole = 'supplier';
                                } else if (rVal.includes('کارم') || rVal.includes('employ') || rVal.includes('پرسنل')) {
                                  mappedRole = 'employee';
                                }
                              }
                            }
                            
                            // Call API to append
                            await addPerson({
                              name: mappedName,
                              personType: mappedType,
                              role: mappedRole,
                              phone,
                              nationalId,
                              fatherName,
                              companyName: mappedType === 'legal' ? (companyName || mappedName) : companyName,
                              address,
                              bankName,
                              bankAccountNumber,
                              cardNumber,
                              shebaNumber,
                              additionalNotes
                            });
                            
                            successCount++;
                          }
                          
                          // Refresh lists
                          await fetchPersons();
                          setIsPersonIOModalOpen(false);
                          setSuccessMsg(`تعداد ${successCount} پرونده شخص با موفقیت به سیستم اضافه گردید.`);
                          
                          // clear forms
                          setPastedPersonsText('');
                          setParsedHeaders([]);
                          setParsedRows([]);
                        });
                      }}
                      className={`px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none shadow-md ${
                        (parsedRows.length > 0 && (personsIOFileType === 'json' || personIOMappings.name !== -1))
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100/60 active:scale-98'
                          : 'bg-indigo-100 text-indigo-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      تایید و ایمپورت نهایی به سیستم
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
        


        {isPersonModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
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
              
              <div className="flex border-b border-gray-100 mt-2 px-6">
                <button
                  type="button"
                  onClick={() => setPersonModalActiveTab('basic')}
                  className={`px-4 py-2 border-b-2 font-bold text-sm transition-colors cursor-pointer ${personModalActiveTab === 'basic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  اطلاعات پایه
                </button>
                <button
                  type="button"
                  onClick={() => setPersonModalActiveTab('contact')}
                  className={`px-4 py-2 border-b-2 font-bold text-sm transition-colors cursor-pointer ${personModalActiveTab === 'contact' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  اطلاعات تماس
                </button>
                <button
                  type="button"
                  onClick={() => setPersonModalActiveTab('financial')}
                  className={`px-4 py-2 border-b-2 font-bold text-sm transition-colors cursor-pointer ${personModalActiveTab === 'financial' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  وضعیت مالی اولیه (افتتاحیه)
                </button>
                <button
                  type="button"
                  onClick={() => setPersonModalActiveTab('settings')}
                  className={`px-4 py-2 border-b-2 font-bold text-sm transition-colors cursor-pointer ${personModalActiveTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  تنظیمات و وضعیت
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="personForm" onSubmit={(e) => { e.preventDefault(); confirmAction('آیا از ثبت اطلاعات شخص اطمینان دارید؟', () => handleSubmitPerson(e as any)) }} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {personModalActiveTab === 'basic' && (
                      <>
                        <div className="w-full text-right md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="w-full text-right">
                            <label className="block text-sm font-bold text-slate-700 mb-2">نوع موجودیت</label>
                            <select
                              value={newPersonType}
                              onChange={(e) => setNewPersonType(e.target.value as 'real' | 'legal')}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors text-slate-900 bg-white font-bold"
                            >
                              <option value="real">حقیقی (فرد)</option>
                              <option value="legal">حقوقی (شرکت / سازمان)</option>
                            </select>
                          </div>
                          
                          <div className="w-full text-right">
                            <label className="block text-sm font-bold text-slate-700 mb-2">نقش ارتباطی</label>
                            <select
                              value={newPersonRole}
                              onChange={(e) => setNewPersonRole(e.target.value)}
                              disabled={!!editingPersonId}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors text-slate-900 bg-white font-bold disabled:bg-slate-100 disabled:cursor-not-allowed"
                            >
                              {!newPersonRole && <option value="">انتخاب نقش...</option>}
                              {personRoles.map(r => (
                                <option key={r.id} value={r.id}>{r.name} (کد: {r.code})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {newPersonType === 'real' ? (
                          <>
                            <div className="w-full text-right md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="w-full text-right">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  عنوان
                                </label>
                                <select
                                  value={newPersonTitle}
                                  onChange={(e) => setNewPersonTitle(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900 bg-white"
                                >
                                  <option value="">-- انتخاب کنید --</option>
                                  <option value="آقای">آقای</option>
                                  <option value="خانم">خانم</option>
                                  <option value="دکتر">دکتر</option>
                                  <option value="مهندس">مهندس</option>
                                  <option value="سید">سید</option>
                                  <option value="سیده">سیده</option>
                                  <option value="استاد">استاد</option>
                                </select>
                              </div>
                              
                              <div className="w-full text-right">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  نام مستعار / نمایشی
                                </label>
                                <input
                                  type="text"
                                  value={newPersonAlias}
                                  onChange={(e) => setNewPersonAlias(e.target.value)}
                                  placeholder={`مثال: ${newPersonTitle ? newPersonTitle + ' ' : ''}${newPersonFirstName ? newPersonFirstName + ' ' : ''}${newPersonLastName || ''}`.trim() || 'خودکار ایجاد می‌شود'}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900"
                                />
                              </div>
                            </div>

                            <div className="w-full text-right">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                نام <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={newPersonFirstName}
                                onChange={(e) => setNewPersonFirstName(e.target.value)}
                                placeholder="نام"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900"
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
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900"
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
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900"
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
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900 text-left"
                                dir="ltr"
                              />
                            </div>
                            <div className="w-full text-right">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                کد حسابداری (اختیاری)
                              </label>
                              <input
                                type="text"
                                value={newPersonAccountingCode}
                                onChange={(e) => setNewPersonAccountingCode(e.target.value)}
                                placeholder="مانند: 1205001"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900 text-left"
                                dir="ltr"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-full text-right md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="w-full text-right">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  نام شرکت / سازمان <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={newPersonCompanyName}
                                  onChange={(e) => setNewPersonCompanyName(e.target.value)}
                                  placeholder="مثال: شرکت توسعه تجارت البرز"
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900"
                                  required
                                />
                              </div>
                              
                              <div className="w-full text-right">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  نام مستعار / تجاری
                                </label>
                                <input
                                  type="text"
                                  value={newPersonAlias}
                                  onChange={(e) => setNewPersonAlias(e.target.value)}
                                  placeholder={`مثال: ${newPersonCompanyName || 'شرکت البرز'}`}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900"
                                />
                              </div>
                            </div>
                            <div className="w-full text-right md:col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                شناسه ملی شرکت
                              </label>
                              <input
                                type="text"
                                value={newPersonNationalId}
                                onChange={(e) => setNewPersonNationalId(e.target.value)}
                                placeholder="شناسه ملی"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900 text-left"
                                dir="ltr"
                              />
                            </div>
                            <div className="w-full text-right md:col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                کد حسابداری (اختیاری)
                              </label>
                              <input
                                type="text"
                                value={newPersonAccountingCode}
                                onChange={(e) => setNewPersonAccountingCode(e.target.value)}
                                placeholder="مانند: 1205001"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900 text-left"
                                dir="ltr"
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {personModalActiveTab === 'contact' && (
                      <>
                        <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            استان
                          </label>
                          <input
                            type="text"
                            value={newPersonProvince}
                            onChange={(e) => setNewPersonProvince(e.target.value)}
                            placeholder="نام استان"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900"
                          />
                        </div>
                        <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            شهر
                          </label>
                          <input
                            type="text"
                            value={newPersonCity}
                            onChange={(e) => setNewPersonCity(e.target.value)}
                            placeholder="نام شهر"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900"
                          />
                        </div>
                        <div className="w-full text-right md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            آدرس پستی
                          </label>
                          <textarea
                            value={newPersonAddress}
                            onChange={(e) => setNewPersonAddress(e.target.value)}
                            placeholder="آدرس دقیق و کامل"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900"
                          />
                        </div>
                        <div className="w-full text-right md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            شماره تماس (تلفن / موبایل)
                          </label>
                          <input
                            type="text"
                            value={newPersonPhone}
                            onChange={(e) => setNewPersonPhone(e.target.value)}
                            placeholder="مثال: 09120000000"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900 text-left font-mono"
                            dir="ltr"
                          />
                        </div>
                      </>
                    )}

                    {personModalActiveTab === 'financial' && (
                      <div className="w-full text-right md:col-span-2 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
                           <div className="absolute left-0 top-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                           
                           <div className="w-full relative z-10 md:col-span-2">
                             <h4 className="text-sm font-black text-amber-900 mb-2">ثبت مانده حساب از قبل (افتتاحیه)</h4>
                             <p className="text-xs text-amber-700/80 leading-relaxed max-w-2xl">
                               در صورتی که این شخص قبل از شروع کار با این سیستم، در حساب و کتاب‌های قبلی شما دارای مانده طلب یا بدهی است، مبلغ آن را در اینجا وارد کنید تا در اولین رکورد پرونده مالی (دفتر معین) ثبت شود. 
                             </p>
                           </div>
                           
                           <div className="w-full relative z-10">
                              <label className="block text-sm font-bold text-amber-900 mb-2">نوع مانده اولیه</label>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setNewPersonInitialBalanceType('debtor')}
                                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                                    newPersonInitialBalanceType === 'debtor' 
                                      ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200' 
                                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  بدهکار
                                  <span className="block text-[9px] font-normal opacity-80 mt-1">(او به ما بدهکار است)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewPersonInitialBalanceType('creditor')}
                                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                                    newPersonInitialBalanceType === 'creditor' 
                                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200' 
                                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  بستانکار
                                  <span className="block text-[9px] font-normal opacity-80 mt-1">(ما به او بدهکاریم)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewPersonInitialBalanceType('settled')}
                                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                                    newPersonInitialBalanceType === 'settled' 
                                      ? 'bg-slate-700 text-white border-slate-800 shadow-md shadow-slate-200' 
                                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  بی‌حساب
                                  <span className="block text-[9px] font-normal opacity-80 mt-1">(حساب صفر است)</span>
                                </button>
                              </div>
                           </div>

                           <div className={`w-full relative z-10 transition-opacity duration-300 ${newPersonInitialBalanceType === 'settled' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                              <label className="block text-sm font-bold text-amber-900 mb-2">مبلغ مانده ({storeSettings?.currency || 'تومان'})</label>
                              <CurrencyInput
                                value={newPersonInitialBalance}
                                onChange={(e: any) => setNewPersonInitialBalance(e.target.value)}
                                placeholder="مثلا: 1500000"
                                className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500 shadow-sm transition-colors text-amber-950 font-mono text-left font-bold bg-white"
                                disabled={newPersonInitialBalanceType === 'settled'}
                              />
                           </div>
                        </div>
                      </div>
                    )}

                    {personModalActiveTab === 'settings' && (
                      <>
                        <div className="w-full text-right md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                          <div className="flex justify-between items-center mb-4">
                            <label className="block text-xs font-black text-slate-700">
                              وضعیت فعالیت
                            </label>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={newPersonIsActive} 
                                onChange={(e) => setNewPersonIsActive(e.target.checked)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                            <span className="text-sm font-bold text-gray-800">
                              {newPersonIsActive ? 'حساب فعال است' : 'حساب غیرفعال'}
                            </span>
                          </div>
                        </div>

                        <div className="w-full text-right z-50 relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            تاریخ عضویت / ثبت
                          </label>
                          <DatePicker
                            value={newPersonRegistrationDate}
                            onChange={(date: any) => setNewPersonRegistrationDate(date?.toDate?.() || new Date())}
                            calendar={storeSettings?.calendarType === 'gregorian' ? undefined : persian}
                            locale={storeSettings?.calendarType === 'gregorian' ? undefined : persian_fa}
                            calendarPosition="bottom-right"
                            inputClass="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900 font-mono text-center outline-none"
                            containerClassName="w-full"
                          />
                        </div>

                        <div className="w-full text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-black text-slate-700">
                              گروه‌بندی شخص
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setIsPersonModalOpen(false);
                                setActiveTab('person_groups' as any);
                              }}
                              className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-colors border border-indigo-200 cursor-pointer"
                            >
                              مدیریت گروه‌ها
                            </button>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 mt-1">
                            <select
                              value={newPersonGroup}
                              onChange={(e) => setNewPersonGroup(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-950 font-bold text-sm bg-white"
                            >
                              <option value="">بدون گروه</option>
                              {personGroups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
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

        {isWarehouseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-md max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Box className="w-5 h-5 text-indigo-500" />
                  ثبت انبار جدید
                </h3>
                <button
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="warehouseForm" onSubmit={(e) => { e.preventDefault(); confirmAction('آیا از ثبت انبار اطمینان دارید؟', () => handleSubmitWarehouse(e as any)) }} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4">
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام انبار <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newWarehouseName}
                        onChange={(e) => setNewWarehouseName(e.target.value)}
                        placeholder="مثال: انبار مرکزی"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                        required
                      />
                    </div>
                    
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        مسئول انبار (انباردار)
                      </label>
                      <input
                        type="text"
                        value={newWarehouseManager}
                        onChange={(e) => setNewWarehouseManager(e.target.value)}
                        placeholder="مثال: علی احمدی"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        موقعیت مکانی یا آدرس
                      </label>
                      <input
                        type="text"
                        value={newWarehouseLocation}
                        onChange={(e) => setNewWarehouseLocation(e.target.value)}
                        placeholder="مثال: سوله‌ی شماره ۲"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-900"
                      />
                    </div>

                    <div className="w-full text-right flex items-center justify-between border border-gray-100 p-4 rounded-xl mt-2 bg-slate-50">
                       <label className="text-sm font-bold text-gray-700 cursor-pointer select-none" onClick={() => setNewWarehouseIsActive(!newWarehouseIsActive)}>وضعیت انبار (فعال / غیرفعال)</label>
                       <div 
                         className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors flex items-center ${newWarehouseIsActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                         onClick={() => setNewWarehouseIsActive(!newWarehouseIsActive)}
                       >
                         <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${newWarehouseIsActive ? '-translate-x-[24px]' : 'translate-x-0'}`} />
                       </div>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors shadow-sm"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="warehouseForm"
                  disabled={submittingWarehouse}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingWarehouse ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {editingWarehouseId ? 'ذخیره انبار' : 'ثبت انبار'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Invoice Saved Viewer / Print Sheet Modals */}
        {viewingInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/55 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-4xl max-h-[95vh] flex flex-col print-section print:max-h-none print:h-auto print:overflow-visible print:border-none print:shadow-none print:rounded-none"
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
              <div className="p-6 md:p-8 overflow-y-auto flex-1 text-gray-800 text-sm print:overflow-visible print:px-8 print:py-12 bg-gray-50/50 print:bg-white flex justify-center">
                 {/* Print Layout */}
                <div className={"bg-white print:p-0 rounded-2xl print:rounded-none overflow-hidden text-slate-800 w-full shadow-sm border border-slate-200 print:shadow-none print:border-none p-8 md:p-12 relative flex flex-col font-sans " + (storeSettings.print_paper_size === 'A5' ? 'max-w-[148mm] min-h-[210mm]' : storeSettings.print_paper_size === 'receipt80' ? 'max-w-[80mm] min-h-[100mm] print:text-xs' : storeSettings.print_paper_size === 'receipt58' ? 'max-w-[58mm] min-h-[100mm] print:text-[10px]' : 'max-w-[210mm] min-h-[297mm]')}>
                  
                  {/* Elegant Header - Classic Invoice */}
                  <div className="flex flex-col md:flex-row justify-between items-start pb-8 mb-8 border-b-2 border-slate-800">
                    <div className="space-y-6">
                      <div className="inline-block border-2 border-indigo-900 px-4 py-2 rounded-lg bg-indigo-50/30">
                         <h1 className="text-2xl font-black text-indigo-900 tracking-tight text-center">
                           {viewingInvoice.type === 'purchase' ? 'فاکتور خرید' : viewingInvoice.type === 'sale' ? (viewingInvoice.title || 'فاکتور فروش') : viewingInvoice.type === 'warehouse_receipt' ? 'رسید ورود کالا (انبار)' : viewingInvoice.type === 'warehouse_remittance' ? 'حواله خروج کالا (انبار)' : 'سند ساختگی'}
                         </h1>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs text-slate-700">
                         <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold whitespace-nowrap">تاریخ صدور:</span> 
                            <span className="font-bold text-sm tracking-wide">{viewingInvoice.jalaliDate || (viewingInvoice.date && new Date(viewingInvoice.date).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'))}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold whitespace-nowrap">شماره سند:</span> 
                            <span className="font-bold text-sm tracking-wide">#{toPersianDigits(viewingInvoice.invoiceNumber)}</span>
                         </div>
                         {(viewingInvoice.type === 'purchase' || viewingInvoice.type === 'purchase_return') && viewingInvoice.sellerInvoiceNumber && (
                            <div className="flex items-center gap-2 col-span-2 mt-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded border border-emerald-100/50 w-fit">
                               <span className="text-slate-500 font-bold whitespace-nowrap">شماره فاکتور فروشنده (ارجاع):</span> 
                               <span className="font-mono font-bold text-sm tracking-wide">#{toPersianDigits(viewingInvoice.sellerInvoiceNumber)}</span>
                            </div>
                         )}
                      </div>
                    </div>
                    <div className="text-right md:text-left flex flex-col items-end mt-6 md:mt-0 text-slate-800">
                       {storeSettings.print_show_logo !== false && storeSettings.logoUrl && (
                           <img src={storeSettings.logoUrl} alt="Logo" className="w-16 h-16 object-contain mb-3 grayscale print:grayscale-0" />
                       )}
                       <h2 className="text-2xl font-black mb-3">{storeSettings.storeName || 'کسب و کار سیستم'}</h2>
                       {storeSettings.phone && <div className="text-sm font-bold flex items-center justify-end gap-1.5"><span dir="ltr">{toPersianDigits(storeSettings.phone)}</span> <span className="text-slate-400 text-xs">تلفن</span></div>}
                       {storeSettings.address && <div className="text-xs font-bold leading-relaxed max-w-[280px] text-right mt-1.5">{storeSettings.address}</div>}
                    </div>
                  </div>

                  {/* Info blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* Customer Info */}
                    <div className="border-t border-b border-slate-200 py-4 font-sans">
                      <div className="text-xs font-bold text-indigo-600 mb-3 flex items-center gap-1.5">
                         <User className="w-4 h-4" />
                         {viewingInvoice.type === 'purchase' ? 'تامین کننده' : viewingInvoice.type === 'sale' ? 'خریدار' : 'طرف حساب'}
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">{renderPersonLink(viewingInvoice.customerId, viewingInvoice.customerName)}</h3>
                      {viewingInvoice.customerPhone && <div className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><span className="text-slate-400 text-xs">تلفن:</span><span dir="ltr">{toPersianDigits(viewingInvoice.customerPhone)}</span></div>}
                      {(() => {
                        const originalPerson = persons.find(p => p.name === viewingInvoice.customerName || p.id === viewingInvoice.customerId);
                        if (originalPerson) {
                          return (
                            <div className="space-y-1.5 text-xs text-slate-600 font-bold mt-2">
                              {originalPerson.nationalId && <div className="flex items-center gap-2"><span className="text-slate-400">کد ملی / اقتصادی:</span><span>{toPersianDigits(originalPerson.nationalId)}</span></div>}
                              {originalPerson.address && <div className="flex items-start gap-2 whitespace-normal leading-relaxed mt-1"><span className="text-slate-400 whitespace-nowrap">نشانی:</span><span>{originalPerson.address}</span></div>}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Payment/Warehouse Info */}
                    <div className="border-t border-b border-slate-200 py-4 flex flex-col font-sans">
                        {!viewingInvoice.type?.includes('warehouse') ? (
                           <div className="flex flex-col gap-2">
                              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1.5">
                                 <DollarSign className="w-4 h-4" />
                                 ارزش کل معامله
                              </span>
                              <div className="text-3xl font-black text-slate-900 inline-flex items-baseline gap-1 mt-2">
                                {toPersianDigits(formatCurrency(viewingInvoice.totalAmount))} <span className="text-sm font-bold text-slate-500">{showInvoiceCurrency(viewingInvoice.currency)}</span>
                              </div>
                           </div>
                        ) : (
                           <div className="flex flex-col gap-2">
                              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1.5">
                                <Box className="w-4 h-4"/> انبار ثبت سند
                              </span>
                              <div className="text-xl font-black text-slate-900 mt-2">
                                {warehouses.find(w => w.id?.toString() === viewingInvoice.warehouseId?.toString() || w.id?.toString() === viewingInvoice.items?.[0]?.warehouseId?.toString())?.name || 'نامشخص'}
                              </div>
                           </div>
                        )}
                        {viewingInvoice.description && (
                           <div className="mt-4 text-xs leading-relaxed text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                              <span className="font-bold text-slate-400 inline-block ml-1">توضیحات:</span> 
                              <span className="font-bold">{viewingInvoice.description}</span>
                           </div>
                        )}
                    </div>
                  </div>

                  {/* Items table */}
                  <div className="border-2 border-slate-200 print:border-slate-800 rounded-xl overflow-hidden mb-8">
                    <table className="w-full text-right text-sm border-collapse bg-white font-sans">
                       <thead className="bg-slate-100 print:bg-slate-100 border-b-2 border-slate-200 print:border-slate-800">
                          <tr>
                             <th className="py-3 px-3 w-12 text-center font-bold text-slate-700 text-xs border-l border-slate-200 print:border-slate-400">ردیف</th>
                             <th className="py-3 px-4 font-bold text-slate-700 text-sm border-l border-slate-200 print:border-slate-400">شرح کالا یا خدمات</th>
                             <th className="py-3 px-3 w-24 text-center font-bold text-slate-700 text-xs border-l border-slate-200 print:border-slate-400">مقدار</th>
                             {!viewingInvoice.type?.includes('warehouse') && (
                                <>
                                   <th className="py-3 px-3 text-center w-36 font-bold text-slate-700 text-xs border-l border-slate-200 print:border-slate-400">فی ({showInvoiceCurrency(viewingInvoice.currency)})</th>
                                   <th className="py-3 px-3 text-center w-20 font-bold text-slate-700 text-xs border-l border-slate-200 print:border-slate-400">تخفیف</th>
                                   <th className="py-3 px-3 w-44 text-center font-bold text-slate-700 text-xs">مبلغ کل ({showInvoiceCurrency(viewingInvoice.currency)})</th>
                                </>
                             )}
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 print:divide-slate-300 text-slate-800 text-sm">
                          {viewingInvoice.items?.filter((it: any) => it.productName || it.productId || (it.quantity > 0 && it.unitPrice > 0)).map((item: any, idx: number) => (
                            <tr key={idx} className="group print:hover:bg-transparent">
                              <td className="py-3 px-3 text-center border-l border-slate-100 print:border-slate-400 font-bold text-slate-500">{toPersianDigits(idx + 1)}</td>
                              <td className="py-3 px-4 border-l border-slate-100 print:border-slate-400">
                                 <div className="flex flex-col gap-1">
                                    <span className="text-slate-900 font-bold tracking-tight">{item.productName || 'تحریر نشده'}</span>
                                    {item.warehouseId && (
                                      <span className="text-[10px] text-slate-400 font-bold">
                                        از انبار: {warehouses.find(w => w.id?.toString() === item.warehouseId?.toString())?.name || '-'}
                                      </span>
                                    )}
                                 </div>
                              </td>
                              <td className="py-3 px-3 text-center border-l border-slate-100 print:border-slate-400">
                                 <span className="font-bold text-slate-900 ml-1.5 text-base">{toPersianDigits(formatNumber(item.quantity || 1))}</span>
                                 <span className="text-xs text-slate-500 font-bold hidden md:inline-block">{item.selectedUnit || ''}</span>
                              </td>
                              {!viewingInvoice.type?.includes('warehouse') && (
                                 <>
                                    <td className="py-3 px-3 text-center border-l border-slate-100 print:border-slate-400 font-bold text-slate-700 text-base">{toPersianDigits(formatCurrency(item.unitPrice || 0))}</td>
                                    <td className="py-3 px-3 text-center border-l border-slate-100 print:border-slate-400 font-bold text-rose-600 text-base" dir="ltr">{item.discountPercent > 0 ? `${toPersianDigits(item.discountPercent)}٪` : '-'}</td>
                                    <td className="py-3 px-3 text-center font-black text-slate-900 bg-slate-50/50 print:bg-transparent text-base">{toPersianDigits(formatCurrency(item.totalPrice || 0))}</td>
                                 </>
                              )}
                            </tr>
                          ))}
                          {/* Empty spacer rows to fill page slightly if needed */}
                          {viewingInvoice.items?.length < 3 && Array.from({length: 3 - (viewingInvoice.items?.length || 0)}).map((_, i) => (
                             <tr key={`empty-${i}`} className="h-12 border-t border-slate-100 print:border-slate-300">
                                <td className="border-l border-slate-100 print:border-slate-400"></td>
                                <td className="border-l border-slate-100 print:border-slate-400"></td>
                                <td className="border-l border-slate-100 print:border-slate-400"></td>
                                {!viewingInvoice.type?.includes('warehouse') && (
                                   <>
                                      <td className="border-l border-slate-100 print:border-slate-400"></td>
                                      <td className="border-l border-slate-100 print:border-slate-400"></td>
                                      <td></td>
                                   </>
                                )}
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>

                  {/* Summary Section */}
                  {!viewingInvoice.type?.includes('warehouse') && (
                     <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8 font-sans">
                        <div className="w-full md:w-[50%] flex flex-col justify-between self-stretch">
                           <div className="border border-slate-200 print:border-slate-300 rounded-xl p-5 bg-slate-50/50 print:bg-transparent">
                              <span className="text-xs text-slate-500 font-bold block mb-2">جمع مبلغ به حروف (تومان)</span>
                              <p className="text-slate-900 font-black text-base leading-loose">
                                 {numToPersianWords(viewingInvoice.totalAmount)} {showInvoiceCurrency(viewingInvoice.currency)}
                              </p>
                           </div>
                           <p className="text-[10px] text-slate-400 font-bold leading-loose text-justify mt-4 print:text-slate-500 border-t border-slate-100 print:border-slate-200 pt-4">
                              مشتری گرامی، خواهشمند است اقلام را در زمان تحویل به دقت بررسی نمایید. پس از تحویل، مجموعه هیچگونه مسئولیتی در قبال کسری یا آسیب‌دیدگی ظاهری نمی‌پذیرد.
                           </p>
                        </div>
                        <div className="w-full md:w-[45%] ml-auto border-2 border-slate-200 print:border-slate-800 rounded-xl overflow-hidden font-bold">
                           <div className="flex justify-between px-5 py-3 border-b border-slate-200 print:border-slate-300 bg-white">
                             <span className="text-sm text-slate-600">جمع کل (بدون تخفیف)</span>
                             <span className="font-bold text-slate-900 text-base">{toPersianDigits(formatCurrency(viewingInvoice.items?.reduce((sum: number, it: any) => sum + ((it.quantity || 0) * (it.unitPrice || 0)), 0) || 0))}</span>
                           </div>
                           <div className="flex justify-between px-5 py-3 border-b border-slate-200 print:border-slate-300 bg-white">
                             <span className="text-sm text-rose-600">مجموع تخفیف‌ها</span>
                             <span className="font-bold text-rose-600 text-base">{toPersianDigits(formatCurrency(Math.max(0, (viewingInvoice.items?.reduce((sum: number, it: any) => sum + ((it.quantity || 0) * (it.unitPrice || 0)), 0) || 0) - viewingInvoice.totalAmount)))}</span>
                           </div>
                           <div className="flex justify-between p-5 bg-slate-100 print:bg-slate-100 text-slate-900 items-center">
                             <span className="text-base font-black text-slate-800">مبلغ نهایی فاکتور</span>
                             <div className="flex items-baseline gap-1.5" dir="ltr">
                                <span className="text-2xl font-black text-indigo-900">{toPersianDigits(formatCurrency(viewingInvoice.totalAmount))}</span>
                                <span className="text-xs font-bold text-slate-500">{showInvoiceCurrency(viewingInvoice.currency)}</span>
                             </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Payment Allocation History */}
                  {storeSettings.print_show_financial !== false && !viewingInvoice.type?.includes('warehouse') && (() => {
                    const allocatedTxs = transactions.filter(t => t.linkedInvoices && t.linkedInvoices[viewingInvoice.id] > 0);
                    if (allocatedTxs.length > 0) {
                      return (
                        <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden">
                          <div className="bg-slate-50 border-b border-slate-200 p-2.5">
                            <span className="font-extrabold text-xs text-slate-600 mr-2">تاریخچه دریافت / پرداخت برای این سند</span>
                          </div>
                          <table className="w-full text-right text-xs font-bold text-slate-600 bg-white">
                            <thead className="border-b border-slate-200 bg-slate-50/50">
                              <tr>
                                <th className="py-2 px-3 border-l border-slate-200 font-extrabold w-28">شماره پیگیری</th>
                                <th className="py-2 px-3 border-l border-slate-200 font-extrabold w-28">تاریخ واریز</th>
                                <th className="py-2 px-3 border-l border-slate-200 font-extrabold">جزئیات حساب/صندوق</th>
                                <th className="py-2 px-3 text-center font-extrabold w-40">ارزش ثبت شده</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {allocatedTxs.map(tx => (
                                <tr key={tx.id}>
                                  <td className="py-2 px-3 font-sans font-bold text-slate-500 border-l border-slate-200">{toPersianDigits(tx.receiptNumber) || `#${toPersianDigits(tx.id)}`}</td>
                                  <td className="py-2 px-3 font-sans font-bold border-l border-slate-200">{toPersianDigits(tx.jalaliDate)}</td>
                                  <td className="py-2 px-3 border-l border-slate-200">{accounts.find(a => a.id.toString() === tx.accountId?.toString())?.title || cashboxes.find(c => c.id.toString() === tx.cashboxId?.toString())?.name || 'نامشخص'}</td>
                                  <td className="py-2 px-3 text-center font-sans font-black text-slate-800">{toPersianDigits(formatCurrency(tx.linkedInvoices![viewingInvoice.id]))}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                              <tr>
                                <td colSpan={3} className="py-2.5 px-3 text-left font-black text-slate-700 border-l border-slate-200">مجموع پرداختی:</td>
                                <td className="py-2.5 px-3 text-center font-sans font-black text-slate-800">{toPersianDigits(formatCurrency(viewingInvoice.paidAmount || 0))}</td>
                              </tr>
                              <tr>
                                <td colSpan={3} className="py-2 px-3 text-left font-black text-rose-500 border-l border-slate-200">بدهی باقیمانده مانده (تراز):</td>
                                <td className="py-2 px-3 text-center font-sans font-black text-rose-600">{toPersianDigits(formatCurrency(Math.max((viewingInvoice.totalAmount || 0) - (viewingInvoice.paidAmount || 0), 0)))}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Footer Notes & Signature Block */}
                  {storeSettings.print_footer_note && (
                     <div className="mb-6 text-[10px] font-bold text-slate-500 text-center leading-relaxed">
                        {storeSettings.print_footer_note}
                     </div>
                  )}
                  
                  <div className={`grid pt-6 pb-2 text-center text-xs font-extrabold text-slate-400 ${storeSettings.print_signature_3 ? 'grid-cols-3 gap-8' : 'grid-cols-2 gap-16'} `}>
                    <div className="pt-6 border-t border-slate-200 px-4 w-5/6 mx-auto">
                      {storeSettings.print_signature_1 || (viewingInvoice.type?.includes('warehouse') ? 'تأیید تحویل‌گیرنده' : 'امضای مشتری')}
                    </div>
                    {storeSettings.print_signature_3 && (
                       <div className="pt-6 border-t border-slate-200 px-4 w-5/6 mx-auto">
                          {storeSettings.print_signature_3}
                       </div>
                    )}
                    <div className="pt-6 border-t border-slate-200 px-4 w-5/6 mx-auto text-slate-700">
                      {storeSettings.print_signature_2 || (viewingInvoice.type?.includes('warehouse') ? `تأیید حواله‌دهنده (${storeSettings.storeName})` : `مهر و اعتبار ${storeSettings.storeName}`)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky bottom (No print) */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 no-print">
                {(viewingInvoice.isDraft || viewingInvoice.status === 'draft') && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewingInvoice(null);
                      handleEditInvoiceAction(viewingInvoice);
                    }}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-xs"
                  >
                    <Edit2 className="w-4 h-4" />
                    ویرایش و ثبت نهایی پیش‌نویس
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  چاپ و پرینت سند
                </button>
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

        
        {/* Person Ledger Drawer overlay */}
        <AnimatePresence>
          {drawerPersonId && (() => {
            const selectedPerson = persons.find(p => p.id.toString() === drawerPersonId.toString());
            if (!selectedPerson) return null;

            // Calculations
            // Invoices
            const invoiceEntries = invoices
              .filter(inv => inv.customerId?.toString() === drawerPersonId.toString() && inv.type !== 'warehouse_receipt' && inv.type !== 'warehouse_remittance')
              .map(inv => {
                const isSale = inv.type === 'sale';
                const isProforma = inv.type === 'proforma';
                const amount = (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency);
                const itemsSummary = inv.items && inv.items.length > 0
                  ? ` (شامل: ${inv.items.map((it: any) => it.name).join('، ')})`
                  : '';
                const baseDesc = inv.title || (inv.type === 'proforma' ? 'ثبت پیش‌فاکتور' : (inv.type === 'purchase' ? 'خرید طی فاکتور' : 'فروش طی فاکتور'));
                return {
                  id: `inv-${inv.id}`,
                  refId: inv.invoiceNumber || `#${inv.id}`,
                  date: inv.date,
                  jalaliDate: inv.jalaliDate || new Date(inv.date).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'),
                  type: inv.type === 'proforma' ? 'پیش‌فاکتور' : (inv.type === 'purchase' ? 'فاکتور خرید کالا' : 'فاکتور فروش کالا'),
                  desc: `${baseDesc}${itemsSummary}`,
                  debit: (isSale && !isProforma) ? amount : 0,
                  credit: (!isSale && !isProforma) ? amount : 0,
                  rawItem: inv,
                  entryType: 'invoice'
                };
              });

            // Transactions
            const transactionEntries = transactions
              .filter(t => t.personId?.toString() === drawerPersonId.toString() && t.method !== 'check')
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
                  refId: t.receiptNumber || `سند #${t.id}`,
                  date: t.date,
                  jalaliDate: t.jalaliDate || new Date(t.date).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'),
                  type: typeLabel,
                  desc: finalDesc,
                  debit,
                  credit,
                  rawItem: t,
                  entryType: 'transaction'
                };
              });

            // Issued Checks
            const issuedCheckEntries = issuedChecks
              .filter(c => c.payeeId?.toString() === drawerPersonId.toString() && c.status !== 'blank' && c.status !== 'cancelled')
              .flatMap(c => {
                const entries = [];
                
                // Base entry for Issuance
                entries.push({
                  id: `ic-${c.id}-issued`,
                  refId: c.checkNumber || `چک صادره #${c.id}`,
                  date: c.issueDate || c.dueDate || new Date().toISOString(),
                  jalaliDate: c.issueDate || c.dueDate || '-',
                  type: `چک صادره${c.status === 'issued' || c.status === 'cashed' ? '' : ' (اولیه)'}`,
                  desc: (c.description && !c.description.includes(c.checkNumber)) ? `${c.description} (شماره چک: ${c.checkNumber})` : (c.description || `برگه چک صادره شماره ${c.checkNumber} به سررسید ${c.dueDate}`),
                  debit: c.amount || 0,
                  credit: 0,
                  rawItem: c,
                  entryType: 'issued_check'
                });

                if (c.status === 'bounced') {
                   const bounceHistory = c.history?.find(h => h.status === 'bounced');
                   entries.push({
                     id: `ic-${c.id}-bounced`,
                     refId: c.checkNumber || `چک صادره #${c.id}`,
                     date: bounceHistory?.date || new Date().toISOString(),
                     jalaliDate: bounceHistory?.date ? new Date(bounceHistory.date).toLocaleDateString('fa-IR') : '-',
                     type: `برگشت چک صادره`,
                     desc: `برگشت خوردن چک صادره شماره ${c.checkNumber}`,
                     debit: 0,
                     credit: c.amount || 0,
                     rawItem: c,
                     entryType: 'issued_check'
                   });
                }
                
                if (c.status === 'cancelled') {
                   const cancelHistory = c.history?.find(h => h.status === 'cancelled');
                   entries.push({
                     id: `ic-${c.id}-cancelled`,
                     refId: c.checkNumber || `چک صادره #${c.id}`,
                     date: cancelHistory?.date || new Date().toISOString(),
                     jalaliDate: cancelHistory?.date ? new Date(cancelHistory.date).toLocaleDateString('fa-IR') : '-',
                     type: `ابطال چک صادره`,
                     desc: `ابطال چک صادره شماره ${c.checkNumber}`,
                     debit: 0,
                     credit: c.amount || 0,
                     rawItem: c,
                     entryType: 'issued_check'
                   });
                }

                return entries;
              });

            // Received Checks
            const receivedCheckEntries = receivedChecks
              .filter(c => c.payerId?.toString() === drawerPersonId.toString() && c.status !== 'returned')
              .flatMap(c => {
                const entries = [];
                
                entries.push({
                  id: `rc-${c.id}-received`,
                  refId: c.checkNumber || `چک دریافتی #${c.id}`,
                  date: c.receiveDate || c.dueDate || new Date().toISOString(),
                  jalaliDate: c.receiveDate || c.dueDate || '-',
                  type: `چک دریافتی${(c.status === 'received' || c.status === 'deposited' || c.status === 'cashed') ? '' : ' (اولیه)'}`,
                  desc: c.description || `برگه چک دریافتی شماره ${c.checkNumber} - بانک ${c.bankName} به سررسید ${c.dueDate}`,
                  debit: 0,
                  credit: c.amount || 0,
                  rawItem: c,
                  entryType: 'received_check'
                });

                if (c.status === 'bounced') {
                   const bounceHistory = c.history?.find(h => h.status === 'bounced');
                   entries.push({
                     id: `rc-${c.id}-bounced`,
                     refId: c.checkNumber || `چک دریافتی #${c.id}`,
                     date: bounceHistory?.date || new Date().toISOString(),
                     jalaliDate: bounceHistory?.date ? new Date(bounceHistory.date).toLocaleDateString('fa-IR') : '-',
                     type: `برگشت چک دریافتی`,
                     desc: `برگشت خوردن چک دریافتی شماره ${c.checkNumber}`,
                     debit: c.amount || 0,
                     credit: 0,
                     rawItem: c,
                     entryType: 'received_check'
                   });
                }

                if (c.status === 'returned') {
                   const returnHistory = c.history?.find(h => h.status === 'returned');
                   entries.push({
                     id: `rc-${c.id}-returned`,
                     refId: c.checkNumber || `چک دریافتی #${c.id}`,
                     date: returnHistory?.date || new Date().toISOString(),
                     jalaliDate: returnHistory?.date ? new Date(returnHistory.date).toLocaleDateString('fa-IR') : '-',
                     type: `عودت چک دریافتی`,
                     desc: `عودت برگه چک دریافتی شماره ${c.checkNumber}`,
                     debit: c.amount || 0,
                     credit: 0,
                     rawItem: c,
                     entryType: 'received_check'
                   });
                }

                return entries;
              });

            const getJalaliSortValueDef = (jalaliStr: string) => {
              if (!jalaliStr || jalaliStr === '-') return 0;
              const normalized = jalaliStr.replace(/[۰-۹]/g, (d: string) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
              const parts = normalized.split('/');
              if (parts.length === 3) {
                 const y = parts[0];
                 const m = parts[1].padStart(2, '0');
                 const d = parts[2].split(' ')[0].padStart(2, '0');
                 return parseInt(y + m + d, 10);
              }
              return 0;
            };

            let allEntries = [...invoiceEntries, ...transactionEntries, ...issuedCheckEntries, ...receivedCheckEntries].sort((a, b) => {
              const jA = getJalaliSortValueDef(a.jalaliDate);
              const jB = getJalaliSortValueDef(b.jalaliDate);
              if (jA !== jB && jA !== 0 && jB !== 0) {
                 return jA - jB;
              }
              
              const tA = new Date(a.date).getTime();
              const tB = new Date(b.date).getTime();
              const dateDiff = (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB);
              
              if (dateDiff === 0) {
                return (a.rawItem?.createdAt || 0) - (b.rawItem?.createdAt || 0);
              }
              return dateDiff;
            });
            
            if (selectedPerson.initialBalance && selectedPerson.initialBalanceType !== 'settled') {
               const ibAmount = selectedPerson.initialBalance;
               const isDebtor = selectedPerson.initialBalanceType === 'debtor';
               const ibEntry = {
                 id: 'opening-balance',
                 refId: 'افتتاحیه',
                 date: selectedPerson.registrationDate || new Date().toISOString(),
                 jalaliDate: selectedPerson.registrationDate ? new Date(selectedPerson.registrationDate).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR') : '-',
                 type: 'مانده از قبل',
                 desc: `ثبت سند افتتاحیه ${isDebtor ? '(بدهکار)' : '(بستانکار)'}`,
                 debit: isDebtor ? ibAmount : 0,
                 credit: isDebtor ? 0 : ibAmount,
                 rawItem: null,
                 entryType: 'opening'
               };
               allEntries = [ibEntry, ...allEntries];
            }

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
            
            const isOwedToUs = finalBalance > 0;
            const isClear = finalBalance === 0;

            return (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  onClick={() => setDrawerPersonId('')} 
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150]"
                />
                <motion.div
                  initial={{ x: '100%', opacity: 0.5 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0.5 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 bottom-0 right-0 w-full md:w-[700px] bg-gray-50 z-[160] shadow-2xl flex flex-col border-l border-slate-200"
                  dir="rtl"
                >
                  {/* Header */}
                  <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0 shadow-sm z-10">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        پیش‌نمایش گردش حساب: {selectedPerson.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setDrawerPersonId('')}
                      className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors border border-transparent shadow-none"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {(() => {
                        const personActiveLoans = loans.filter((l: any) => l.personId?.toString() === selectedPerson.id.toString() && l.status !== 'completed');
                        if (personActiveLoans.length === 0) return null;
                        const totalLoanAmount = personActiveLoans.reduce((sum: number, loan: any) => sum + (loan.amount || loan.totalAmount || 0), 0);
                        const relatedInstallments = installments.filter((inst: any) => 
                            (inst.status === 'pending' || inst.status === 'overdue') && 
                            personActiveLoans.some((l: any) => l.id.toString() === inst.loanId.toString())
                        );
                        return (
                            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-100/80 text-amber-600 rounded-xl"><Wallet className="w-5 h-5" /></div>
                                    <div>
                                       <span className="text-xs font-bold text-amber-700 block mb-0.5">وضعیت وام‌های فعال</span>
                                       <span className="text-sm font-black text-amber-900 block">
                                          مبلغ کل: {toPersianDigits(formatNumber(totalLoanAmount))} <span className="text-[10px] font-medium">{storeSettings.currency}</span>
                                       </span>
                                    </div>
                                </div>
                                <div className="text-right sm:text-left">
                                   <span className="text-xs font-bold text-amber-700/80 block mb-0.5">اقساط باقیمانده</span>
                                   <span className="text-lg font-black text-amber-900 block tracking-tight">
                                      {toPersianDigits(relatedInstallments.length)} <span className="text-[10px] font-medium text-amber-700">قسط پرداخت نشده</span>
                                   </span>
                                </div>
                            </div>
                        );
                    })()}
                    
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                      <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${isClear ? 'bg-slate-500' : (isOwedToUs ? 'bg-rose-500' : 'bg-emerald-500')}`}></div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 block mb-2">وضعیت نهایی تراز حساب شخص</span>
                        <div className="py-2 font-semibold">
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md inline-block mb-2 ${
                            isClear 
                              ? 'bg-slate-50 text-slate-700' 
                              : isOwedToUs 
                                ? 'bg-rose-50 text-rose-700' 
                                : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {isClear ? '✔ کاملاً تسویه شده' : isOwedToUs ? '🔺 بدهکار به فروشگاه' : '🔻 بستانکار از فروشگاه'}
                          </span>
                          
                          <span className={`text-2xl font-black block tracking-tight ${
                            isClear ? 'text-slate-700' : isOwedToUs ? 'text-rose-700' : 'text-emerald-700'
                          }`}>
                            {formatNumber(Math.abs(finalBalance))}{' '}
                            <span className="text-xs font-medium text-gray-500">{storeSettings.currency}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline / Simplified Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-extrabold text-gray-800 text-sm">ریز ۵۰ تراکنش اخیر</h3>
                      </div>
                      <div className="overflow-x-auto">
                        {ledgerEntries.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 text-sm">
                            هیچ گردش مالی یا سندی برای این شخص یافت نشد.
                          </div>
                        ) : (
                          <table className="w-full text-right text-xs whitespace-nowrap min-w-[600px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                                <th className="py-3 px-4 font-bold">تاریخ / ردیف</th>
                                <th className="py-3 px-4 font-bold">نوع سند</th>
                                <th className="py-3 px-4 font-bold text-left">مبلغ رویداد</th>
                                <th className="py-3 px-4 font-bold text-left">مانده نهایی</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-700">
                              {ledgerEntries.slice(-50).reverse().map((entry, idx) => {
                                const isDeb = entry.debit > 0;
                                const isCred = entry.credit > 0;
                                const isTxBalZero = entry.runningBalance === 0;
                                const isTxDeb = entry.runningBalance > 0;

                                return (
                                  <tr key={entry.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => {
                                    if (entry.entryType === 'invoice' && entry.rawItem) {
                                      setViewingInvoice(entry.rawItem);
                                    } else if (entry.entryType === 'transaction' && entry.rawItem) {
                                      if (entry.rawItem.type === 'salary') {
                                        try {
                                          const parsedDesc = JSON.parse(entry.rawItem.description);
                                          if (parsedDesc.isPayslip) {
                                            setViewingPayslip({ ...entry.rawItem, parsed: parsedDesc, computedPersonName: selectedPerson.name });
                                            return;
                                          }
                                        } catch (e) {}
                                      }
                                      setPreviewReceiptData({ ...entry.rawItem, jalaliDate: entry.jalaliDate, personId: selectedPerson.id, _isReadOnly: true });
                                    } else if (entry.entryType === 'issued_check') {
                                      setDrawerPersonId('');
                                      setActiveTab('issued_checks');
                                    } else if (entry.entryType === 'received_check') {
                                      setDrawerPersonId('');
                                      setActiveTab('received_checks');
                                    }
                                  }}>
                                    <td className="py-3 px-4">
                                      <div className="font-mono text-gray-500 font-bold">{entry.jalaliDate}</div>
                                      <div className="text-[10px] text-gray-400 mt-0.5">{entry.refId}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="font-bold">{entry.type}</div>
                                      <div className="text-[10px] text-gray-400 font-normal whitespace-pre-wrap line-clamp-1 max-w-[200px]" title={entry.desc}>{entry.desc}</div>
                                    </td>
                                    <td className="py-3 px-4 text-left font-mono" dir="ltr">
                                      {isDeb ? (
                                        <span className="text-rose-600 font-bold block">{formatNumber(entry.debit)}</span>
                                      ) : isCred ? (
                                        <span className="text-emerald-600 font-bold block">{formatNumber(entry.credit)}</span>
                                      ) : (
                                        <span className="text-gray-400">---</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-left font-mono" dir="ltr">
                                      <div className="flex flex-col items-end">
                                        {isTxBalZero ? (
                                          <span className="text-slate-500 font-bold">۰</span>
                                        ) : (
                                          <span className={`font-bold ${isTxDeb ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {formatNumber(Math.abs(entry.runningBalance))}
                                          </span>
                                        )}
                                        <span className="text-[9px] text-gray-400 mt-0.5">{isTxBalZero ? 'تسویه' : isTxDeb ? 'بدهکار' : 'بستانکار'}</span>
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
                  <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-end gap-3 z-10">
                    <button
                      onClick={() => {
                        setLedgerPersonId(selectedPerson.id);
                        setActiveTab('person_ledger');
                        setDrawerPersonId('');
                      }}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors w-full"
                    >
                      مشاهده در کارت حساب بصورت کامل
                    </button>
                  </div>
                </motion.div>
              </>
            );
          })()}
        </AnimatePresence>

        {/* Receipt PRE-REGISTER Preview overlay */}
        {previewReceiptData && (() => {
          const isReceive = previewReceiptData.type === 'receive';
          const themeBg = isReceive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700';
          const themeText = isReceive ? 'text-emerald-700' : 'text-rose-700';
          const themeLightBg = isReceive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100';
          const receiptPerson = persons.find(p => p.id.toString() === previewReceiptData.personId?.toString());
          const receiptTitle = isReceive ? 'پیش‌نمایش رسید دریافت وجه' : 'پیش‌نمایش رسید پرداخت وجه';

          let resourceName = 'نامشخص';
          if (previewReceiptData.method === 'cash') {
            if(previewReceiptData.resourceType === 'bank'){
              const bank = accounts.find(a => a.id.toString() === previewReceiptData.resourceId?.toString());
              if(bank) resourceName = bank.bankName + ' - ' + bank.accountNumber;
            } else {
              const box = cashboxes.find(c => c.id.toString() === previewReceiptData.resourceId?.toString());
              if(box) resourceName = box.name;
            }
          }

          return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                    <Wallet className={`w-5 h-5 ${themeText}`} />
                    {receiptTitle}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-extrabold mt-1 uppercase tracking-widest">رسید پیش نویس قبل از تایید نهایی</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewReceiptData(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors border border-gray-100 bg-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* Beautiful Ticket Style Receipt */}
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 bg-white shadow-sm relative overflow-hidden">
                  
                  {/* Decorative Ticket Edges */}
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full border-r-2 border-gray-200 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full border-l-2 border-gray-200 -translate-y-1/2"></div>

                  <div className="text-center mb-8">
                     <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3 ${themeLightBg} ${themeText}`}>
                        {isReceive ? 'دریافت از مشتری / طرف حساب' : 'پرداخت به مشتری / طرف حساب'}
                     </span>
                     <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-gray-900 flex items-center justify-center gap-2 mb-2" dir="ltr">
                        {formatCurrency(previewReceiptData.amount)}
                     </div>
                     <p className="text-sm font-bold text-gray-500">{numToPersianWords(previewReceiptData.amount)} {storeSettings.currency}</p>
                  </div>

                  {/* Horizontal Divider */}
                  <div className="w-full border-t border-dashed border-gray-200 my-6"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                     <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">طرف حساب</span>
                        <div className="text-base font-black text-gray-800">
                          {renderPersonLink(receiptPerson?.id, receiptPerson?.name)} {receiptPerson?.personCode ? <span className="text-gray-400 font-mono text-sm ml-1">[{receiptPerson.personCode}]</span> : ''}
                        </div>
                     </div>
                     <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">شماره سند / ثبت</span>
                        <div className="text-base font-bold font-mono text-gray-800">
                          {previewReceiptData.receiptNumber || 'ثبت نشده'}
                        </div>
                     </div>
                     <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">تاریخ ایجاد سند</span>
                        <div className="text-base font-bold text-gray-800 font-mono">
                          {previewReceiptData.jalaliDate}
                        </div>
                     </div>
                     <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">نوع تسویه / حساب</span>
                        <div className="text-base font-bold text-gray-800">
                           {previewReceiptData.method === 'cash' ? (
                             <span className="flex items-center gap-1.5"><Banknote className="w-4 h-4 text-gray-400" /> نقدی - {resourceName}</span>
                           ) : (
                             <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-gray-400" /> چک بانکی</span>
                           )}
                        </div>
                     </div>
                  </div>

                  {previewReceiptData.method === 'check' && (
                     <div className="mt-6 bg-amber-50 rounded-2xl p-4 border border-amber-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <span className="block text-[10px] uppercase tracking-widest font-bold text-amber-600/70 mb-1">شماره چک</span>
                           <div className="text-sm font-bold font-mono text-amber-900">{previewReceiptData.checkNumber}</div>
                        </div>
                        <div>
                           <span className="block text-[10px] uppercase tracking-widest font-bold text-amber-600/70 mb-1">تاریخ سررسید چک</span>
                           <div className="text-sm font-bold font-mono text-amber-900">{previewReceiptData.checkDueDate}</div>
                        </div>
                        <div className="md:col-span-2">
                           <span className="block text-[10px] uppercase tracking-widest font-bold text-amber-600/70 mb-1">{isReceive ? 'بانک صادرکننده' : 'از دسته چک'}</span>
                           <div className="text-sm font-bold text-amber-900">
                             {isReceive ? previewReceiptData.checkBankName : (() => {
                               const checkbook = checkbooks.find(cb => cb.id === previewReceiptData.checkbookId);
                               const bankAccount = accounts.find(a => a.id === checkbook?.accountId);
                               return `${bankAccount?.bankName} (${checkbook?.startNumber} - ${checkbook?.endNumber})`;
                             })()}
                           </div>
                        </div>
                     </div>
                  )}

                  {previewReceiptData.description && (
                     <div className="mt-6 pt-6 border-t border-gray-100">
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">یادداشت سند</span>
                        <p className="text-sm font-bold text-gray-700 bg-gray-50 p-4 rounded-xl leading-relaxed">{previewReceiptData.description}</p>
                     </div>
                  )}
                </div>

                {/* Linked Invoices Section */}
                {Object.keys(previewReceiptData.linkedInvoices || receiptLinkedInvoices || {}).filter(k => (previewReceiptData.linkedInvoices || receiptLinkedInvoices)[k] > 0).length > 0 && (
                  <div className="mt-6 border-2 border-indigo-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                    <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <span className="font-black text-indigo-900 text-sm">تخصیص یافته به فاکتورهای:</span>
                    </div>
                    <table className="w-full text-sm text-right bg-white">
                       <thead className="bg-white border-b border-gray-100 text-gray-400">
                         <tr>
                            <th className="p-4 font-bold text-xs uppercase tracking-widest">شماره فاکتور</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-center">مبلغ تسویه شده</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                         {Object.entries(previewReceiptData.linkedInvoices || receiptLinkedInvoices || {}).filter(([_, amt]) => (amt as number) > 0).map(([invId, amt]) => {
                            const inv = invoices.find(i => i.id.toString() === invId.toString());
                            return (
                               <tr key={invId} className="hover:bg-gray-50 transition-colors">
                                  <td className="p-4 font-black text-gray-800">فاکتور {inv ? (inv.invoiceNumber || `#${inv.id}`) : `#${invId}`}</td>
                                  <td className="p-4 font-mono font-black text-indigo-600 text-center text-base" dir="ltr">{formatCurrency(amt as number)} <span className="text-[10px] font-sans text-gray-400">{storeSettings.currency}</span></td>
                               </tr>
                            );
                         })}
                       </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 no-print">
                <button
                  type="button"
                  onClick={() => setPreviewReceiptData(null)}
                  className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm transition-colors shadow-sm"
                >
                  {previewReceiptData._isReadOnly ? 'بستن پیش‌نمایش' : 'بازگشت'}
                </button>
                {!previewReceiptData._isReadOnly && (
                <button
                  type="button"
                  disabled={submittingReceipt}
                  onClick={confirmReceiptSubmit}
                  className={`px-8 py-3 text-white rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 ${themeBg}`}
                >
                  {submittingReceipt ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {isReceive ? 'تایید نهایی و صدور رسید دریافت' : 'تایید نهایی و صدور رسید پرداخت'}
                </button>
                )}
              </div>
            </motion.div>
          </div>
        );})()}

        {/* Inter-warehouse Auto-transfer Proposal Dialog */}
        {transferProposal && transferProposal.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border-2 border-indigo-100 overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col font-sans"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-indigo-100 flex justify-between items-center bg-indigo-50/40">
                <div className="text-right">
                  <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                    تأمین موجودی و انتقال خودکار بین انبارها
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">برخی اقلام فاکتور در انبار فروش منتخب کسر موجودی دارند.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTransferProposal(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-slate-100 p-2 rounded-xl transition-colors border border-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Intro message */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-900 leading-relaxed">
                  موجودی کافی در انبار فروش منتخب یافت نشد. بر اساس آمار موجودی انبارها، انتقال‌های زیر جهت تامین کسری فاکتور فروش پیشنهاد می‌شود. با ضربه روی «تأیید و اجرای هوشمند انتقال»، اسناد انتقال انبار صادر و فاکتور فروش شما فوراً ذخیره می‌شود.
                </div>

                {/* Items Shortages List */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-800 border-b border-indigo-50 pb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500" /> بررسی جزئیات کالاها و روش تأمین
                  </h4>

                  {transferProposal.items.map((item, idx) => {
                    const hasActionableTransfers = item.transfers && item.transfers.length > 0;
                    return (
                      <div key={idx} className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <span className="font-black text-slate-900 text-sm">{item.productName}</span>
                          <div className="flex gap-2">
                            <span className="text-[10px] bg-indigo-50 text-indigo-950 font-bold px-2 py-0.5 border border-indigo-150 rounded-md">
                              موردنیاز: {item.required} {item.unit}
                            </span>
                            <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 border border-rose-150 rounded-md">
                              کسری در انبار فروش: {item.deficit} {item.unit}
                            </span>
                          </div>
                        </div>

                        {/* List of suggested transfers */}
                        {hasActionableTransfers ? (
                          <div className="space-y-2 mt-2">
                            <div className="text-[11px] text-slate-400 font-bold">برنامه انتقال پیشنهادی:</div>
                            {item.transfers.map((tr: any, tIdx: number) => (
                              <div key={tIdx} className="bg-white border border-indigo-50/50 rounded-xl p-3 flex justify-between items-center text-xs text-slate-700 shadow-sm">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="bg-slate-100 px-2 py-1 rounded font-bold text-slate-800">{tr.fromWarehouseName}</span>
                                  <span className="text-indigo-500">←</span>
                                  <span className="font-black text-slate-800">انتقال {tr.qty} {item.unit}</span>
                                  <span className="text-indigo-500">←</span>
                                  <span className="bg-indigo-50 px-2 py-1 rounded font-bold text-indigo-900">{tr.toWarehouseName}</span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">آماده صدور سند</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-rose-500 bg-rose-50/50 border border-rose-100 px-3 py-2 rounded-xl flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            موجودی این کالا در هیچ انبار دیگری هم کافی نیست! (کسری غیرقابل تامین: {item.deficit} {item.unit})
                          </div>
                        )}
                        
                        {/* Remaining deficit if any */}
                        {item.remainingDeficit > 0 && hasActionableTransfers && (
                          <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1.5 mt-2 bg-rose-50/30 p-2 rounded-lg border border-rose-100/50">
                            <AlertCircle className="w-3.5 h-3.5" />
                            کسری باقی‌مانده غیرقابل تأمین از انبارهای دیگر: {item.remainingDeficit} {item.unit}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 bg-indigo-50/30 border-t border-indigo-100 flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTransferProposal(null)}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all text-xs"
                >
                  انصراف و اصلاح فاکتور
                </button>

                {transferProposal.items.some(i => i.transfers && i.transfers.length > 0) ? (
                  <button
                    type="button"
                    onClick={handleExecuteTransferAndSubmit}
                    disabled={submitting}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white rounded-xl font-black flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10 text-xs"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    تأیید و اجرای هوشمند انتقال و ثبت فاکتور
                  </button>
                ) : (
                  <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    انتقال خودکار غیرمقدور (عدم موجودی کل کالاها)
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Invoice PRE-REGISTER Preview overlay */}

        {previewInvoiceData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-4xl max-h-[95vh] flex flex-col print-section print:max-h-none print:h-auto print:overflow-visible print:border-none print:shadow-none print:rounded-none"
            >
              {/* Header (No print) */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 no-print">
                <div className="text-right">
                  <h3 className="text-base font-black text-amber-600 flex items-center gap-2">
                    <Eye className="w-5 h-5 animate-pulse" />
                    {activeTab.includes('warehouse') ? 'پیش‌نمایش قبل از ثبت قطع' : 'پیش‌نمایش فاکتور قبل از ثبت قطعی'}
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
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-gray-800 text-sm print:overflow-visible print:p-0">
                
                {/* Visual A4 structure inside dialog */}
                <div className="border-2 border-indigo-400/50 p-6 rounded-2xl bg-white shadow-xs space-y-6 relative border-dashed print:border-none print:shadow-none print:p-0">
                  
                  {/* Top draft watermark */}
                  <span className="absolute left-6 top-6 no-print text-[10px] bg-amber-100 text-amber-850 font-black px-2.5 py-1 rounded-sm tracking-widest leading-none border border-amber-200">پیش‌نویس غیررسمی</span>

                  {/* Header info */}
                  {/* --- COMPLETELY DIFFERENT CONDITIONAL RENDERING BEGIN --- */}

                  <div className={"bg-white print:p-0 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] print:shadow-none border border-gray-100 print:border-none relative overflow-hidden text-gray-800 " + (storeSettings.print_paper_size === 'A5' ? 'max-w-[148mm] min-h-[210mm] mx-auto' : storeSettings.print_paper_size === 'receipt80' ? 'max-w-[80mm] min-h-[100mm] mx-auto print:text-xs' : storeSettings.print_paper_size === 'receipt58' ? 'max-w-[58mm] min-h-[100mm] mx-auto print:text-[10px]' : '')}>
                      {/* Top Accent Line */}
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 print:bg-gray-900"></div>
                      
                      {/* Elegant Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start pb-8 mb-8 border-b-2 border-gray-100 print:border-gray-300 mt-2">
                        <div className="space-y-3">
                          <h1 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tighter">
                            {previewInvoiceData.type === 'purchase' ? 'فاکتور خرید' : previewInvoiceData.type === 'sale' ? (previewInvoiceData.title || 'فاکتور فروش') : previewInvoiceData.type === 'sale_return' ? 'فاکتور برگشت از فروش' : previewInvoiceData.type === 'purchase_return' ? 'فاکتور برگشت از خرید' : previewInvoiceData.type === 'warehouse_receipt' ? 'رسید انبار (ورود کالا)' : previewInvoiceData.type === 'warehouse_remittance' ? 'حواله انبار (خروج کالا)' : 'سند'}
                          </h1>
                          <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-gray-600">
                            <span className="bg-gray-50 print:bg-transparent border border-gray-200 print:border-gray-400 px-3 py-1.5 rounded-lg text-gray-900 font-mono text-base">شماره فاکتور: {toPersianDigits(previewInvoiceData.invoiceNumber)}</span>
                            {(previewInvoiceData.type === 'purchase' || previewInvoiceData.type === 'purchase_return') && previewInvoiceData.sellerInvoiceNumber && (
                              <span className="bg-emerald-50 text-emerald-850 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs leading-none">ارجاع فاکتور فروشنده: {toPersianDigits(previewInvoiceData.sellerInvoiceNumber)}</span>
                            )}
                            <span className="px-2">تاريخ: {previewInvoiceData.jalaliDate || (previewInvoiceData.date && new Date(previewInvoiceData.date).toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR'))}</span>
                            {true && <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-1 rounded text-xs">پیش‌نمایش چاپ</span>}
                          </div>
                        </div>
                        <div className="text-right md:text-left flex flex-col md:items-end mt-6 md:mt-0">
                           {storeSettings.print_show_logo !== false && storeSettings.logoUrl && (
                               <img src={storeSettings.logoUrl} alt="Logo" className="w-16 h-16 object-contain mb-3 grayscale print:grayscale-0" />
                           )}
                           <h2 className="text-2xl font-black text-gray-900 tracking-tight">{storeSettings.storeName || 'نام مجموعه تجاری'}</h2>
                           {storeSettings.phone && <p className="text-sm font-bold text-gray-500 mt-2">تلفن: <span dir="ltr">{storeSettings.phone}</span></p>}
                           {storeSettings.address && <p className="text-xs font-bold text-gray-400 mt-1 max-w-[250px] truncate">{storeSettings.address}</p>}
                        </div>
                      </div>

                      {/* Info blocks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Customer Info */}
                        <div className="bg-gray-50/50 print:bg-transparent print:border-gray-300 p-5 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                            <User className="w-4 h-4" />
                            {['purchase', 'purchase_return'].includes(previewInvoiceData.type) ? 'تامین کننده' : ['sale', 'sale_return'].includes(previewInvoiceData.type) ? 'خریدار' : 'طرف حساب'}
                          </div>
                          <h3 className="text-xl font-black text-gray-900 mb-2">{renderPersonLink(previewInvoiceData.customerId, previewInvoiceData.customerName)}</h3>
                          {previewInvoiceData.customerPhone && <p className="text-sm text-gray-600 font-bold">تلفن: <span dir="ltr" className="text-gray-900">{previewInvoiceData.customerPhone}</span></p>}
                          {(() => {
                            const originalPerson = persons.find(p => p.name === previewInvoiceData.customerName || p.id === previewInvoiceData.customerId);
                            if (originalPerson) {
                              return (
                                <div className="mt-3 space-y-1 text-xs text-gray-500 font-bold">
                                  {originalPerson.nationalId && <p>شناسه ملی/کد اقتصادی: <span className="text-gray-800">{originalPerson.nationalId}</span></p>}
                                  {originalPerson.address && <p className="truncate block" title={originalPerson.address}>نشانی فیزیکی: <span className="text-gray-800 whitespace-normal">{originalPerson.address}</span></p>}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        {/* Payment/Warehouse Info */}
                        <div className="bg-gray-50/50 print:bg-transparent print:border-gray-300 p-5 rounded-2xl border border-gray-100 flex flex-col justify-center">
                          <div className="grid grid-cols-2 gap-4">
                            {!previewInvoiceData.type?.includes('warehouse') && (
                               <div>
                                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-1">مبلغ نهایی معامله</span>
                                  <div className="text-xl font-black text-gray-900" dir="ltr">
                                    {formatCurrency(previewInvoiceData.totalAmount)} <span className="text-xs font-bold text-gray-500">{showInvoiceCurrency(previewInvoiceData.currency)}</span>
                                  </div>
                               </div>
                            )}
                            {previewInvoiceData.type?.includes('warehouse') && (
                                <div className="col-span-2">
                                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-1"><Box className="w-4 h-4 inline mr-1 text-gray-400"/> انبار انتسابی به این سند</span>
                                  <div className="text-lg font-black text-gray-900">
                                    {warehouses.find(w => w.id?.toString() === previewInvoiceData.warehouseId?.toString() || w.id?.toString() === previewInvoiceData.items?.[0]?.warehouseId?.toString())?.name || 'نامشخص'}
                                  </div>
                                </div>
                            )}
                            {previewInvoiceData.description && (
                               <div className="col-span-2 mt-2 pt-4 border-t border-gray-200 print:border-gray-100">
                                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-1">یادداشت سند</span>
                                  <p className="text-sm text-gray-800 font-bold">{previewInvoiceData.description}</p>
                               </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Items table */}
                      <div className="rounded-2xl overflow-hidden border border-gray-200 print:border-gray-600 print:rounded-none mb-8">
                        <table className="w-full text-right text-sm border-collapse">
                           <thead className="bg-gray-100 print:bg-gray-100 text-gray-900">
                              <tr>
                                 <th className="py-4 px-3 w-12 text-center font-black border-l border-gray-200 print:border-gray-400">ردیف</th>
                                 <th className="py-4 px-4 font-black border-l border-gray-200 print:border-gray-400">شرح کالا یا خدمات</th>
                                 <th className="py-4 px-3 w-28 text-center font-black border-l border-gray-200 print:border-gray-400">مقدار</th>
                                 {!previewInvoiceData.type?.includes('warehouse') && (
                                    <>
                                       <th className="py-4 px-3 text-left w-40 font-black border-l border-gray-200 print:border-gray-400">فی ({showInvoiceCurrency(previewInvoiceData.currency)})</th>
                                       <th className="py-4 px-3 text-center w-24 font-black border-l border-gray-200 print:border-gray-400">تخفیف</th>
                                       <th className="py-4 px-3 text-left w-44 font-black">مبلغ کل ({showInvoiceCurrency(previewInvoiceData.currency)})</th>
                                    </>
                                 )}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-200 print:divide-gray-400 text-gray-800 font-bold">
                              {previewInvoiceData.items?.filter((it: any) => it.productName || it.productId || (it.quantity > 0 && it.unitPrice > 0)).map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                                  <td className="py-3 px-3 text-center border-l border-gray-200 print:border-gray-400 text-gray-500">{idx + 1}</td>
                                  <td className="py-3 px-4 border-l border-gray-200 print:border-gray-400">
                                     <div className="flex flex-col gap-1">
                                        <span className="text-gray-900 font-extrabold">{item.productName || 'کالا/خدمات'}</span>
                                        {item.warehouseId && (
                                          <span className="text-[10px] text-gray-500 font-bold block">
                                            انبار: {warehouses.find(w => w.id?.toString() === item.warehouseId?.toString())?.name || 'نامشخص'}
                                          </span>
                                        )}
                                     </div>
                                  </td>
                                  <td className="py-3 px-3 text-center border-l border-gray-200 print:border-gray-400 font-mono text-base" dir="rtl">{formatNumber(item.quantity || 1)} <span className="text-[10px] text-gray-500 font-sans">{item.selectedUnit || '-'}</span></td>
                                  {!previewInvoiceData.type?.includes('warehouse') && (
                                     <>
                                        <td className="py-3 px-3 text-left border-l border-gray-200 print:border-gray-400 font-mono" dir="ltr">{formatCurrency(item.unitPrice || 0)}</td>
                                        <td className="py-3 px-3 text-center border-l border-gray-200 print:border-gray-400 text-red-600 font-mono" dir="ltr">{toPersianDigits(item.discountPercent || 0)}٪</td>
                                        <td className="py-3 px-3 text-left font-black font-mono text-gray-900 bg-gray-50/50 print:bg-transparent" dir="ltr">{formatCurrency(item.totalPrice || 0)}</td>
                                     </>
                                  )}
                                </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>

                      {/* Summary Section */}
                      {!previewInvoiceData.type?.includes('warehouse') && (
                         <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
                            <div className="w-full md:w-1/2 mt-2">
                               <div className="border border-gray-200 print:border-gray-400 rounded-xl p-4 bg-gray-50/50 print:bg-transparent">
                                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">مبلغ فاکتور به حروف:</span>
                                  <p className="text-gray-900 font-black text-[15px] leading-relaxed">
                                     {numToPersianWords(previewInvoiceData.totalAmount)} {showInvoiceCurrency(previewInvoiceData.currency)}
                                  </p>
                               </div>
                               <p className="text-[11px] text-gray-400 font-bold leading-relaxed mt-4 text-justify">
                                  این فاکتور بر اساس قوانین جاری صادر گردیده است. بررسی کامل اقلام توسط خریدار در زمان تحویل الزامی است. پس از تأیید و خروج کالا از محدوده فروشگاه هیچگونه مسئولیتی در قبال کسری یا آسیب دیدگی پذیرفته نخواهد بود.
                               </p>
                            </div>
                            <div className="w-full md:w-5/12 ml-auto border border-gray-200 print:border-gray-400 rounded-2xl overflow-hidden text-sm font-bold text-gray-600">
                               <div className="flex justify-between p-4 border-b border-gray-100 print:border-gray-200 bg-white">
                                 <span>جمع خالص اقلام (بدون تخفیف):</span>
                                 <span className="font-mono text-gray-900" dir="ltr">{formatCurrency(previewInvoiceData.items?.reduce((sum: number, it: any) => sum + ((it.quantity || 0) * (it.unitPrice || 0)), 0) || 0)}</span>
                               </div>
                               <div className="flex justify-between p-4 border-b border-gray-100 print:border-gray-200 bg-white text-rose-600">
                                 <span>مجموع کل تخفیف‌ها روی خطوط:</span>
                                 <span className="font-mono" dir="ltr">{formatCurrency(Math.max(0, (previewInvoiceData.items?.reduce((sum: number, it: any) => sum + ((it.quantity || 0) * (it.unitPrice || 0)), 0) || 0) - previewInvoiceData.totalAmount))}</span>
                               </div>
                               {previewInvoiceData.overallDiscountPercent > 0 && (
                               <div className="flex justify-between p-4 border-b border-gray-100 print:border-gray-200 bg-white text-rose-600">
                                 <span>تخفیف کلی فاکتور ({toPersianDigits(previewInvoiceData.overallDiscountPercent)}٪):</span>
                                 <span className="font-mono" dir="ltr">{formatCurrency((previewInvoiceData.items?.reduce((sum: number, it: any) => sum + (it.totalPrice || 0), 0) || 0) * (previewInvoiceData.overallDiscountPercent / 100))}</span>
                               </div>
                               )}
                               <div className="flex justify-between p-5 bg-gray-900 print:bg-gray-100 print:text-gray-900 text-white text-lg font-black items-center">
                                 <span>مبلغ قابل پرداخت فاکتور:</span>
                                 <div className="text-left" dir="ltr">
                                    <span className="font-mono text-2xl px-1">{formatCurrency(previewInvoiceData.totalAmount)}</span>
                                    <span className="text-sm font-bold opacity-80">{showInvoiceCurrency(previewInvoiceData.currency)}</span>
                                 </div>
                               </div>
                            </div>
                         </div>
                      )}

                      {/* Payment Allocation History (for viewing only) */}
                      {storeSettings.print_show_financial !== false && !previewInvoiceData.type?.includes('warehouse') && (() => {
                        const allocatedTxs = transactions.filter(t => t.linkedInvoices && t.linkedInvoices[previewInvoiceData.id] > 0);
                        if (allocatedTxs.length > 0) {
                          return (
                            <div className="mt-8 mb-8 border border-gray-200 print:border-gray-300 rounded-xl overflow-hidden print:rounded-none">
                              <div className="bg-gray-100 print:bg-gray-50 border-b border-gray-200 print:border-gray-300 p-3 flex justify-between items-center text-gray-800">
                                <span className="font-black text-sm text-gray-700">تاریخچه پرداخت‌های مرتبط با این فاکتور</span>
                              </div>
                              <table className="w-full text-right text-xs font-bold text-gray-600">
                                <thead>
                                  <tr className="bg-white print:bg-white border-b border-gray-200 print:border-gray-300">
                                    <th className="p-3 w-32 border-l border-gray-200 print:border-gray-300">شماره سند پرداختی</th>
                                    <th className="p-3 w-32 border-l border-gray-200 print:border-gray-300">تاریخ پرداخت</th>
                                    <th className="p-3 border-l border-gray-200 print:border-gray-300">حساب / صندوق مرتبط</th>
                                    <th className="p-3 text-left w-64">مبلغ دریافتی/پرداختی مربوط به این فاکتور</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 print:divide-gray-200 bg-white">
                                  {allocatedTxs.map(tx => (
                                    <tr key={tx.id}>
                                      <td className="p-3 font-mono text-gray-500 border-l border-gray-200 print:border-gray-300">{toPersianDigits(tx.receiptNumber) || `#${toPersianDigits(tx.id)}`}</td>
                                      <td className="p-3 font-mono border-l border-gray-200 print:border-gray-300">{tx.jalaliDate}</td>
                                      <td className="p-3 border-l border-gray-200 print:border-gray-300">{accounts.find(a => a.id.toString() === tx.accountId?.toString())?.title || cashboxes.find(c => c.id.toString() === tx.cashboxId?.toString())?.name || 'نامشخص'}</td>
                                      <td className="p-3 text-left font-sans font-black text-gray-900" dir="ltr">{formatCurrency(tx.linkedInvoices![previewInvoiceData.id])} <span className="text-[9px] text-gray-400">{showInvoiceCurrency(previewInvoiceData.currency)}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-gray-50 print:bg-white border-t-2 border-gray-300">
                                  <tr>
                                    <td colSpan={3} className="p-3 text-left font-black text-gray-900 border-l border-gray-200 print:border-gray-300">جمع کل دریافتی‌ها و پرداختی‌ها:</td>
                                    <td className="p-3 text-left font-sans font-black text-gray-900" dir="ltr">{formatCurrency(previewInvoiceData.paidAmount || 0)} <span className="text-[9px] text-gray-500">{showInvoiceCurrency(previewInvoiceData.currency)}</span></td>
                                  </tr>
                                  <tr>
                                    <td colSpan={3} className="p-3 text-left font-black text-rose-600 border-l border-gray-200 print:border-gray-300">باقیمانده حساب (بدهی فاکتور):</td>
                                    <td className="p-3 text-left font-mono font-black text-rose-600" dir="ltr">{formatCurrency(Math.max((previewInvoiceData.totalAmount || 0) - (previewInvoiceData.paidAmount || 0), 0))} <span className="text-[9px] text-rose-400">{showInvoiceCurrency(previewInvoiceData.currency)}</span></td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Footer Notes & Signature Block */}
                      {storeSettings.print_footer_note && (
                         <div className="mb-6 text-[11px] font-bold text-gray-500 text-center leading-relaxed max-w-2xl mx-auto border-t border-gray-200 pt-6 mt-6 print:border-gray-300">
                            {storeSettings.print_footer_note}
                         </div>
                      )}
                      
                      <div className={`grid pt-12 pb-4 text-center text-sm font-black text-gray-600 ${storeSettings.print_signature_3 ? 'grid-cols-3 gap-8' : 'grid-cols-2 gap-16'} `}>
                        <div className="pt-8 border-t-2 border-gray-300 print:border-gray-400 border-dashed flex flex-col justify-end items-center px-4 w-3/4 mx-auto">
                          <span>{storeSettings.print_signature_1 || (previewInvoiceData.type?.includes('warehouse') ? 'مهر و امضای تحویل دهنده' : 'مهر و امضای خریدار / مشتری')}</span>
                        </div>
                        {storeSettings.print_signature_3 && (
                           <div className="pt-8 border-t-2 border-gray-300 print:border-gray-400 border-dashed flex flex-col justify-end items-center px-4 w-3/4 mx-auto">
                              <span>{storeSettings.print_signature_3}</span>
                           </div>
                        )}
                        <div className="pt-8 border-t-2 border-gray-300 print:border-gray-400 border-dashed flex flex-col justify-end items-center px-4 w-3/4 mx-auto">
                          <span>{storeSettings.print_signature_2 || (previewInvoiceData.type?.includes('warehouse') ? `تایید کننده (${storeSettings.storeName})` : `مهر و امضای (${storeSettings.storeName})`)}</span>
                        </div>
                      </div>
                  </div>
  
{/* --- COMPLETELY DIFFERENT CONDITIONAL RENDERING END --- */}

                </div>
              </div>

              {/* Bottom save triggers */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 no-print">
                <button
                  type="button"
                  onClick={() => setPreviewInvoiceData(null)}
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  {activeTab.includes('warehouse') ? 'بازگشت و ویرایش سند' : 'بازگشت و ویرایش فاکتور'}
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
        {/* System Version Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 mt-auto shrink-0 no-print">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-indigo-900 border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Version</span>
            <span className="text-xs font-black font-mono">v1.0.0</span>
            <div className="w-px h-3 bg-indigo-200"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-medium text-indigo-400">commit: {appVersion.hash}</span>
              <span className="text-[9px] font-medium text-indigo-400">{appVersion.date}</span>
            </div>
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
    )}
    {printingTransaction && (() => {
      const isReceive = printingTransaction.type === 'receive';
      const isSalary = printingTransaction.type === 'salary';
      const isPay = printingTransaction.type === 'pay';
      
      const themeColor = isReceive ? 'emerald' : isSalary ? 'blue' : 'rose';
      const themeBg = isReceive ? 'bg-emerald-50' : isSalary ? 'bg-blue-50' : 'bg-rose-50';
      const themeText = isReceive ? 'text-emerald-700' : isSalary ? 'text-blue-700' : 'text-rose-700';
      const themeBorder = isReceive ? 'border-emerald-200' : isSalary ? 'border-blue-200' : 'border-rose-200';
      const themeStamp = isReceive ? 'border-emerald-500/30 text-emerald-500/20' : isSalary ? 'border-blue-500/30 text-blue-500/20' : 'border-rose-500/30 text-rose-500/20';
      
      const receiptTitle = isReceive ? 'رسید دریافت وجه' : isSalary ? 'فیش حقوق و دستمزد' : 'رسید پرداخت وجه';
      
      const relatedPerson = persons.find(p => p.id === printingTransaction.personId || p.id?.toString() === printingTransaction.personId?.toString());
      const personName = relatedPerson?.name || 'نامشخص';
      const personCode = relatedPerson?.personCode ? `[${relatedPerson.personCode}] ` : '';

      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0 print:absolute print:z-auto print:block" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-full flex flex-col print-section print:shadow-none print:border-none print:rounded-none print:w-[210mm] print:h-[148mm] print:max-w-none print:max-h-none mx-auto font-sans"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 print:hidden relative z-10 shrink-0">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-500" />
                  پیش‌نمایش چاپ رسید
                </h3>
                <button
                  onClick={() => setPrintingTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors bg-white border border-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
                            <div id="print-area" className="p-6 md:p-8 print:p-6 bg-white relative overflow-y-auto overflow-x-hidden print:overflow-hidden flex-1 flex flex-col font-sans border-2 border-gray-100 print:border-[3px] print:border-gray-800 rounded-2xl print:rounded-none min-h-[500px]">
                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8 border-b-[3px] border-gray-800 pb-5">
                    <div className="flex items-center gap-4 w-[35%]">
                      {storeSettings?.logoUrl ? (
                         <img src={storeSettings.logoUrl} alt="Logo" className="w-16 h-16 object-contain grayscale" />
                      ) : (
                         <div className="w-16 h-16 bg-gray-50 border-[2px] border-gray-800 rounded-2xl flex items-center justify-center print:border-gray-800">
                           <Store className="w-8 h-8 text-gray-800" />
                         </div>
                      )}
                      <div>
                         <h2 className="text-xl font-black text-gray-900 leading-tight">{storeSettings?.storeName || 'نام مجموعه تجاری'}</h2>
                         {storeSettings?.phone && <p className="text-sm text-gray-700 font-sans font-bold mt-1.5 text-base" dir="ltr">{storeSettings.phone}</p>}
                      </div>
                    </div>
                    
                    <div className="w-[30%] text-center flex justify-center mt-2">
                      <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 border-[3px] border-gray-800 px-6 py-2.5 inline-block rounded-2xl">
                        {receiptTitle}
                      </h1>
                    </div>

                    <div className="w-[35%] flex flex-col items-end text-sm space-y-3 mt-2">
                       <div className="flex justify-between items-center w-full max-w-[170px]">
                         <span className="text-gray-800 font-bold">شماره:</span>
                         <span className="font-sans font-black text-gray-900">{toPersianDigits(printingTransaction.receiptNumber) || `#${toPersianDigits(printingTransaction.id)}`}</span>
                       </div>
                       <div className="flex justify-between items-center w-full max-w-[170px]">
                         <span className="text-gray-800 font-bold">تاریخ:</span>
                         <span className="font-sans font-black text-gray-900">{toPersianDigits(printingTransaction.jalaliDate || printingTransaction.date?.split('T')[0] || '')}</span>
                       </div>
                       <div className="flex justify-between items-center w-full max-w-[170px]">
                         <span className="text-gray-800 font-bold">پیوست:</span>
                         <span className="font-sans font-bold text-gray-900">ندارد</span>
                       </div>
                    </div>
                  </div>
                  
                  {/* Amount Block */}
                  <div className="mb-10 flex justify-center mt-4">
                    <div className="w-full max-w-sm border-[3px] border-gray-800 rounded-2xl overflow-hidden flex">
                       <div className="bg-gray-100 border-l-[3px] border-gray-800 px-5 py-4 flex items-center justify-center">
                          <span className="text-base font-black text-gray-900 whitespace-nowrap">مبلغ ({storeSettings?.currency || 'ریال'})</span>
                       </div>
                       <div className="flex-1 flex items-center justify-center p-4 text-3xl font-black font-sans tracking-wide bg-white relative">
                          {toPersianDigits(typeof formatNumber === 'function' ? formatNumber(printingTransaction.amount) : String(printingTransaction.amount))}
                       </div>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="mb-10 text-lg md:text-xl font-bold text-gray-900 leading-[3.8rem] md:leading-[4.5rem] text-justify px-4">
                    بدینوسیله گواهی می‌شود مبلغ <span className="border-b-[3px] border-dashed border-gray-800 px-6 font-black mx-1 pb-1 inline-block min-w-[120px] text-center text-xl md:text-2xl">{toPersianDigits(typeof formatNumber === 'function' ? formatNumber(printingTransaction.amount) : String(printingTransaction.amount))} {storeSettings?.currency || 'ریال'}</span> معادل ( <span className="border-b-[3px] border-dashed border-gray-800 px-6 font-black text-lg md:text-xl pb-1 inline-block min-w-[200px] text-center">{numToPersianWords(printingTransaction.amount)}</span> ) مشخصاً،
                    <br/>
                    {isReceive ? 'از جناب آقای / سرکار خانم / شرکت' : 'به جناب آقای / سرکار خانم / شرکت'} <span className="font-black text-2xl border-b-[3px] border-dashed border-gray-800 px-8 mx-1 pb-1 inline-block min-w-[300px] text-center">{personCode}{personName}</span> 
                    <br/>
                    به صورت <span className="font-black text-xl md:text-2xl border-b-[3px] border-dashed border-gray-800 px-6 mx-1 pb-1 inline-block min-w-[150px] text-center">{printingTransaction.method === 'cash' ? 'نقدی / واریز بانکی' : 'چک'}</span> 
                    {printingTransaction.method === 'check' ? (
                       <span className="font-black text-xl md:text-2xl border-b-[3px] border-dashed border-gray-800 px-6 mx-1 pb-1 inline-block min-w-[300px] text-center">
                          {printingTransaction.checkBankName || (printingTransaction.checkbookId ? (checkbooks.find(cb => cb.id?.toString() === printingTransaction.checkbookId?.toString()) ? accounts.find(a => a.id?.toString() === checkbooks.find(cb => cb.id?.toString() === printingTransaction.checkbookId?.toString())?.accountId?.toString())?.bankName : 'نامشخص') : 'نامشخص')} / شماره: {toPersianDigits(printingTransaction.checkNumber || '')} / سررسید: {toPersianDigits(printingTransaction.checkDueDate || '')}
                       </span>
                    ) : null}
                    {!isSalary && printingTransaction.method !== 'check' && (
                      <>
                        {" "}{isReceive ? "به" : "توسط"} <span className="font-black text-xl md:text-2xl border-b-[3px] border-dashed border-gray-800 px-8 mx-1 pb-1 inline-block min-w-[200px] text-center">
                           {printingTransaction.resourceType === "bank" 
                             ? `حساب ${accounts.find(a => a.id === printingTransaction.resourceId || a.id?.toString() === printingTransaction.resourceId?.toString())?.bankName || "نامشخص"}`
                             : printingTransaction.resourceType === "cashbox" 
                               ? `صندوق ${cashboxes.find(c => c.id === printingTransaction.resourceId || c.id?.toString() === printingTransaction.resourceId?.toString())?.name || "نامشخص"}`
                               : "نامشخص"}
                        </span>
                      </>
                    )}
                    <br/>
                    بابت <span className="font-black text-xl md:text-2xl border-b-[3px] border-dashed border-gray-800 px-10 mx-1 pb-1 inline-block min-w-[350px] text-center">{printingTransaction.description || '‌'}</span>
                    <br/>
                    {isReceive ? 'نقداً دریافت گردید.' : 'تمام و کمال پرداخت گردید.'}
                  </div>
                  
                  {/* Signatures */}
                  <div className="flex justify-between items-end px-12 mt-auto pt-32 mb-8">
                    <div className="text-center w-56">
                      <span className="block text-sm font-bold text-gray-900 mb-20">
                        {storeSettings?.print_signature_1 || (isReceive ? 'مهر و امضای پرداخت کننده' : isSalary ? 'امضای کارمند' : 'مهر و امضای گیرنده وجه')}
                      </span>
                      <span className="block w-full border-t-[2px] border-gray-400 border-dashed"></span>
                    </div>
                    <div className="text-center w-56">
                      <span className="block text-sm font-bold text-gray-900 mb-20">
                        {storeSettings?.print_signature_2 || 'مهر و امضای امور مالی / مدیریت'}
                      </span>
                      <span className="block w-full border-t-[2px] border-gray-400 border-dashed"></span>
                    </div>
                  </div>

                  {storeSettings?.print_footer_note && (
                    <div className="mt-8 text-center text-xs text-gray-600 font-bold leading-relaxed px-4 pt-4 border-t-2 border-gray-800">
                      {storeSettings.print_footer_note}
                    </div>
                  )}
                  
                  {/* Address block at bottom if available */}
                  {!storeSettings?.print_footer_note && storeSettings?.address && (
                    <div className="mt-8 text-center text-xs text-gray-600 font-bold px-4 pt-4 border-t-[2px] border-gray-800">
                      نشانی: {storeSettings.address}
                    </div>
                  )}

                  <div className="mt-6 text-center text-xs text-gray-500 font-sans font-bold opacity-80 flex justify-between px-4 pt-2">
                     <span>شناسه سیستمی: {toPersianDigits(printingTransaction.receiptNumber || printingTransaction.id || "")}</span>
                     <span>PRINTED: {new Date().toLocaleString('en-US', { hour12: false })}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto print:hidden rounded-b-3xl relative z-10 shrink-0">
                <button
                  onClick={() => setPrintingTransaction(null)}
                  className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-all shadow-sm text-sm"
                >
                  انصراف
                </button>
                <button
                  onClick={() => {
                    setTimeout(() => window.print(), 100);
                  }}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <Printer className="w-5 h-5" />
                  چاپ رسید
                </button>
              </div>
            </motion.div>
          </div>
        )
    })()}

      {pricingWizardInvoice && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:block print:overflow-visible overflow-y-auto print-section">
          {/* Interactive UI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ring-1 ring-slate-900/5 print:hidden m-auto"
            dir="rtl"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">قیمت‌گذاری فروش کالاها</h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">ثبت قیمت فروش برای اقلام فاکتور خرید اخیر</p>
                </div>
              </div>
              <button
                onClick={() => { setPricingWizardInvoice(null); setPricingWizardItems([]); }}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-200/50 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              {/* Bulk Update */}
              {pricingWizardItems.length > 0 && (
                 <div className="flex flex-col md:flex-row items-center justify-between bg-indigo-50 p-4 border border-indigo-100 rounded-2xl gap-3">
                    <span className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                       <Percent className="w-4 h-4 text-indigo-500" />
                       اعمال حاشیه سود گروهی روی تمام اقلام کالاها
                    </span>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                       <div className="flex items-center gap-2 w-full md:w-auto">
                           <span className="text-xs font-bold text-indigo-700 whitespace-nowrap">درصد سود یکسان:</span>
                           <div className="flex flex-1 md:flex-none items-center gap-1 bg-white border border-indigo-200 rounded-xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/30 w-32 md:w-28">
                              <input 
                                  type="number" 
                                  min="0"
                                  placeholder="مثلا 15"
                                  className="w-full text-center font-sans font-black text-indigo-700 bg-transparent focus:outline-none text-sm"
                                  onChange={(e) => {
                                     let value = e.target.value;
                                     if (value === '') return;
                                     const m = Number(value);
                                     if (!isNaN(m)) {
                                        const newItems = pricingWizardItems.map(item => ({
                                           ...item,
                                           marginPercent: m,
                                           salePrice: item.purchasePrice * (1 + m / 100)
                                        }));
                                        setPricingWizardItems(newItems);
                                     }
                                  }} 
                              />
                              <span className="text-xs font-bold text-indigo-400">٪</span>
                           </div>
                       </div>
                    </div>
                 </div>
              )}

              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-extrabold text-slate-700 w-12 text-center">ردیف</th>
                      <th className="p-4 font-extrabold text-slate-700">نام کالا / خدمات</th>
                      <th className="p-4 font-extrabold text-slate-700 w-32 border-r border-slate-100 text-center">قیمت خرید ({storeSettings.currency})</th>
                      <th className="p-4 font-extrabold text-slate-700 w-32 border-r border-slate-100 text-center">حاشیه سود (٪)</th>
                      <th className="p-4 font-extrabold text-slate-700 w-44 border-r border-slate-100 text-center">قیمت فروش ({storeSettings.currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pricingWizardItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4 text-center font-sans font-bold text-slate-500 text-xs text-center border-l border-slate-100/50">
                          {toPersianDigits(idx + 1)}
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {item.productName}
                        </td>
                        <td className="p-3 border-r border-slate-100 text-center align-middle">
                           <div className="font-sans font-black text-slate-700 text-sm bg-slate-50 border border-slate-200/60 rounded-xl px-2 py-1.5 inline-block">
                             {toPersianDigits(formatNumber(item.purchasePrice))}
                           </div>
                        </td>
                        <td className="p-3 border-r border-slate-100 text-center align-middle">
                           <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200/60 rounded-xl px-2 py-0.5 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all max-w-[90px] mx-auto">
                           <input
                             type="number"
                             min="0"
                             className="w-full text-center font-sans font-black text-indigo-700 bg-transparent focus:outline-none text-sm py-1"
                             value={item.marginPercent || ''}
                             onChange={(e) => {
                               const m = Number(e.target.value);
                               const newItems = [...pricingWizardItems];
                               newItems[idx].marginPercent = m;
                               newItems[idx].salePrice = item.purchasePrice * (1 + m / 100);
                               setPricingWizardItems(newItems);
                             }}
                             placeholder="0"
                           />
                           <span className="text-[10px] font-bold text-indigo-400">٪</span>
                           </div>
                        </td>
                        <td className="p-3 border-r border-slate-100 text-center align-middle relative">
                           <input
                             type="text"
                             className="w-[120px] text-center font-sans font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm"
                             value={item.salePrice ? toPersianDigits(formatNumber(item.salePrice)) : ''}
                             onChange={(e) => {
                               const raw = Number(e.target.value.replace(/\D/g, ''));
                               const newItems = [...pricingWizardItems];
                               newItems[idx].salePrice = raw;
                               if (item.purchasePrice > 0) {
                                  newItems[idx].marginPercent = Math.round(((raw - item.purchasePrice) / item.purchasePrice) * 100);
                               }
                               setPricingWizardItems(newItems);
                             }}
                             onFocus={(e) => e.target.select()}
                           />
                        </td>
                      </tr>
                    ))}
                    {pricingWizardItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">هیچ کالایی برای تعیین قیمت وجود ندارد.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                با درج حاشیه سود یا تغییر مستقیم، قیمت فروش کالاها به‌روز می‌شود.
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setPricingWizardInvoice(null); setPricingWizardItems([]); }}
                  className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setPricingPrintMode('list');
                    for (const item of pricingWizardItems) {
                       const p = products.find(prod => prod.id === item.productId);
                       if (p) {
                          await updateProduct(p.id.toString(), { ...p, price: item.salePrice, purchasePrice: item.purchasePrice });
                       }
                    }
                    await fetchProducts();
                    setSuccessMsg('قیمت‌های فروش با موفقیت بروزرسانی شد.');
                    setTimeout(() => window.print(), 300);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-all shadow-indigo-600/20 hover:-translate-y-0.5"
                >
                  <List className="w-5 h-5" />
                  ثبت قیمت و چاپ لیست
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setPricingPrintMode('labels');
                    for (const item of pricingWizardItems) {
                       const p = products.find(prod => prod.id === item.productId);
                       if (p) {
                          await updateProduct(p.id.toString(), { ...p, price: item.salePrice, purchasePrice: item.purchasePrice });
                       }
                    }
                    await fetchProducts();
                    setSuccessMsg('قیمت‌های فروش با موفقیت بروزرسانی شد.');
                    setTimeout(() => window.print(), 300);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all shadow-emerald-600/20 hover:-translate-y-0.5"
                >
                  <Printer className="w-5 h-5" />
                  ثبت قیمت و چاپ لیبل چسبی
                </button>
              </div>
            </div>
          </motion.div>

          {/* Dedicated Print-Only Layout */}
          <div className="hidden print:block p-8 w-full mx-auto bg-white font-sans text-slate-800" dir="rtl">
             {pricingPrintMode === 'list' && (
               <>
                 <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-200 mb-6">
                    <h2 className="text-3xl font-black text-slate-900 mb-3">{storeSettings?.storeName || 'لیست قیمت فروش کالاها'}</h2>
                    <div className="flex gap-8 text-lg font-bold text-slate-600">
                       <span>مرجع: فاکتور خرید {toPersianDigits(pricingWizardInvoice?.invoiceNumber || '')}</span>
                       <span>تاریخ ثبت خرید: {toPersianDigits(pricingWizardInvoice?.jalaliDate || '')}</span>
                       <span>تاریخ قیمت‌گذاری: {new Date().toLocaleDateString('fa-IR')}</span>
                    </div>
                 </div>
                 
                 <table className="w-full text-lg text-right border-collapse border border-slate-300">
                   <thead className="bg-slate-100">
                     <tr>
                       <th className="p-4 border border-slate-300 font-extrabold w-20 text-center">ردیف</th>
                       <th className="p-4 border border-slate-300 font-extrabold">نام کالا / خدمات</th>
                       <th className="p-4 border border-slate-300 font-extrabold w-64 text-center bg-slate-200">قیمت فروش ({storeSettings?.currency || 'تومان'})</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-300">
                     {pricingWizardItems.map((item, idx) => (
                       <tr key={idx}>
                         <td className="p-4 border border-slate-300 text-center font-bold">{toPersianDigits(idx + 1)}</td>
                         <td className="p-4 border border-slate-300 font-bold text-xl">{item.productName}</td>
                         <td className="p-4 border border-slate-300 text-center font-black text-2xl text-slate-900" dir="ltr">
                           {item.salePrice ? toPersianDigits(formatNumber(item.salePrice)) : '---'}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </>
             )}

             {pricingPrintMode === 'labels' && (
               <div className="flex flex-wrap gap-4 items-start justify-start">
                 {pricingWizardItems.map((item, idx) => {
                   const prod = products.find(p => p.id === item.productId);
                   return (
                   <div key={idx} className="border-[5px] border-slate-900 p-3 rounded-3xl flex flex-col justify-between text-center w-[95mm] h-[65mm] break-inside-avoid relative overflow-hidden bg-white shadow-sm">
                     <div className="w-full flex justify-between items-start px-2 mb-1 shrink-0">
                        <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">بارکد: {prod?.barcode || '---'}</span>
                        <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">کد: {prod?.code || '---'}</span>
                     </div>
                     <div className="flex flex-col items-center w-full min-h-0 flex-1 justify-center py-1">
                       <span className="text-sm font-extrabold text-slate-500 mb-1 truncate w-full px-2">{storeSettings?.storeName || 'پلتفرم فروشگاهی'}</span>
                       <span className="text-xl md:text-2xl font-black text-slate-900 leading-snug px-2 w-full overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.productName}</span>
                     </div>
                     <div className="mt-auto pt-2 w-full flex flex-col items-center border-t-2 border-slate-200 shrink-0 bg-white">
                       <div className="flex items-end justify-center gap-2 mt-1">
                         <span className="text-[32px] md:text-[38px] font-black text-slate-900 tracking-tight leading-none" dir="ltr">
                           {item.salePrice ? toPersianDigits(formatNumber(item.salePrice)) : '---'}
                         </span>
                         <span className="text-lg font-bold text-slate-600 mb-1">{storeSettings?.currency || 'تومان'}</span>
                       </div>
                     </div>
                   </div>
                 )})}
               </div>
             )}
          </div>
        </div>
      )}
    </>
  );
}