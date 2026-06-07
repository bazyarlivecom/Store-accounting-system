import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';

// Mock data for the API
let persons = [
  { id: 1, name: 'علی محمدی', firstName: 'علی', lastName: 'محمدی', personType: 'real', nationalId: '1234567890', role: 'customer', phone: '09121111111' },
  { id: 2, name: 'شرکت آرمان اندیش', companyName: 'شرکت آرمان اندیش', personType: 'legal', nationalId: '10101234567', role: 'customer', phone: '0212222222' },
  { id: 3, name: 'سارا احمدی', firstName: 'سارا', lastName: 'احمدی', personType: 'real', nationalId: '0987654321', role: 'employee', phone: '09133333333' },
  { id: 4, name: 'رضا کریمی', firstName: 'رضا', lastName: 'کریمی', personType: 'real', nationalId: '1111111111', role: 'supplier', phone: '09144444444' },
  { id: 5, name: 'گروه توسعه پارس', companyName: 'گروه توسعه پارس', personType: 'legal', nationalId: '10107654321', role: 'customer', phone: '0215555555' },
];

let products = [
  { id: 1, name: 'لپ‌تاپ ایسوس زن‌بوک', price: 55000000, type: 'product', category: 'کالای دیجیتال' },
  { id: 2, name: 'گوشی سامسونگ گلکسی S24', price: 65000000, type: 'product', category: 'کالای دیجیتال' },
  { id: 3, name: 'مانیتور ۲۷ اینچ ال‌جی', price: 12000000, type: 'product', category: 'لوازم جانبی' },
  { id: 4, name: 'کیبورد مکانیکی ریزر', price: 4500000, type: 'product', category: 'لوازم جانبی' },
  { id: 5, name: 'نصب و راه‌اندازی شبکه', price: 2800000, type: 'service', category: 'خدمات IT' },
];

// In-memory invoice storage
let invoices: any[] = [];

let accounts = [
  { id: 1, bankName: 'بانک ملی', branchName: 'مرکزی', accountNumber: '0102030405001', cardNumber: '6037991122334455', shebaNumber: 'IR120170000000102030405001', balance: 150000000, accountHolder: 'علی محمدی' },
  { id: 2, bankName: 'بانک ملت', branchName: 'آزادی', accountNumber: '5566778899', cardNumber: '6104337788990011', shebaNumber: 'IR96012000000005566778899', balance: 320000000, accountHolder: 'شرکت آرمان اندیش' },
];

let cashboxes = [
  { id: 1, name: 'صندوق اصلی فروشگاه', manager: 'رضا کریمی', balance: 45000000 },
  { id: 2, name: 'تنخواه‌گردان دفتر', manager: 'سارا احمدی', balance: 12000000 },
];

