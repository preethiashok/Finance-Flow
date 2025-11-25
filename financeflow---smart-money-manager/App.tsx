import React, { useState, useEffect } from 'react';
import { LayoutDashboard, List, PieChart, Brain, Plus, Target, FileText, LogOut } from 'lucide-react';
import { Transaction, User } from './types';
import { getTransactions, saveTransactions, processRecurringTransactions, getCurrentSession, logoutUser } from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { Analytics } from './components/Analytics';
import { AIAdvisor } from './components/AIAdvisor';
import { BudgetGoals } from './components/BudgetGoals';
import { Reports } from './components/Reports';
import { TransactionForm } from './components/TransactionForm';
import { Auth } from './components/Auth';

type View = 'dashboard' | 'transactions' | 'analytics' | 'advisor' | 'budgets' | 'reports';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Check for active session on load
  useEffect(() => {
    const sessionUser = getCurrentSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      // 1. Process recurring first to ensure data is up to date
      const updatedWithRecurring = processRecurringTransactions(user.id);
      // 2. Set state
      setTransactions(updatedWithRecurring);
    } else {
      setTransactions([]);
    }
  }, [user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleAddTransaction = (t: Transaction) => {
    if (!user) return;
    const updated = [t, ...transactions];
    setTransactions(updated);
    saveTransactions(user.id, updated);
  };

  const handleDeleteTransaction = (id: string) => {
    if (!user) return;
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveTransactions(user.id, updated);
  };

  const renderView = () => {
    if (!user) return null;
    
    switch (currentView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
      case 'transactions':
        return <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />;
      case 'analytics':
        return <Analytics transactions={transactions} />;
      case 'budgets':
        return <BudgetGoals userId={user.id} transactions={transactions} />;
      case 'reports':
        return <Reports transactions={transactions} />;
      case 'advisor':
        return <AIAdvisor transactions={transactions} />;
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900 font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-indigo-700 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-white text-indigo-700 p-1 rounded font-extrabold text-sm">FF</span>
          FinanceFlow
        </h1>
        <div className="flex gap-2">
            <button onClick={() => setIsFormOpen(true)} className="p-2 bg-indigo-500 rounded-full text-white hover:bg-indigo-400">
                <Plus size={20} />
            </button>
            <button onClick={handleLogout} className="p-2 bg-indigo-800 rounded-full text-white hover:bg-indigo-900">
                <LogOut size={20} />
            </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 z-10 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg">
              $
            </div>
            FinanceFlow
          </h1>
          <p className="text-xs text-gray-400 mt-2 pl-10">Logged in as <span className="font-semibold text-gray-600">{user.username}</span></p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
          />
          <NavItem 
            icon={<List size={20} />} 
            label="Transactions" 
            active={currentView === 'transactions'} 
            onClick={() => setCurrentView('transactions')} 
          />
          <NavItem 
            icon={<PieChart size={20} />} 
            label="Analytics" 
            active={currentView === 'analytics'} 
            onClick={() => setCurrentView('analytics')} 
          />
          <NavItem 
            icon={<Target size={20} />} 
            label="Budgets & Goals" 
            active={currentView === 'budgets'} 
            onClick={() => setCurrentView('budgets')} 
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="Reports" 
            active={currentView === 'reports'} 
            onClick={() => setCurrentView('reports')} 
          />
          <NavItem 
            icon={<Brain size={20} />} 
            label="AI Advisor" 
            active={currentView === 'advisor'} 
            onClick={() => setCurrentView('advisor')} 
            highlight
          />
        </nav>

        <div className="p-6 border-t border-gray-100 space-y-3">
           <button 
             onClick={() => setIsFormOpen(true)}
             className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
           >
             <Plus size={20} /> Add New
           </button>
           
           <button 
             onClick={handleLogout}
             className="w-full py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
           >
             <LogOut size={16} /> Log Out
           </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-between px-4 p-3 z-20 pb-safe overflow-x-auto">
        <MobileNavItem icon={<LayoutDashboard size={24} />} label="Home" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
        <MobileNavItem icon={<List size={24} />} label="List" active={currentView === 'transactions'} onClick={() => setCurrentView('transactions')} />
        <MobileNavItem icon={<Target size={24} />} label="Goals" active={currentView === 'budgets'} onClick={() => setCurrentView('budgets')} />
        <MobileNavItem icon={<FileText size={24} />} label="Rpts" active={currentView === 'reports'} onClick={() => setCurrentView('reports')} />
        <MobileNavItem icon={<Brain size={24} />} label="AI" active={currentView === 'advisor'} onClick={() => setCurrentView('advisor')} />
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-60px)] md:h-screen pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
           <header className="mb-8 hidden md:block">
             <h2 className="text-2xl font-bold text-gray-800 capitalize">
               {currentView === 'budgets' ? 'Budgets & Financial Goals' : currentView}
             </h2>
             <p className="text-gray-500">Welcome back, track your financial growth.</p>
           </header>
           
           {renderView()}
        </div>
      </main>

      {/* Transaction Modal */}
      {isFormOpen && (
        <TransactionForm userId={user.id} onAdd={handleAddTransaction} onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
};

// Subcomponents for cleaner App file
const NavItem = ({ icon, label, active, onClick, highlight }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      active 
        ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    } ${highlight && !active ? 'text-indigo-500' : ''}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center min-w-[50px] ${
      active ? 'text-indigo-600' : 'text-gray-400'
    }`}
  >
    {icon}
    <span className="text-[10px] mt-1">{label}</span>
  </button>
);

export default App;