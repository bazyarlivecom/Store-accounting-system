export type PersonGroup = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  salePrice?: number;
  discountPercent?: number;
  minStockLevel?: number;
  color?: string; // e.g., 'indigo', 'emerald', 'amber', 'rose'
};

export type PersonRole = {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
};

export type Person = { 
  id: string | number; 
  personCode?: string;
  accountingCode?: string;
  title?: string;
  name: string; 
  firstName?: string;
  lastName?: string;
  alias?: string;
  companyName?: string;
  fatherName?: string;
  nationalId?: string;
  address?: string;
  imageUrl?: string;
  personType: 'real' | 'legal';
  role: 'customer' | 'employee' | 'supplier'; 
  phone: string; 
  bankName?: string;
  bankAccountNumber?: string;
  cardNumber?: string;
  shebaNumber?: string;
  additionalNotes?: string;
  attachments?: { name: string; url: string; size?: number; type?: string; }[];
  group?: string;
  province?: string;
  city?: string;
  isActive?: boolean;
  registrationDate?: string;
  initialBalance?: number; // مانده اولیه (افتتاحیه)
  initialBalanceType?: 'debtor' | 'creditor' | 'settled';
  creditLimit?: number; // سقف اعتبار
};

export type Checkbook = {
  id: string | number;
  accountId: string | number;
  bankName?: string;
  startNumber: string;
  endNumber: string;
  totalLeaves: number;
  issuedDate: string;
};

export type IssuedCheck = {
  id: string | number;
  checkbookId: string | number;
  checkNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  payeeId: string | number;
  status: 'blank' | 'issued' | 'cashed' | 'bounced' | 'cancelled';
  receiptNumber?: string;
  description?: string;
  imageUrl?: string;
  history?: { status: string, date: string, desc?: string, user?: string }[];
  isActive?: boolean;
  salePrice?: number;
  discountPercent?: number;
  minStockLevel?: number;
};

export type ReceivedCheck = {
  id: string | number;
  checkNumber: string;
  bankName: string;
  branchName?: string;
  amount: number;
  receiveDate: string;
  dueDate: string;
  payerId: string | number;
  status: 'received' | 'deposited' | 'cashed' | 'bounced' | 'returned';
  receiptNumber?: string;
  description?: string;
  history?: { status: string, date: string, desc?: string, user?: string }[];
};

export type ProductCategory = {
  id: string | number;
  code?: string;
  name: string;
  description?: string;
  parentId?: string | number | null;
};

export type Product = {
  id: string | number;
  code?: string;
  barcode?: string;
  name: string;
  price: number;
  purchasePrice?: number; priceHistory?: any[];
  stock?: number;
  minStock?: number;
  unit?: string;
  secondaryUnit?: string;
  unitRatio?: number;
  type: 'product' | 'service';
  category: string;
  categoryId?: string | number;
  warehouseId?: string | number;
  imageUrl?: string;
  isActive?: boolean;
  salePrice?: number;
  discountPercent?: number;
  minStockLevel?: number;
  description?: string;
};

export type Account = {
  id: string | number;
  bankName: string;
  branchName?: string;
  accountNumber?: string;
  cardNumber?: string;
  shebaNumber?: string;
  balance: number;
  accountHolder?: string;
  title?: string;
};

export type Cashbox = {
  id: string | number;
  name: string;
  manager?: string;
  balance: number;
};

export type Warehouse = {
  id: string | number;
  name: string;
  manager?: string;
  location?: string;
  isActive: boolean;
};

export type InvoiceItem = {
  id: string;
  productId: string | number | '';
  productName: string;
  quantity: number;
  unitPrice: number; // this will be price per selected unit
  discountPercent: number;
  totalPrice: number;
  selectedUnit?: string;
  unitRatio?: number;
  isSecondaryUnit?: boolean;
  warehouseId?: string | number;
  maxQuantity?: number;
};

export type UserRole = 'admin' | 'accountant' | 'cashier' | 'viewer';

