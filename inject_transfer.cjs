const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(
  "import CheckManagement from './components/CheckManagement';",
  "import CheckManagement from './components/CheckManagement';\nimport FinancialTransfer from './components/FinancialTransfer';"
);

c = c.replace(
  "{ id: 'checks', label: 'چک‌ها', icon: <CreditCard className=\"w-4 h-4\" /> },",
  "{ id: 'checks', label: 'چک‌ها', icon: <CreditCard className=\"w-4 h-4\" /> },\n             { id: 'transfer', label: 'انتقال وجه', icon: <ArrowRightLeft className=\"w-4 h-4\" /> },"
);

c = c.replace(
  "(!['products', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'person_ledger', 'database', 'update', 'checklist', 'checks'].includes(activeTab))",
  "(!['products', 'persons', 'accounts', 'cashboxes', 'settings', 'financial_report', 'person_ledger', 'database', 'update', 'checklist', 'checks', 'transfer'].includes(activeTab))"
);

const tContent = `      ) : activeTab === 'transfer' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><FinancialTransfer /></motion.div>
      ) : activeTab === 'settings'`;
c = c.replace(") : activeTab === 'settings'", tContent);

// Also need to import ArrowRightLeft
const imports = `import { Maximize, Minimize, Tag, Plus, Trash2, Edit2, Save, FileText, User, ShoppingCart, Calculator, CheckCircle, AlertCircle, AlertTriangle, Info, FilePlus, Calendar, List, Receipt, Search, DollarSign, Package, X, RefreshCw, Menu, Github, CreditCard, Wallet, Store, Settings, TrendingUp, TrendingDown, BarChart3, ChevronDown, ChevronUp, Printer, Eye, ListTodo, CheckSquare, LogOut, LogIn, Database, ArrowDownToLine, ArrowUpFromLine, FileSpreadsheet, Users, BookOpen, ClipboardList, Activity, Clock, History, ArrowRightLeft } from 'lucide-react';`;
c = c.replace(/import \{ Maximize.*?\} from 'lucide-react';/, imports);
fs.writeFileSync('src/App.tsx', c);
