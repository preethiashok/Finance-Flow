import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

interface AnalyticsProps {
  transactions: Transaction[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ transactions }) => {
  // Aggregate data by month for Bar Chart
  const monthlyData = useMemo(() => {
    const data: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!data[monthKey]) {
        data[monthKey] = { income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        data[monthKey].income += Number(t.amount);
      } else {
        data[monthKey].expense += Number(t.amount);
      }
    });

    return Object.keys(data).sort().map(key => {
        const date = new Date(key + '-01'); // Approximation for label
        return {
            name: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
            income: data[key].income,
            expense: data[key].expense
        }
    });
  }, [transactions]);

  // Cumulative balance over time for Area Chart
  const balanceHistory = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    
    // Group by day to avoid noisy charts
    const dailyMap: Record<string, number> = {};
    sorted.forEach(t => {
        const amount = t.type === 'income' ? t.amount : -t.amount;
        if (!dailyMap[t.date]) dailyMap[t.date] = 0;
        dailyMap[t.date] += amount;
    });

    // Create cumulative array
    const result = [];
    const sortedDates = Object.keys(dailyMap).sort();
    
    for (const date of sortedDates) {
        currentBalance += dailyMap[date];
        result.push({
            date,
            balance: currentBalance
        });
    }
    return result;
  }, [transactions]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Income vs Expense (Monthly)</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Net Worth Growth</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={balanceHistory}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => new Date(val).getDate().toString()} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <Area type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
