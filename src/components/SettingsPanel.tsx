import React, { useState, useEffect, useContext } from 'react';
import { Save, Download, Upload, Palette, Sun, Moon, Trash2 } from 'lucide-react';
import { ThemeContext } from '../App';

export function SettingsPanel() {
  const theme = useContext(ThemeContext);
  const [settings, setSettings] = useState({
    monthlyBudget: '0',
    balance: '0',
    theme: 'light',
    notifications: true,
    currency: 'INR',
  });

  // Define theme-dependent colors
  const colors = {
    background: theme === 'light' ? 'bg-[#b2d8d8]' : 'bg-[#233d4d]',
    cardTitle: theme === 'light' ? 'text-[#006666]' : 'text-[#b2d8d8]',
    cardText: theme === 'light' ? 'text-[#008080]' : 'text-[#66b2b2]',
    border: theme === 'light' ? 'border-[#004c4c]' : 'border-[#3a506b]',
    inputBg: theme === 'light' ? 'bg-white' : 'bg-[#1a2c39]',
    inputText: theme === 'light' ? 'text-gray-800' : 'text-gray-200',
    button: theme === 'light' ? 'bg-[#008080] hover:bg-[#006666]' : 'bg-[#31572c] hover:bg-[#274a24]',
    selectedBorder: theme === 'light' ? 'border-[#6a4c93]' : 'border-[#6a4c93]',
    currencyActive: theme === 'light' ? 'bg-[#66b2b2]' : 'bg-[#31572c]',
    currencyInactive: theme === 'light' ? 'text-[#008080] hover:bg-[#b2d8d8] hover:text-[#006666]' : 'text-[#b2d8d8] hover:bg-[#233d4d] hover:text-[#66b2b2]',
    lightThemeCard: 'bg-[#b2d8d8]',
    darkThemeCard: 'bg-[#233d4d]',
    lightThemeContent: 'bg-white',
    darkThemeContent: 'bg-[#1a2c39]',
    lightThemeTitle: 'text-[#006666]',
    darkThemeTitle: 'text-[#b2d8d8]',
  };

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('novaSpendSettings');
    const savedCurrency = localStorage.getItem('novaSpendCurrency');
    const savedStats = localStorage.getItem('novaSpendStats');
    
    if (savedSettings) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...JSON.parse(savedSettings)
      }));
    }
    
    if (savedCurrency) {
      setSettings(prevSettings => ({
        ...prevSettings,
        currency: savedCurrency
      }));
    }

    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setSettings(prevSettings => ({
        ...prevSettings,
        balance: stats.balance.toString(),
        monthlyBudget: stats.monthlyBudget.toString()
      }));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save settings to localStorage
    localStorage.setItem('novaSpendSettings', JSON.stringify(settings));
    localStorage.setItem('novaSpendCurrency', settings.currency);

    // Update stats with new balance and monthly budget
    const savedStats = localStorage.getItem('novaSpendStats');
    const stats = savedStats ? JSON.parse(savedStats) : {
      balance: 0,
      monthlyBudget: 0,
      totalExpenses: 0,
      pending: 0
    };

    stats.balance = Number(settings.balance);
    stats.monthlyBudget = Number(settings.monthlyBudget);
    localStorage.setItem('novaSpendStats', JSON.stringify(stats));

    alert('Settings saved successfully!');
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    // Update local state
    setSettings({ ...settings, theme });
    
    // Update localStorage immediately
    const updatedSettings = { ...settings, theme };
    localStorage.setItem('novaSpendSettings', JSON.stringify(updatedSettings));
    
    // Dispatch custom event to notify App component
    window.dispatchEvent(new Event('themeChange'));
  };

  const handleExport = () => {
    const data = {
      settings: JSON.parse(localStorage.getItem('novaSpendSettings') || '{}'),
      stats: JSON.parse(localStorage.getItem('novaSpendStats') || '{}'),
      transactions: JSON.parse(localStorage.getItem('novaSpendTransactions') || '[]'),
      currency: localStorage.getItem('novaSpendCurrency')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nova-spend-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            
            // Restore all data
            localStorage.setItem('novaSpendSettings', JSON.stringify(data.settings));
            localStorage.setItem('novaSpendStats', JSON.stringify(data.stats));
            localStorage.setItem('novaSpendTransactions', JSON.stringify(data.transactions));
            localStorage.setItem('novaSpendCurrency', data.currency);

            setSettings(prevSettings => ({
              ...prevSettings,
              ...data.settings,
              currency: data.currency
            }));

            // Notify theme change
            window.dispatchEvent(new Event('themeChange'));

            alert('Data imported successfully! Please refresh the page.');
          } catch (error) {
            alert('Error importing data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      // Clear all Nova Spend related data from localStorage
      localStorage.removeItem('novaSpendSettings');
      localStorage.removeItem('novaSpendStats');
      localStorage.removeItem('novaSpendTransactions');
      localStorage.removeItem('novaSpendCurrency');
      
      // Reset state to defaults
      setSettings({
        monthlyBudget: '0',
        balance: '0',
        theme: 'light',
        notifications: true,
        currency: 'INR',
      });
      
      // Trigger theme change to reset UI
      window.dispatchEvent(new Event('themeChange'));
      
      alert('All data has been cleared. The application will now run from scratch.');
      
      // Optionally refresh the page to ensure clean state
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Budget Settings */}
      <form onSubmit={handleSave} className={`${colors.background} rounded-lg p-6 shadow-md transition-colors duration-300`}>
        <h2 className={`text-xl font-semibold ${colors.cardTitle} mb-6 transition-colors duration-300`}>Budget Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="balance" className={`block text-sm font-medium ${colors.cardText} mb-2 transition-colors duration-300`}>
              Current Balance {settings.currency === 'INR' ? '(₹)' : '($)'}
            </label>
            <input
              type="number"
              id="balance"
              value={settings.balance}
              onChange={(e) => setSettings({ ...settings, balance: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${colors.border} ${colors.inputBg} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-[#66b2b2] transition-colors duration-300`}
            />
          </div>

          <div>
            <label htmlFor="monthlyBudget" className={`block text-sm font-medium ${colors.cardText} mb-2 transition-colors duration-300`}>
              Monthly Budget {settings.currency === 'INR' ? '(₹)' : '($)'}
            </label>
            <input
              type="number"
              id="monthlyBudget"
              value={settings.monthlyBudget}
              onChange={(e) => setSettings({ ...settings, monthlyBudget: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${colors.border} ${colors.inputBg} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-[#66b2b2] transition-colors duration-300`}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className={`rounded ${colors.border} text-[#66b2b2] focus:ring-[#66b2b2] transition-colors duration-300`}
              />
              <span className={`text-sm font-medium ${colors.cardText} transition-colors duration-300`}>Enable budget notifications</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className={`mt-6 flex items-center justify-center gap-2 ${colors.button} text-white py-2 px-4 rounded-lg transition-colors duration-300 w-full`}
        >
          <Save size={20} />
          Save Settings
        </button>
      </form>

      {/* Theme Settings */}
      <div className={`${colors.background} rounded-lg p-6 shadow-md transition-colors duration-300`}>
        <div className="flex items-center gap-2 mb-6">
          <Palette size={20} className={colors.cardText} />
          <h2 className={`text-xl font-semibold ${colors.cardTitle} transition-colors duration-300`}>Theme</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Light Theme */}
          <div 
            onClick={() => handleThemeChange('light')}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              settings.theme === 'light' ? colors.selectedBorder : 'border-transparent'
            }`}
          >
            <div className={`${colors.lightThemeCard} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-medium ${colors.lightThemeTitle}`}>Light</h3>
                <Sun size={18} className="text-[#31572c]" />
              </div>
              <div className={`${colors.lightThemeContent} p-3 rounded-lg`}>
                <div className="h-10 bg-[#66b2b2] rounded mb-2"></div>
                <div className="h-6 bg-[#b2d8d8] rounded w-3/4 mb-1"></div>
                <div className="h-6 bg-[#b2d8d8] rounded w-1/2"></div>
              </div>
            </div>
          </div>

          {/* Dark Theme */}
          <div 
            onClick={() => handleThemeChange('dark')}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              settings.theme === 'dark' ? colors.selectedBorder : 'border-transparent'
            }`}
          >
            <div className={`${colors.darkThemeCard} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-medium ${colors.darkThemeTitle}`}>Dark</h3>
                <Moon size={18} className="text-[#b2d8d8]" />
              </div>
              <div className={`${colors.darkThemeContent} p-3 rounded-lg`}>
                <div className="h-10 bg-[#31572c] rounded mb-2"></div>
                <div className="h-6 bg-[#233d4d] rounded w-3/4 mb-1"></div>
                <div className="h-6 bg-[#233d4d] rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Settings */}
      <div className={`${colors.background} rounded-lg p-6 shadow-md transition-colors duration-300`}>
        <h2 className={`text-xl font-semibold ${colors.cardTitle} mb-6 transition-colors duration-300`}>Currency</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setSettings({ ...settings, currency: 'INR' })}
            className={`flex-1 py-2 px-4 rounded-lg border ${colors.border} ${
              settings.currency === 'INR'
                ? `${colors.currencyActive} text-white`
                : colors.currencyInactive
            } transition-colors duration-300`}
          >
            ₹ INR
          </button>
          <button
            onClick={() => setSettings({ ...settings, currency: 'USD' })}
            className={`flex-1 py-2 px-4 rounded-lg border ${colors.border} ${
              settings.currency === 'USD'
                ? `${colors.currencyActive} text-white`
                : colors.currencyInactive
            } transition-colors duration-300`}
          >
            $ USD
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className={`${colors.background} rounded-lg p-6 shadow-md transition-colors duration-300`}>
        <h2 className={`text-xl font-semibold ${colors.cardTitle} mb-6 transition-colors duration-300`}>Data Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleExport}
            className={`flex items-center justify-center gap-2 ${colors.button} text-white py-2 px-4 rounded-lg transition-colors duration-300`}
          >
            <Download size={20} />
            Export Data
          </button>
          <button
            onClick={handleImport}
            className={`flex items-center justify-center gap-2 ${colors.button} text-white py-2 px-4 rounded-lg transition-colors duration-300`}
          >
            <Upload size={20} />
            Import Data
          </button>
          <button
            onClick={handleClearData}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <Trash2 size={20} />
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}