export type RefundRequest = {
  id?: string | number;
  date: string; // YYYY/MM/DD
  amount: number;
  personId?: string | number; // For selected existing person
  miscName?: string; // For miscellaneous distinct from person entity
  miscGroupId?: string | number; // Group ID for new miscellaneous person
  cardNumber?: string;
  resourceType: 'bank' | 'cashbox';
  resourceId: string | number;
  description?: string;
  status: 'registered' | 'paid' | 'cancelled'; // ثبت شده، پرداخت شده، کنسل شده
  createdAt?: number;
  updatedAt?: number;
};


export type User = {
  id: string | number;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  requires2FA?: boolean;
}; 
export type CompanySettings = {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  taxId: string;
  registrationNumber: string;
  logoBase64?: string;
  defaultCurrency: string;
  printPaperSize: 'A4' | 'A5' | '8cm';
  printHasHeader: boolean;
  printHasFooter: boolean;
  printFooterText: string;
  taxPercent: number;
  invoiceNotes: string;
  allowNegativeStock?: boolean;
  fontFamily?: string;
  requireWarehouse?: boolean;
  invoicePrefix?: string;
  invoiceStartNumber?: string;
  invoiceNumberLength?: number;
  smsProvider?: 'online' | 'gsm';
  smsApiKey?: string;
  smsSenderNumber?: string;
  smsTemplateInvoice?: string;
  smsTemplateReceipt?: string;
  smsTemplateCheck?: string;
  smsDebtThresholdEnabled?: boolean;
  smsDebtThresholdAmount?: number;
  smsDebtThresholdMessage?: string;
  [key: string]: any; // Allow custom numbering properties
};

export interface SmsMessage {
  id: string;
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  provider: 'online' | 'gsm';
  timestamp: number;
}

export interface WarehouseStock {
  id: string;
  productId: string | number;
  warehouseId: string | number;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  lastUpdated: number;
}


export type StocktakingItem = {
  productId: string | number;
  productName: string;
  expectedStock: number;
  countedStock: number | null;
  difference: number; // countedStock - expectedStock
  costValue?: number; // unit cost * difference (positive for surplus, negative for deficit)
};

export type Stocktaking = {
  id: string | number;
  date: string; // Jalali or ISO
  warehouseId: string | number;
  status: 'pending' | 'in_progress' | 'confirmed' | 'applied';
  items: StocktakingItem[];
  description?: string;
  createdBy?: string;
  appliedDate?: string;
  totalDeficitValue?: number;
  totalSurplusValue?: number;
};

export type LedgerAccount = {
  id: string | number;
  code: string;
  title: string;
  type: 'group' | 'general' | 'subsidiary' | 'detailed'; // گروه، کل، معین، تفصیلی
  nature: 'debit' | 'credit'; // بدهکار یا بستانکار
  parentId?: string | number | null;
};

export type AccountingDocumentItem = {
  id?: string | number;
  ledgerAccountId: string | number;
  detailedAccountId?: string | number; // references Persons, Banks, etc. if needed
  description: string;
  debit: number;
  credit: number;
};

export type AccountingDocument = {
  id: string | number;
  documentNumber: number;
  date: string;
  description: string;
  status: 'draft' | 'approved';
  items: AccountingDocumentItem[];
  sourceType?: 'manual' | 'invoice_sale' | 'invoice_purchase' | 'receipt' | 'payment';
  sourceId?: string | number; 
  createdAt?: number;
  updatedAt?: number;
};

export type Loan = { id: string | number; personId: string | number; amount: number; startDate: string; totalInstallments: number; installmentAmount: number; description?: string; status: 'active' | 'completed' | 'overdue'; type: 'given' | 'received'; };

export type Installment = { id: string | number; loanId: string | number; dueDate: string; amount: number; status: 'pending' | 'paid' | 'overdue'; paidDate?: string; paidAmount?: number; description?: string; };


export type SystemLog = {
  id: string | number;
  action: string;
  userId: string | number;
  details: string;
  entityType: string;
  entityId: string | number;
  timestamp: number;
  changes?: string;
};
