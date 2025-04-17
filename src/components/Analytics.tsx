import React, { useEffect, useState, useContext } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { ThemeContext } from '../App';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
    };
    percent: number;
  }>;
}

export function Analytics() {
  const theme = useContext(ThemeContext);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; }[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrency] = useState('INR');

  // Define theme-dependent colors
  const colors = {
    text: theme === 'light' ? 'text-[#006666]' : 'text-[#66b2b2]',
    secondaryText: theme === 'light' ? 'text-[#008080]' : 'text-[#b2d8d8]',
    cardBg: theme === 'light' ? 'bg-white' : 'bg-[#233d4d]',
    chartColors: theme === 'light' 
      ? ['#006666', '#66b2b2', '#b2d8d8', '#008080', '#33cccc'] 
      : ['#66b2b2', '#1a2c39', '#6a4c93', '#3a506b', '#1c2541'],
  };

  useEffect(() => {
    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem('novaSpendTransactions');
    const savedCurrency = localStorage.getItem('novaSpendCurrency');
    
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      setTransactions(parsedTransactions);
      
      // Process category data
      const categories: { [key: string]: number } = {};
      parsedTransactions.forEach((transaction: Transaction) => {
        if (transaction.amount < 0) { // Only count expenses
          const absAmount = Math.abs(transaction.amount);
          if (categories[transaction.category]) {
            categories[transaction.category] += absAmount;
          } else {
            categories[transaction.category] = absAmount;
          }
        }
      });
      
      const categoryArray = Object.entries(categories).map(([name, value]) => ({
        name,
        value
      }));
      
      setCategoryData(categoryArray);
    }
    
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  const formatCurrency = (amount: number) => {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const { name, percent } = payload[0];
      return (
        <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1a2c39]'} p-2 border ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'} rounded shadow-lg`}>
          <p className={colors.text}>{name}</p>
          <p className={colors.secondaryText}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Category Amounts Chart */}
      <div className={`${colors.cardBg} rounded-lg shadow-md p-6 h-80 transition-colors duration-300`}>
        <h2 className={`text-xl font-semibold ${colors.text} mb-4`}>Expenses by Category</h2>
        
        {categoryData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className={colors.secondaryText}>No expense data available yet.</p>
          </div>
        ) : (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors.chartColors[index % colors.chartColors.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}