let storeSettings = {
  name: 'فروشگاه پیش‌فرض',
  address: '',
  phone: '',
  logoUrl: '',
  currency: 'تومان'
};

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // API Routes
  app.get('/api/persons', (req, res) => {
    res.json([...persons].reverse());
  });

  app.post('/api/persons', (req, res) => {
    const { role, phone, personType, firstName, lastName, companyName, nationalId, fatherName, address } = req.body;
    let name = '';
    if (personType === 'legal') {
      name = companyName || '';
    } else {
      name = `${firstName || ''} ${lastName || ''}`.trim();
    }
    
    const newPerson = {
      id: Math.floor(Math.random() * 100000),
      name,
      firstName,
      lastName,
      companyName,
      personType: personType || 'real',
      nationalId: nationalId || '',
      fatherName: fatherName || '',
      address: address || '',
      role: role || 'customer',
      phone: phone || ''
    };
    persons.push(newPerson);
    res.json({ success: true, message: 'شخص با موفقیت اضافه شد', person: newPerson });
  });

  app.put('/api/persons/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = persons.findIndex(p => p.id === id);
    if (index !== -1) {
      const { role, phone, personType, firstName, lastName, companyName, nationalId, fatherName, address } = req.body;
      let name = '';
      if (personType === 'legal') {
        name = companyName || '';
      } else {
        name = `${firstName || ''} ${lastName || ''}`.trim();
      }
      persons[index] = { ...persons[index], ...req.body, name, id };
      res.json({ success: true, message: 'شخص با موفقیت ویرایش شد', person: persons[index] });
    } else {
      res.status(404).json({ success: false, message: 'شخص یافت نشد' });
    }
  });

  app.delete('/api/persons/:id', (req, res) => {
    const id = parseInt(req.params.id);
    persons = persons.filter(p => p.id !== id);
    res.json({ success: true, message: 'شخص با موفقیت حذف شد' });
  });

  app.get('/api/products', (req, res) => {
    // Sort products by id descending to show newest first
    res.json([...products].reverse());
  });

  app.post('/api/products', (req, res) => {
    const { name, price, type, category } = req.body;
    const newProduct = {
      id: Math.floor(Math.random() * 100000),
      name,
      price: Number(price),
      type: type || 'product',
      category: category || 'عمومی'
    };
    products.push(newProduct);
    res.json({ success: true, message: 'کالا/خدمات با موفقیت اضافه شد', product: newProduct });
  });

  app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      const { price } = req.body;
      products[index] = { ...products[index], ...req.body, price: Number(price) || 0, id };
      res.json({ success: true, message: 'کالا با موفقیت ویرایش شد', product: products[index] });
    } else {
      res.status(404).json({ success: false, message: 'کالا یافت نشد' });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    products = products.filter(p => p.id !== id);
    res.json({ success: true, message: 'کالا با موفقیت حذف شد' });
  });

  app.get('/api/invoices', (req, res) => {
    // Return invoices with customer names attached
    const enrichedInvoices = invoices.map(inv => {
      const customer = persons.find(c => c.id === inv.customerId);
      return {
        ...inv,
        customerName: customer ? customer.name : 'نامشخص'
      };
    });
    // Sort by newest first
    res.json(enrichedInvoices.reverse());
  });

  app.post('/api/invoices', (req, res) => {
    const invoice = req.body;
    const newInvoice = {
      ...invoice,
      id: Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString()
    };
    invoices.push(newInvoice);
    console.log('Invoice saved:', newInvoice);
    res.json({ 
      success: true, 
      message: 'فاکتور با موفقیت ثبت شد', 
      invoiceId: newInvoice.id 
    });
  });

  // Bank Accounts API
  app.get('/api/accounts', (req, res) => {
    res.json([...accounts].reverse());
  });

  app.post('/api/accounts', (req, res) => {
    const { bankName, branchName, accountNumber, cardNumber, shebaNumber, balance, accountHolder } = req.body;
    const newAccount = {
      id: Math.floor(Math.random() * 100000),
      bankName: bankName || 'بانک نامشخص',
      branchName: branchName || '',
      accountNumber: accountNumber || '',
      cardNumber: cardNumber || '',
      shebaNumber: shebaNumber || '',
      balance: Number(balance) || 0,
      accountHolder: accountHolder || ''
    };
    accounts.push(newAccount);
    res.json({ success: true, message: 'حساب بانکی با موفقیت ثبت شد', account: newAccount });
  });

  app.put('/api/accounts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      const { balance } = req.body;
      accounts[index] = { ...accounts[index], ...req.body, balance: Number(balance) || 0, id };
      res.json({ success: true, message: 'حساب بانکی با موفقیت ویرایش شد', account: accounts[index] });
    } else {
      res.status(404).json({ success: false, message: 'حساب بانکی یافت نشد' });
    }
  });

  app.delete('/api/accounts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    accounts = accounts.filter(a => a.id !== id);
    res.json({ success: true, message: 'حساب بانکی با موفقیت حذف شد' });
  });

  // Cashboxes API
  app.get('/api/cashboxes', (req, res) => {
    res.json([...cashboxes].reverse());
  });

  app.post('/api/cashboxes', (req, res) => {
    const { name, manager, balance } = req.body;
    const newCashbox = {
      id: Math.floor(Math.random() * 100000),
      name: name || 'صندوق نامشخص',
      manager: manager || '',
      balance: Number(balance) || 0
    };
    cashboxes.push(newCashbox);
    res.json({ success: true, message: 'صندوق با موفقیت ثبت شد', cashbox: newCashbox });
  });

  app.put('/api/cashboxes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = cashboxes.findIndex(c => c.id === id);
    if (index !== -1) {
      const { balance } = req.body;
      cashboxes[index] = { ...cashboxes[index], ...req.body, balance: Number(balance) || 0, id };
      res.json({ success: true, message: 'صندوق با موفقیت ویرایش شد', cashbox: cashboxes[index] });
    } else {
      res.status(404).json({ success: false, message: 'صندوق یافت نشد' });
    }
  });

  app.delete('/api/cashboxes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    cashboxes = cashboxes.filter(c => c.id !== id);
    res.json({ success: true, message: 'صندوق با موفقیت حذف شد' });
  });

  // Store Settings API
  app.get('/api/settings', (req, res) => {
    res.json(storeSettings);
  });

  app.post('/api/settings', (req, res) => {
    storeSettings = { ...storeSettings, ...req.body };
    res.json({ success: true, message: 'تنظیمات با موفقیت ذخیره شد', settings: storeSettings });
  });

  app.post('/api/system/update', (req, res) => {
    exec('git pull origin main', (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'خطا در دریافت بروزرسانی از گیت‌هاب', error: stderr || error.message });
      }
      res.json({ success: true, message: 'بروزرسانی با موفقیت انجام شد', output: stdout });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static serving for production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
