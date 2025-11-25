import React, { useMemo } from 'react';
import { Transaction, FinancialSummary } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { PIE_COLORS } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const summary: FinancialSummary = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        const amount = Number(curr.amount);
        if (curr.type === 'income') {
          acc.totalIncome += amount;
          acc.balance += amount;
        } else {
          acc.totalExpense += amount;
          acc.balance -= amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const catMap = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Balance</p>
            <h3 className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
              ${summary.balance.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
            <ArrowUpCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Income</p>
            <h3 className="text-2xl font-bold text-gray-900">${summary.totalIncome.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <ArrowDownCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
            <h3 className="text-2xl font-bold text-gray-900">${summary.totalExpense.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" />
              Recent Activity
            </h3>
          </div>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet.</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-semibold text-gray-800">{t.description}</p>
                      <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} • {t.category}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mini Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
           <h3 className="text-lg font-bold text-gray-800 mb-6">Expense Breakdown</h3>
           {categoryData.length > 0 ? (
             <div className="flex-1 min-h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={categoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="flex-1 flex items-center justify-center text-gray-400">
               No expense data to display
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
