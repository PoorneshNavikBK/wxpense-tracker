import React, { useState, useEffect, useContext } from 'react';
import { Save } from 'lucide-react';
import { ThemeContext } from '../App';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

export function ExpenseForm() {
  const theme = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
  });

  const [currency, setCurrency] = useState('INR');

  // Define theme-dependent colors
  const colors = {
    background: theme === 'light' ? 'bg-[#b2d8d8]' : 'bg-[#233d4d]',
    cardTitle: theme === 'light' ? 'text-[#006666]' : 'text-[#b2d8d8]',
    cardText: theme === 'light' ? 'text-[#008080]' : 'text-[#66b2b2]',
    border: theme === 'light' ? 'border-[#004c4c]' : 'border-[#3a506b]',
    inputBg: theme === 'light' ? 'bg-white' : 'bg-[#1a2c39]',
    inputText: theme === 'light' ? 'text-gray-800' : 'text-gray-200',
    button: theme === 'light' ? 'bg-[#008080] hover:bg-[#006666]' : 'bg-[#31572c] hover:bg-[#274a24]',
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem('novaSpendCurrency');
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new transaction
    const newTransaction: Transaction = {
      id: Date.now(),
      description: formData.description,
      amount: -Math.abs(Number(formData.amount)), // Make amount negative for expenses
      date: formData.date,
      category: formData.category,
      notes: formData.notes || undefined,
    };

    // Update transactions in localStorage
    const savedTransactions = localStorage.getItem('novaSpendTransactions');
    const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
    transactions.unshift(newTransaction);
    localStorage.setItem('novaSpendTransactions', JSON.stringify(transactions));

    // Update stats
    const savedStats = localStorage.getItem('novaSpendStats');
    const stats = savedStats ? JSON.parse(savedStats) : {
      balance: 0,
      monthlyBudget: 0,
      totalExpenses: 0,
      pending: 0
    };
    
    stats.balance -= Number(formData.amount);
    stats.totalExpenses += Number(formData.amount);
    localStorage.setItem('novaSpendStats', JSON.stringify(stats));

    // Dispatch a custom event to notify other components about the update
    window.dispatchEvent(new Event('novaSpendUpdate'));
    
    // Reset form
    setFormData({
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      notes: '',
    });

    alert('Expense added successfully!');
  };

  return (
    <div className={`max-w-2xl mx-auto ${colors.background} rounded-lg p-4 md:p-6 shadow-md transition-colors duration-300`}>
      <h2 className={`text-xl md:text-2xl font-semibold ${colors.cardTitle} mb-4 md:mb-6 transition-colors duration-300`}>Add New Expense</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label htmlFor="amount" className={`block text-sm font-medium ${colors.cardText} mb-2 transition-colors duration-300`}>
              Amount {currency === 'INR' ? '(₹)' : '($)'}
            </label>
            <input
              type="number"
              id="amount"
              step="0.01"
              required
              className={`w-full px-4 py-2 rounded-lg border ${colors.border} ${colors.inputBg} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-[#66b2b2] transition-colors duration-300`}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="category" className={`block text-sm font-medium ${colors.cardText} mb-2 transition-colors duration-300`}>
              Category
            </label>
            <select
              id="category"
              required
              className={`w-full px-4 py-2 rounded-lg border ${colors.border} ${colors.inputBg} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-[#66b2b2] transition-colors duration-300`}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select a category</option>
              <option value="food">Food</option>
              <option value="transportation">Transportation</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="health">Health</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="date" className={`block text-sm font-medium ${colors.cardText} mb-2 transition-colors duration-300`}>
              Date
            </label>
            <input
              type="date"
              id="date"
              required
              className={`w-full px-4 py-2 rounded-lg border ${colors.border} ${colors.inputBg} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-[#66b2b2] transition-colors duration-300`}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="description" className={`block text-sm font-medium ${colors.cardText} mb-2 transition-colors duration-300`}>
              Description
            </label>
            <input
              type="text"
              id="description"
              required
              className={`w-full px-4 py-2 rounded-lg border ${colors.border} ${colors.inputBg} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-[#66b2b2] transition-colors duration-300`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className={`block text-sm font-medium ${colors.cardText} mb-2 transition-colors duration-300`}>
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            className={`w-full px-4 py-2 rounded-lg border ${colors.border} ${colors.inputBg} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-[#66b2b2] transition-colors duration-300`}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 ${colors.button} text-white py-3 px-6 rounded-lg transition-colors duration-300`}
        >
          <Save size={20} />
          Save Expense
        </button>
      </form>
    </div>
  );
}