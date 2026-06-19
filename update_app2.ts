import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add the loans menu item. Let's find "debts_credits".
code = code.replace(
  "{ id: 'debts_credits', title: 'طلبکاران و بدهکاران', icon: <Scale className=\"w-4 h-4\"/>, isSubMenu: true },",
  "{ id: 'debts_credits', title: 'طلبکاران و بدهکاران', icon: <Scale className=\"w-4 h-4\"/>, isSubMenu: true },\n      { id: 'loans', title: 'وام و اقساط', icon: <Wallet className=\"w-4 h-4\"/>, isSubMenu: true },"
);

// Add the component rendering.
code = code.replace(
  "{activeTab === 'debts_credits' && <DebtsCredits persons={persons} accounts={accounts} invoices={invoices} transactions={transactions} checks={[...issuedChecks, ...receivedChecks]} setTransactions={setTransactions} setAccounts={setAccounts} />}",
  "{activeTab === 'debts_credits' && <DebtsCredits persons={persons} accounts={accounts} invoices={invoices} transactions={transactions} checks={[...issuedChecks, ...receivedChecks]} setTransactions={setTransactions} setAccounts={setAccounts} />}\n              {activeTab === 'loans' && <LoansManager loans={loans} setLoans={setLoans} installments={installments} setInstallments={setInstallments} persons={persons} accounts={accounts} setAccounts={setAccounts} transactions={transactions} setTransactions={setTransactions} />}"
);

// Add the import statement
code = code.replace(
  "import DebtsCredits from './components/financial/DebtsCredits';",
  "import DebtsCredits from './components/financial/DebtsCredits';\nimport LoansManager from './components/financial/LoansManager';"
);

fs.writeFileSync('src/App.tsx', code);
console.log('updated menu and import');
