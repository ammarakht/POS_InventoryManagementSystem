import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  User, 
  Phone, 
  X, 
  Check, 
  Receipt,
  Percent,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cart, 
  subtotal, 
  discountAmount, 
  taxAmount, 
  total, 
  settings, 
  onCompleteSale 
}) {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const currency = settings?.currencySymbol || 'PKR ';

  // Quick cash tender options (calibrated for PKR note denominations: 50, 100, 500, 1000, 5000)
  const tenderOptions = [
    Math.ceil(total),
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
    Math.ceil(total / 1000) * 1000,
    5000
  ].filter((v, idx, arr) => v >= total && arr.indexOf(v) === idx).slice(0, 5);

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(total.toFixed(2));
      setPaymentMethod('Cash');
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const numericPaid = parseFloat(amountPaid) || 0;
  const changeDue = Math.max(0, numericPaid - total);
  const isPaidSufficient = paymentMethod !== 'Cash' || numericPaid >= total - 0.01;

  const handleTenderSelect = (val) => {
    setAmountPaid(val.toString());
    sounds.playClick();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPaidSufficient) {
      sounds.playError();
      return;
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}

    sounds.playSuccess();

    onCompleteSale({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      paymentMethod,
      amountPaid: paymentMethod === 'Cash' ? numericPaid : total,
      changeDue: paymentMethod === 'Cash' ? changeDue : 0,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3>Complete Checkout &amp; Generate Bill</h3>
          </div>
          <button className="btn-icon" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {/* Total Highlight Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Bill Amount
                </span>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {currency}{total.toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div>{cart.length} unique items ({cart.reduce((sum, item) => sum + item.quantity, 0)} units)</div>
                <div>Tax included ({settings?.defaultTaxRate || 8}%)</div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="form-group">
              <label className="form-label">Select Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[
                  { id: 'Cash', label: 'Cash', icon: Banknote },
                  { id: 'Card', label: 'Debit/Credit', icon: CreditCard },
                  { id: 'QR / UPI', label: 'QR / UPI', icon: QrCode },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}
                      onClick={() => {
                        setPaymentMethod(pm.id);
                        sounds.playClick();
                      }}
                    >
                      <Icon size={20} />
                      <span style={{ fontSize: '0.8rem' }}>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Payment Tender & Change */}
            {paymentMethod === 'Cash' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Amount Tendered ({currency})</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="form-input"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Change to Return</label>
                    <div style={{
                      padding: '0.65rem 0.9rem',
                      background: changeDue > 0 ? 'var(--color-success-bg)' : 'var(--bg-input)',
                      border: `1px solid ${changeDue > 0 ? 'var(--color-success)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: changeDue > 0 ? 'var(--color-success)' : 'var(--text-primary)'
                    }}>
                      {currency}{changeDue.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quick Cash Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Exact/Quick:</span>
                  {tenderOptions.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                      onClick={() => handleTenderSelect(amt)}
                    >
                      {currency}{amt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={14} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.2rem' }}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone / Loyalty #</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.2rem' }}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 555-0199"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-success" 
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
              disabled={!isPaidSufficient}
            >
              <Check size={18} />
              <span>Confirm &amp; Generate Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
