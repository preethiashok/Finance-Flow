import React, { useState, useEffect } from 'react';
import { Transaction, Budget, SavingsGoal, Category } from '../types';
import { getBudgets, saveBudgets, getGoals, saveGoals, generateId } from '../services/storageService';
import { CATEGORY_OPTIONS } from '../constants';
import { Target, PiggyBank, Plus, Trash2, Edit2, Check } from 'lucide-react';

interface BudgetGoalsProps {
  userId: string;
  transactions: Transaction[];
}

export const BudgetGoals: React.FC<BudgetGoalsProps> = ({ userId, transactions }) => {
  const [activeTab, setActiveTab] = useState<'budgets' | 'goals'>('budgets');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [formCategory, setFormCategory] = useState(Category.Food);
  const [formAmount, setFormAmount] = useState('');
  const [formGoalName, setFormGoalName] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');
  const [formCurrentAmount, setFormCurrentAmount] = useState('');

  useEffect(() => {
    setBudgets(getBudgets(userId));
    setGoals(getGoals(userId));
  }, [userId]);

  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Calculate spent per category for current month
  const categorySpend = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthStr))
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {} as Record<string, number>);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount) return;
    
    // Check if budget exists for category
    const existingIdx = budgets.findIndex(b => b.category === formCategory);
    let newBudgets = [...budgets];
    
    if (existingIdx >= 0) {
      newBudgets[existingIdx].amount = parseFloat(formAmount);
    } else {
      newBudgets.push({
        id: generateId(),
        category: formCategory,
        amount: parseFloat(formAmount)
      });
    }
    
    setBudgets(newBudgets);
    saveBudgets(userId, newBudgets);
    setIsAdding(false);
    setFormAmount('');
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGoalName || !formAmount || !formTargetDate) return;

    const newGoal: SavingsGoal = {
        id: generateId(),
        name: formGoalName,
        targetAmount: parseFloat(formAmount),
        currentAmount: parseFloat(formCurrentAmount) || 0,
        targetDate: formTargetDate
    };

    const newGoals = [...goals, newGoal];
    setGoals(newGoals);
    saveGoals(userId, newGoals);
    setIsAdding(false);
    resetGoalForm();
  };

  const updateGoalProgress = (id: string, amount: number) => {
      const newGoals = goals.map(g => g.id === id ? { ...g, currentAmount: amount } : g);
      setGoals(newGoals);
      saveGoals(userId, newGoals);
  };

  const deleteBudget = (id: string) => {
      const newBudgets = budgets.filter(b => b.id !== id);
      setBudgets(newBudgets);
      saveBudgets(userId, newBudgets);
  };

  const deleteGoal = (id: string) => {
      const newGoals = goals.filter(g => g.id !== id);
      setGoals(newGoals);
      saveGoals(userId, newGoals);
  };

  const resetGoalForm = () => {
    setFormGoalName('');
    setFormAmount('');
    setFormTargetDate('');
    setFormCurrentAmount('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Tab Switcher */}
       <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl w-fit">
          <button
            onClick={() => { setActiveTab('budgets'); setIsAdding(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'budgets' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Monthly Budgets
          </button>
          <button
            onClick={() => { setActiveTab('goals'); setIsAdding(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'goals' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Savings Goals
          </button>
       </div>

       {/* Add Button */}
       {!isAdding && (
           <button 
             onClick={() => setIsAdding(true)}
             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors text-sm font-medium"
           >
             <Plus size={16} /> 
             {activeTab === 'budgets' ? 'Set New Budget' : 'Add New Goal'}
           </button>
       )}

       {/* Forms */}
       {isAdding && activeTab === 'budgets' && (
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Set Category Budget</h3>
              <form onSubmit={handleSaveBudget} className="flex flex-col md:flex-row gap-4 items-end">
                 <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <select 
                      value={formCategory} 
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Limit ($)</label>
                    <input 
                       type="number" 
                       value={formAmount}
                       onChange={e => setFormAmount(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                       placeholder="500"
                       required
                    />
                 </div>
                 <div className="flex gap-2 w-full md:w-auto">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Save</button>
                 </div>
              </form>
           </div>
       )}

       {isAdding && activeTab === 'goals' && (
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Create Savings Goal</h3>
              <form onSubmit={handleSaveGoal} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Goal Name</label>
                        <input type="text" value={formGoalName} onChange={e => setFormGoalName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="New Car" required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Target Date</label>
                        <input type="date" value={formTargetDate} onChange={e => setFormTargetDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Target Amount ($)</label>
                        <input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="10000" required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Current Saved ($)</label>
                        <input type="number" value={formCurrentAmount} onChange={e => setFormCurrentAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
                    </div>
                 </div>
                 <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Create Goal</button>
                 </div>
              </form>
           </div>
       )}

       {/* Content */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {activeTab === 'budgets' && (
             budgets.length === 0 ? <p className="text-gray-500 col-span-2 text-center py-10">No budgets set. Click 'Set New Budget' to start tracking.</p> :
             budgets.map(budget => {
                const spent = categorySpend[budget.category] || 0;
                const percentage = Math.min((spent / budget.amount) * 100, 100);
                let color = 'bg-emerald-500';
                if (percentage > 75) color = 'bg-yellow-500';
                if (percentage > 90) color = 'bg-red-500';

                return (
                  <div key={budget.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                           <h4 className="font-bold text-gray-800">{budget.category}</h4>
                           <p className="text-xs text-gray-500">Monthly Budget</p>
                        </div>
                        <button onClick={() => deleteBudget(budget.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                     </div>
                     <div className="mb-2 flex justify-between items-end">
                        <span className={`text-2xl font-bold ${spent > budget.amount ? 'text-red-600' : 'text-gray-800'}`}>${spent.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 mb-1">of ${budget.amount.toLocaleString()}</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percentage}%` }}></div>
                     </div>
                     <p className="text-xs text-gray-400 mt-2 text-right">{percentage.toFixed(0)}% used</p>
                  </div>
                );
             })
           )}

           {activeTab === 'goals' && (
             goals.length === 0 ? <p className="text-gray-500 col-span-2 text-center py-10">No savings goals yet. Create one to stay motivated!</p> :
             goals.map(goal => {
                const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                
                return (
                   <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                               <Target size={20} />
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-800">{goal.name}</h4>
                               <p className="text-xs text-gray-500">{daysLeft > 0 ? `${daysLeft} days left` : 'Target date passed'}</p>
                            </div>
                         </div>
                         <button onClick={() => deleteGoal(goal.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                      </div>

                      <div className="space-y-1 mb-4">
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-bold text-gray-800">{percentage.toFixed(0)}%</span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                         </div>
                         <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>${goal.currentAmount.toLocaleString()}</span>
                            <span>Target: ${goal.targetAmount.toLocaleString()}</span>
                         </div>
                      </div>

                      {/* Update input */}
                      <div className="pt-4 border-t border-gray-50">
                         <label className="text-xs font-medium text-gray-500">Update Saved Amount</label>
                         <div className="flex gap-2 mt-1">
                            <input 
                              type="number" 
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-indigo-500 outline-none"
                              placeholder={goal.currentAmount.toString()}
                              onBlur={(e) => {
                                 const val = parseFloat(e.target.value);
                                 if (!isNaN(val)) updateGoalProgress(goal.id, val);
                                 e.target.value = '';
                              }}
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                    const val = parseFloat((e.target as HTMLInputElement).value);
                                    if (!isNaN(val)) updateGoalProgress(goal.id, val);
                                    (e.target as HTMLInputElement).value = '';
                                 }
                              }}
                            />
                         </div>
                      </div>
                   </div>
                );
             })
           )}
       </div>
    </div>
  );
};