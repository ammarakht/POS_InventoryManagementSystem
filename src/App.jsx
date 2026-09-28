import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import POSTerminal from './components/pos/POSTerminal';
import InventoryList from './components/inventory/InventoryList';
import SalesHistory from './components/sales/SalesHistory';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import SettingsView from './components/settings/SettingsView';
import ProductModal from './components/inventory/ProductModal';
import { storage, DEFAULT_CATEGORIES } from './utils/storage';

export default function App() {
  const [activeView, setActiveView] = useState('pos');
  const [theme, setTheme] = useState(() => localStorage.getItem('apex_pos_theme') || 'dark');
  const [products, setProducts] = useState(() => storage.getProducts());
  const [transactions, setTransactions] = useState(() => storage.getTransactions());
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [categories] = useState(DEFAULT_CATEGORIES);
  const [lastScannedBarcode, setLastScannedBarcode] = useState(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('apex_pos_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Product Actions
  const handleSaveProduct = (product) => {
    const existingIndex = products.findIndex(p => p.id === product.id);
    let updated;
    if (existingIndex > -1) {
      updated = [...products];
      updated[existingIndex] = product;
    } else {
      updated = [product, ...products];
    }
    setProducts(updated);
    storage.saveProducts(updated);
  };

  const handleDeleteProduct = (productId) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    storage.saveProducts(updated);
  };

  const handleAdjustStock = (productId, delta) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock };
      }
      return p;
    });
    setProducts(updated);
    storage.saveProducts(updated);
  };

  // Transaction Actions
  const handleSaveTransaction = (tx) => {
    const updated = [tx, ...transactions];
    setTransactions(updated);
    storage.saveTransactions(updated);
  };

  // Settings Actions
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const handleResetAll = () => {
    storage.resetAll();
    setProducts(storage.getProducts());
    setTransactions(storage.getTransactions());
    setSettings(storage.getSettings());
  };

  // Count low stock items for badge
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        lowStockCount={lowStockCount}
      />

      {/* Main Content Viewport */}
      <div className="app-main">
        <Navbar
          activeView={activeView}
          theme={theme}
          onToggleTheme={toggleTheme}
          settings={settings}
          onOpenNewProduct={() => setIsNewProductModalOpen(true)}
          lastScannedBarcode={lastScannedBarcode}
        />

        {activeView === 'pos' && (
          <POSTerminal
            products={products}
            categories={categories}
            settings={settings}
            onSaveTransaction={handleSaveTransaction}
            onUpdateProductStock={handleAdjustStock}
            onNotifyBarcode={(code) => setLastScannedBarcode(code)}
          />
        )}

        {activeView === 'inventory' && (
          <InventoryList
            products={products}
            categories={categories}
            settings={settings}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {activeView === 'sales' && (
          <SalesHistory
            transactions={transactions}
            settings={settings}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsDashboard
            products={products}
            transactions={transactions}
            categories={categories}
            settings={settings}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetAll={handleResetAll}
          />
        )}

        {/* Global Add Product Modal */}
        <ProductModal
          isOpen={isNewProductModalOpen}
          onClose={() => setIsNewProductModalOpen(false)}
          productToEdit={null}
          categories={categories}
          onSaveProduct={handleSaveProduct}
          currency={settings?.currencySymbol || 'PKR '}
        />
      </div>
    </div>
  );
}
