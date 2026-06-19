import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// I need to add import LoansManager from './components/loans/LoansManager.tsx';
code = code.replace(
  "import DebtsCreditsReport from './components/reports/DebtsCreditsReport';",
  "import DebtsCreditsReport from './components/reports/DebtsCreditsReport';\nimport LoansManager from './components/loans/LoansManager';"
);

// I need to find the correct activeTab for debts_credits rendering or something
code = code.replace(
  "{activeTab === 'users_manager' && <UsersManager",
  "{activeTab === 'loans' && <LoansManager loans={loans} setLoans={setLoans} installments={installments} setInstallments={setInstallments} persons={persons} accounts={accounts} setAccounts={setAccounts} transactions={transactions} setTransactions={setTransactions} />}\n              {activeTab === 'users_manager' && <UsersManager"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed imports and rendering');
