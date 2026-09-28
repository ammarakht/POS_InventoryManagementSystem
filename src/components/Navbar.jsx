import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Scan, 
  Clock, 
  Store,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';
import { sounds } from '../utils/sound';

export default function Navbar({ 
  activeView, 
  theme, 
  onToggleTheme, 
  settings, 
  onOpenNewProduct,
  lastScannedBarcode
}) {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [soundEnabled, setSoundEnabled] = useState(settings?.enableSound ?? true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playBeep();
  };

  const getTitle = () => {
    switch (activeView) {
      case 'pos': return 'Point of Sale (POS) Terminal';
      case 'inventory': return 'Inventory & Stock Management';
      case 'sales': return 'Sales Transactions & Invoices';
      case 'analytics': return 'Analytics & Business Insights';
      case 'settings': return 'Store & Hardware Configuration';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="top-navbar no-print">
      <div className="navbar-left">
        <div className="view-title-wrap">
          <h1>{getTitle()}</h1>
          <div className="view-subtitle">{settings?.storeName || 'Apex Retail Store'}</div>
        </div>

        <div className="scanner-status-indicator" title="Hardware Scanner Ready. Scans will instantly register.">
          <div className="status-dot"></div>
          <Scan size={14} style={{ color: 'var(--color-success)' }} />
          <span>Scanner Ready</span>
          {lastScannedBarcode && (
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              [{lastScannedBarcode}]
            </span>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {activeView === 'inventory' && (
          <button className="btn btn-primary" onClick={onOpenNewProduct}>
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0 0.5rem' }}>
          <Clock size={14} />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{time}</span>
        </div>

        <button 
          className="btn-icon" 
          onClick={toggleSound}
          title={soundEnabled ? "Audio FX Enabled" : "Audio FX Muted"}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} style={{ color: 'var(--color-danger)' }} />}
        </button>

        <button 
          className="btn-icon" 
          onClick={onToggleTheme}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
