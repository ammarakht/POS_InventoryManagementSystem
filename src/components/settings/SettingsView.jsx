import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Printer, 
  Scan, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { sounds } from '../../utils/sound';

export default function SettingsView({ settings, onSaveSettings, onResetAll }) {
  const [formData, setFormData] = useState(settings || {});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    sounds.playSuccess();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportAll = () => {
    sounds.playClick();
    const allData = {
      timestamp: new Date().toISOString(),
      settings: formData,
      products: JSON.parse(localStorage.getItem('apex_pos_products_v1') || '[]'),
      transactions: JSON.parse(localStorage.getItem('apex_pos_transactions_v1') || '[]'),
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `apexpos_full_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportAll = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.products) localStorage.setItem('apex_pos_products_v1', JSON.stringify(parsed.products));
        if (parsed.transactions) localStorage.setItem('apex_pos_transactions_v1', JSON.stringify(parsed.transactions));
        if (parsed.settings) {
          localStorage.setItem('apex_pos_settings_v1', JSON.stringify(parsed.settings));
          setFormData(parsed.settings);
        }
        sounds.playSuccess();
        alert('Data backup successfully restored! Reloading application...');
        window.location.reload();
      } catch (err) {
        sounds.playError();
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Save Bar */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>System Configuration</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customize your store branding, barcode scanner timings, and thermal printer.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {savedSuccess && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>
                <Check size={16} /> Saved!
              </span>
            )}
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        {/* Store Profile Section */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Store size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>Store Profile &amp; Receipt Header</span>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Store / Business Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.storeName || ''}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tax ID / Business Registration</label>
              <input
                type="text"
                className="form-input"
                value={formData.taxId || ''}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Physical Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.storeAddress || ''}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Support Phone</label>
              <input
                type="text"
                className="form-input"
                value={formData.storePhone || ''}
                onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Section */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--color-success)' }} />
            <span>Currency &amp; Tax Policy</span>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <select
                className="form-select"
                value={formData.currencySymbol || '$'}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              >
                <option value="$">$ (USD / AUD / CAD)</option>
                <option value="₹">₹ (INR)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="¥">¥ (JPY / CNY)</option>
                <option value="AED ">AED (Dirham)</option>
                <option value="SAR ">SAR (Riyal)</option>
                <option value="₱">₱ (PHP)</option>
                <option value="R$ ">R$ (BRL)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default Tax / VAT / GST (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="form-input"
                value={formData.defaultTaxRate ?? 8}
                onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Receipt Paper Width</label>
              <select
                className="form-select"
                value={formData.paperWidth || '80mm'}
                onChange={(e) => setFormData({ ...formData, paperWidth: e.target.value })}
              >
                <option value="80mm">Standard POS Thermal (80mm)</option>
                <option value="58mm">Compact Mobile Thermal (58mm)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hardware Barcode Scanner Engine */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Scan size={18} style={{ color: 'var(--accent-secondary)' }} />
            <span>Hardware Barcode Scanner Tuning</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            These parameters ensure hand-held USB/Bluetooth barcode guns don't cause accidental bill generation on Enter or miss characters.
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Scanner Keystroke Burst Window (ms)</label>
              <input
                type="number"
                min="10"
                max="120"
                className="form-input"
                value={formData.scannerDebounceMs ?? 40}
                onChange={(e) => setFormData({ ...formData, scannerDebounceMs: parseInt(e.target.value, 10) || 40 })}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Default 40ms detects barcode scanners and ignores human typing.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Thermal Receipt Footer Note</label>
              <input
                type="text"
                className="form-input"
                value={formData.receiptFooter || ''}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Backup & System Reset */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Zap size={18} style={{ color: 'var(--color-warning)' }} />
            <span>Data Persistence &amp; Backup</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={handleExportAll}>
              <Download size={16} />
              <span>Export Full JSON Backup</span>
            </button>

            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} />
              <span>Restore from JSON</span>
              <input type="file" accept=".json" onChange={handleImportAll} style={{ display: 'none' }} />
            </label>

            <button
              type="button"
              className="btn btn-danger"
              style={{ marginLeft: 'auto' }}
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all products, stock, and sales to default demo data?')) {
                  sounds.playClick();
                  onResetAll();
                }
              }}
            >
              <RotateCcw size={16} />
              <span>Reset Demo Catalog</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
