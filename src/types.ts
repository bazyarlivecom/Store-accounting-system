export type Person = { 
  id: string | number; 
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

export type Product = { id: string | number; name: string; price: number; type: 'product' | 'service'; category: string };

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
