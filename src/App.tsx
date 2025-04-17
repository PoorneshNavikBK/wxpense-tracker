import React, { useState, useEffect, createContext } from 'react';
import { PlusCircle, Wallet, PieChart, Settings } from 'lucide-react';
import { ExpenseForm } from './components/ExpenseForm';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { SettingsPanel } from './components/SettingsPanel';

type Tab = 'dashboard' | 'add' | 'analytics' | 'settings';
type Theme = 'light' | 'dark';

// Create Theme Context
export const ThemeContext = createContext<Theme>('light');

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [theme, setTheme] = useState<Theme>('light');

  // Load theme from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('novaSpendSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.theme === 'dark' || settings.theme === 'light') {
        setTheme(settings.theme);
      }
    }

    // Listen for theme changes
    const handleStorageChange = () => {
      const updatedSettings = localStorage.getItem('novaSpendSettings');
      if (updatedSettings) {
        const settings = JSON.parse(updatedSettings);
        if (settings.theme === 'dark' || settings.theme === 'light') {
          setTheme(settings.theme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleStorageChange);
    };
  }, []);

  // Define theme colors based on current theme
  const themeColors = {
    background: theme === 'light' ? 'bg-[#b2d8d8]' : 'bg-[#233d4d]',
    header: theme === 'light' ? 'bg-[#66b2b2]' : 'bg-[#1a2c39]',
    headerText: theme === 'light' ? 'text-[#004c4c]' : 'text-[#b2d8d8]',
    content: theme === 'light' ? 'bg-white' : 'bg-[#1a2c39]',
    navBorder: theme === 'light' ? 'border-[#004c4c]' : 'border-[#66b2b2]',
    buttonText: theme === 'light' ? 'text-[#008080]' : 'text-[#b2d8d8]',
    buttonHover: theme === 'light' ? 'hover:bg-[#b2d8d8]' : 'hover:bg-[#233d4d]',
    activeButton: theme === 'light' ? 'bg-[#008080]' : 'bg-[#31572c]',
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div className={`min-h-screen ${themeColors.background} transition-colors duration-300`}>
        {/* Header */}
        <header className={`${themeColors.header} shadow-lg transition-colors duration-300`}>
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-4xl font-serif text-white text-center">Nova Spend</h1>
            <p className={`text-center ${themeColors.headerText} mt-2 font-light transition-colors duration-300`}>Track smarter. Spend better.</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className={`${themeColors.content} rounded-lg shadow-xl p-6 transition-colors duration-300`}>
            {/* Navigation */}
            <nav className={`flex flex-col sm:flex-row justify-between items-center mb-8 border-b ${themeColors.navBorder} pb-4 transition-colors duration-300 gap-2`}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto ${
                  activeTab === 'dashboard' ? `${themeColors.activeButton} text-white` : `${themeColors.buttonText} ${themeColors.buttonHover}`
                }`}
              >
                <Wallet size={20} /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto ${
                  activeTab === 'add' ? `${themeColors.activeButton} text-white` : `${themeColors.buttonText} ${themeColors.buttonHover}`
                }`}
              >
                <PlusCircle size={20} /> Add Expense
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto ${
                  activeTab === 'analytics' ? `${themeColors.activeButton} text-white` : `${themeColors.buttonText} ${themeColors.buttonHover}`
                }`}
              >
                <PieChart size={20} /> Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto ${
                  activeTab === 'settings' ? `${themeColors.activeButton} text-white` : `${themeColors.buttonText} ${themeColors.buttonHover}`
                }`}
              >
                <Settings size={20} /> Settings
              </button>
            </nav>

            {/* Content */}
            <div className="mt-6">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'add' && <ExpenseForm />}
              {activeTab === 'analytics' && <Analytics />}
              {activeTab === 'settings' && <SettingsPanel />}
            </div>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;