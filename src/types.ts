export type Person = { 
  id: string | number; 
  personCode?: string;
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

export type ProductCategory = {
  id: string | number;
  name: string;
  description?: string;
  parentId?: string | number;
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
  type: 'product' | 'service';
  category: string;
  categoryId?: string | number;
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
};

export type Cashbox = {
  id: string | number;
  name: string;
  manager?: string;
  balance: number;
};

export type InvoiceItem = {
  id: string;
  productId: number | '';
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  totalPrice: number;
};

// Also we should keep CompanySettings type here 
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
};
