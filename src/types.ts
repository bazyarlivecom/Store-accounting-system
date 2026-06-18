export type PersonGroup = {
  id: string;
  name: string;
  description?: string;
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
  title?: string;
  name: string; 
  firstName?: string;
  lastName?: string;
  alias?: string;
  companyName?: string;
  fatherName?: string;
  nationalId?: string;
  address?: string;
  personType: 'real' | 'legal';
  role: 'customer' | 'employee' | 'supplier'; 
  phone: string; 
  bankName?: string;
  bankAccountNumber?: string;
  cardNumber?: string;
  shebaNumber?: string;
  additionalNotes?: string;
  group?: string;
  province?: string;
  city?: string;
  isActive?: boolean;
  registrationDate?: string;
  initialBalance?: number; // مانده اولیه (افتتاحیه)
  initialBalanceType?: 'debtor' | 'creditor' | 'settled';
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
  description?: string;
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
  description?: string;
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
  purchasePrice?: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  secondaryUnit?: string;
  unitRatio?: number;
  type: 'product' | 'service';
  category: string;
  categoryId?: string | number;
  warehouseId?: string | number;
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
  requireWarehouse?: boolean;
  invoicePrefix?: string;
  invoiceStartNumber?: string;
  invoiceNumberLength?: number;
  [key: string]: any; // Allow custom numbering properties
};

export interface WarehouseStock {
  id: string;
  productId: string | number;
  warehouseId: string | number;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  lastUpdated: number;
}

