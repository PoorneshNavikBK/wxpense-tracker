import React, { useEffect, useState, useContext } from 'react';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { ThemeContext } from '../App';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export function Dashboard() {
  const theme = useContext(ThemeContext);
  const [stats, setStats] = useState({
    balance: 0,
    monthlyBudget: 0,
    totalExpenses: 0
  });

  const [currency, setCurrency] = useState('INR');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Define theme-dependent colors
  const colors = {
    cardBg: theme === 'light' ? 'bg-[#b2d8d8]' : 'bg-[#1a2c39]',
    cardText: theme === 'light' ? 'text-[#008080]' : 'text-[#b2d8d8]',
    cardTextBold: theme === 'light' ? 'text-[#006666]' : 'text-[#66b2b2]',
    iconColor: theme === 'light' ? 'text-[#66b2b2]' : 'text-[#6a4c93]',
    sectionBg: theme === 'light' ? 'bg-white' : 'bg-[#233d4d]',
    transactionBg: theme === 'light' ? 'bg-[#b2d8d8]' : 'bg-[#1a2c39]',
    transactionText: theme === 'light' ? 'text-[#008080]' : 'text-[#b2d8d8]',
  };

  useEffect(() => {
    // Load data from localStorage
    const savedStats = localStorage.getItem('novaSpendStats');
    const savedCurrency = localStorage.getItem('novaSpendCurrency');
    const savedTransactions = localStorage.getItem('novaSpendTransactions');

    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      // Remove pending property if it exists
      const { pending, ...restStats } = parsedStats;
      setStats(restStats);
    }
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
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

  const handleBalanceUpdate = () => {
    const newBalance = prompt('Enter your current balance:');
    if (newBalance && !isNaN(Number(newBalance))) {
      const updatedStats = { ...stats, balance: Number(newBalance) };
      setStats(updatedStats);
      localStorage.setItem('novaSpendStats', JSON.stringify(updatedStats));
    }
  };

  const handleBudgetUpdate = () => {
    const newBudget = prompt('Enter your monthly budget:');
    if (newBudget && !isNaN(Number(newBudget))) {
      const updatedStats = { ...stats, monthlyBudget: Number(newBudget) };
      setStats(updatedStats);
      localStorage.setItem('novaSpendStats', JSON.stringify(updatedStats));
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`${colors.cardBg} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
          onClick={handleBalanceUpdate}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${colors.cardText}`}>Current Balance</p>
              <p className={`text-2xl font-semibold ${colors.cardTextBold} mt-2`}>{formatCurrency(stats.balance)}</p>
            </div>
            <DollarSign className={colors.iconColor} size={24} />
          </div>
        </div>

        <div
          className={`${colors.cardBg} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
          onClick={handleBudgetUpdate}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${colors.cardText}`}>Monthly Budget</p>
              <p className={`text-2xl font-semibold ${colors.cardTextBold} mt-2`}>{formatCurrency(stats.monthlyBudget)}</p>
            </div>
            <TrendingUp className={colors.iconColor} size={24} />
          </div>
        </div>

        <div className={`${colors.cardBg} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${colors.cardText}`}>Total Expenses</p>
              <p className={`text-2xl font-semibold ${colors.cardTextBold} mt-2`}>{formatCurrency(stats.totalExpenses)}</p>
            </div>
            <CreditCard className={colors.iconColor} size={24} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`${colors.sectionBg} rounded-lg shadow-md p-6 transition-colors duration-300`}>
        <h2 className={`text-xl font-semibold ${colors.cardTextBold} mb-4`}>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className={`text-center ${colors.cardText} py-4`}>No transactions yet. Add your first expense!</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-4 ${colors.transactionBg} rounded-lg`}
              >
                <div>
                  <p className={`font-medium ${colors.cardTextBold}`}>{transaction.description}</p>
                  <p className={`text-sm ${colors.cardText}`}>{transaction.category} • {transaction.date}</p>
                </div>
                <p className={`font-semibold ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}