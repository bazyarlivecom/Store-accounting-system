import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const errLine = "const [activeTab, setActiveTab ] = useState<'create_sale' | 'debts_credits' | 'create_purchase' | 'list_sale' | 'list_purchase' | 'create_receive_receipt' | 'list_receive_receipt' | 'create_pay_receipt' | 'list_pay_receipt' | 'create_salary_payroll' | 'list_salary_payroll' | 'create_warehouse_doc' | 'list_warehouse_docs' | 'products' | 'product_view' | 'product_categories' | 'persons' | 'person_groups' | 'person_roles' | 'accounts' | 'cashboxes' | 'warehouses' | 'update' | 'settings' | 'financial_report' | 'analytical_dashboard' | 'person_ledger' | 'inventory_report' | 'checklist' | 'database' | 'users_manager' | 'checkbooks' | 'issued_checks' | 'received_checks' | 'check_calendar' | 'transfer' | 'invoice_allocation' | 'quick_refund' | 'quick_price_inquiry' | 'create_sale_return' | 'create_purchase_return' | 'list_sale_return' | 'list_purchase_return | 'loans''>('financial_report');"

const fixLine = "const [activeTab, setActiveTab ] = useState<'create_sale' | 'debts_credits' | 'create_purchase' | 'list_sale' | 'list_purchase' | 'create_receive_receipt' | 'list_receive_receipt' | 'create_pay_receipt' | 'list_pay_receipt' | 'create_salary_payroll' | 'list_salary_payroll' | 'create_warehouse_doc' | 'list_warehouse_docs' | 'products' | 'product_view' | 'product_categories' | 'persons' | 'person_groups' | 'person_roles' | 'accounts' | 'cashboxes' | 'warehouses' | 'update' | 'settings' | 'financial_report' | 'analytical_dashboard' | 'person_ledger' | 'inventory_report' | 'checklist' | 'database' | 'users_manager' | 'checkbooks' | 'issued_checks' | 'received_checks' | 'check_calendar' | 'transfer' | 'invoice_allocation' | 'quick_refund' | 'quick_price_inquiry' | 'create_sale_return' | 'create_purchase_return' | 'list_sale_return' | 'list_purchase_return' | 'loans'>('financial_report');"

code = code.replace(errLine, fixLine);
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed tabs active state');
