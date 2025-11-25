import React, { useState } from 'react';
import { Transaction, TransactionType, Category, RecurrenceFrequency, RecurringTransaction } from '../types';
import { generateId, saveRecurringTransactions, getRecurringTransactions } from '../services/storageService';
import { CATEGORY_OPTIONS } from '../constants';
import { Plus, RefreshCw } from 'lucide-react';

interface TransactionFormProps {
  userId: string;
  onAdd: (t: Transaction) => void;
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ userId, onAdd, onClose }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>(Category.Food);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const numAmount = parseFloat(amount);
    const id = generateId();

    // 1. Handle Recurring Rule Creation
    if (isRecurring) {
      const newRecurring: RecurringTransaction = {
        id: generateId(),
        amount: numAmount,
        type,
        category,
        description,
        startDate: date,
        frequency,
        nextDueDate: date, 
      };
      const existing = getRecurringTransactions(userId);
      saveRecurringTransactions(userId, [...existing, newRecurring]);
    }

    // 2. Create the immediate transaction (Standard behavior for "Add Transaction")
    const newTransaction: Transaction = {
      id,
      amount: numAmount,
      description,
      type,
      category,
      date,
    };

    onAdd(newTransaction);
    
    // If recurring was checked, update the nextDueDate immediately to prevent duplicates
    if (isRecurring) {
       const allRecurring = getRecurringTransactions(userId);
       const ruleIndex = allRecurring.length - 1; // The one we just added
       
       let nextDate = new Date(date);
       if (frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
       if (frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
       if (frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
       if (frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
       
       allRecurring[ruleIndex].nextDueDate = nextDate.toISOString().split('T')[0];
       saveRecurringTransactions(userId, allRecurring);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-indigo-600 p-4">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <Plus size={24} /> New Transaction
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
               <div className="flex bg-gray-100 rounded-lg p-1">
                 <button
                   type="button"
                   onClick={() => setType('income')}
                   className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                     type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   Income
                 </button>
                 <button
                   type="button"
                   onClick={() => setType('expense')}
                   className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                     type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   Expense
                 </button>
               </div>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
               <input
                 type="date"
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                 required
               />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Weekly Groceries"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              required
            />
          </div>
          
          <div className="pt-2 border-t border-gray-100">
             <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id="recurring" 
                  checked={isRecurring} 
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                   <RefreshCw size={14} className="text-gray-500" /> Recurring Payment?
                </label>
             </div>
             
             {isRecurring && (
               <div className="bg-indigo-50 p-3 rounded-lg animate-fade-in">
                  <label className="block text-xs font-semibold text-indigo-800 uppercase mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <p className="text-xs text-indigo-600 mt-2">
                    This transaction will be automatically added to your history {frequency} starting from {new Date(date).toLocaleDateString()}.
                  </p>
               </div>
             )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md transition-colors"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};