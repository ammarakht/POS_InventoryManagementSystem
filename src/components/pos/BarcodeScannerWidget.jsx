import React, { useState } from 'react';
import { Scan, Zap, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';

export default function BarcodeScannerWidget({ products, onSimulateScan }) {
  const [selectedBarcode, setSelectedBarcode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showHelper, setShowHelper] = useState(false);

  const handleQuickSimulate = (barcode) => {
    if (!barcode) return;
    onSimulateScan(barcode);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSimulateScan(customInput.trim());
    setCustomInput('');
  };

  return (
    <div style={{
      background: 'rgba(99, 102, 241, 0.08)',
      border: '1px solid rgba(99, 102, 241, 0.25)',
      borderRadius: 'var(--radius-lg)',
      padding: '0.75rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>
          <Zap size={16} />
          <span>Hardware &amp; Virtual Barcode Trigger</span>
        </div>
        <button 
          type="button" 
          onClick={() => setShowHelper(!showHelper)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
        >
          <HelpCircle size={14} />
          <span>{showHelper ? 'Hide Tips' : 'Scanner Guide'}</span>
        </button>
      </div>

      {showHelper && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <strong>How ApexPOS handles Barcode Scanners reliably:</strong>
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <li>Physical USB/Bluetooth scanners fire fast bursts + Enter. ApexPOS buffers and matches items without prematurely triggering checkout!</li>
            <li>No form auto-submission bugs: items are appended cleanly with instant audio feedback.</li>
            <li>You can also click any of the quick-scan chips below to test instantaneous recognition.</li>
          </ul>
        </div>
      )}

      {/* Quick Test Barcode Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Test Scans:</span>
        {products.slice(0, 5).map((prod) => (
          <button
            key={prod.id}
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
            onClick={() => handleQuickSimulate(prod.barcode)}
            title={`Scan ${prod.name} (${prod.barcode})`}
          >
            <Scan size={12} style={{ color: 'var(--accent-primary)' }} />
            <span>{prod.name.split(' ')[0]}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              ..{prod.barcode.slice(-4)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
