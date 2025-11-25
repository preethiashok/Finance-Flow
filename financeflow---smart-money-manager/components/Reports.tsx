import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { FileDown, Calendar, Filter } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../constants';

interface ReportsProps {
  transactions: Transaction[];
}

export const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const start = startDate ? new Date(startDate) : new Date('2000-01-01');
      const end = endDate ? new Date(endDate) : new Date('2099-12-31');
      
      const inDateRange = d >= start && d <= end;
      const matchType = typeFilter === 'all' || t.type === typeFilter;
      const matchCat = categoryFilter === 'all' || t.category === categoryFilter;

      return inDateRange && matchType && matchCat;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, startDate, endDate, typeFilter, categoryFilter]);

  const summary = useMemo(() => {
     return filteredTransactions.reduce((acc, curr) => {
        if (curr.type === 'income') acc.income += curr.amount;
        else acc.expense += curr.amount;
        return acc;
     }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const downloadCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredTransactions.map(t => [
        t.id, 
        t.date, 
        t.type, 
        t.category, 
        `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
        t.amount.toString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <Filter size={20} className="text-indigo-600" /> Custom Reports
            </h2>
            <button 
               onClick={downloadCSV}
               disabled={filteredTransactions.length === 0}
               className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
               <FileDown size={16} /> Export CSV
            </button>
         </div>

         {/* Filters */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div>
               <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
               <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500" />
               </div>
            </div>
            <div>
               <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
               <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500" />
               </div>
            </div>
            <div>
               <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
               <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500">
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
               <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500">
                  <option value="all">All Categories</option>
                  {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
         </div>

         {/* Summary Strip */}
         <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
               <p className="text-xs text-emerald-600 font-medium uppercase">Filtered Income</p>
               <p className="text-xl font-bold text-emerald-700">${summary.income.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
               <p className="text-xs text-red-600 font-medium uppercase">Filtered Expense</p>
               <p className="text-xl font-bold text-red-700">${summary.expense.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
               <p className="text-xs text-indigo-600 font-medium uppercase">Net Result</p>
               <p className="text-xl font-bold text-indigo-700">${(summary.income - summary.expense).toLocaleString()}</p>
            </div>
         </div>

         {/* Results Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-200">
                     <th className="py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Date</th>
                     <th className="py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Description</th>
                     <th className="py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Category</th>
                     <th className="py-3 px-2 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.length === 0 ? (
                     <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">No matches found for these filters.</td></tr>
                  ) : filteredTransactions.map(t => (
                     <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2 text-sm text-gray-600">{t.date}</td>
                        <td className="py-3 px-2 text-sm font-medium text-gray-800">{t.description}</td>
                        <td className="py-3 px-2 text-sm text-gray-500">
                           <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">{t.category}</span>
                        </td>
                        <td className={`py-3 px-2 text-sm font-bold text-right ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                           {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
