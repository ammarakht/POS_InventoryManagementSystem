import React, { useRef } from 'react';
import { Printer, Check, X, ArrowRight, Share2 } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, transaction, settings, onNewSale }) {
  const receiptRef = useRef(null);

  if (!isOpen || !transaction) return null;

  const currency = settings?.currencySymbol || 'PKR ';
  const paperWidth = settings?.paperWidth || '80mm';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} style={{ color: 'var(--color-success)' }} />
            <h3>Receipt #{transaction.id}</h3>
          </div>
          <button className="btn-icon" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ background: 'var(--bg-app)', padding: '1rem' }}>
          {/* Printable Thermal Receipt Box */}
          <div 
            ref={receiptRef}
            className="receipt-wrapper" 
            style={{ width: paperWidth === '58mm' ? '240px' : '300px' }}
          >
            <div className="receipt-header-text">
              <div className="receipt-store-title">{settings?.storeName || 'APEX RETAIL STORE'}</div>
              <div>{settings?.storeAddress || 'Main Commercial District'}</div>
              <div>Tel: {settings?.storePhone || '+1 555-0100'}</div>
              <div>GST / Tax ID: {settings?.taxId || 'TAX-992014'}</div>
            </div>

            <hr className="receipt-divider" />

            <div className="receipt-row">
              <span>INV #: {transaction.id}</span>
              <span>{new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="receipt-row">
              <span>Date: {new Date(transaction.timestamp).toLocaleDateString()}</span>
              <span>Cashier: {transaction.cashier}</span>
            </div>
            {transaction.customerName && transaction.customerName !== 'Walk-in Customer' && (
              <div className="receipt-row">
                <span>Customer: {transaction.customerName}</span>
              </div>
            )}

            <hr className="receipt-divider" />

            {/* Line Items */}
            <div style={{ margin: '0.5rem 0' }}>
              <div className="receipt-row bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                <span>Item</span>
                <span>Qty x Price</span>
                <span>Total</span>
              </div>
              <hr className="receipt-divider" style={{ margin: '3px 0' }} />

              {transaction.items.map((it, idx) => (
                <div key={idx} style={{ margin: '4px 0' }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {it.name}
                  </div>
                  <div className="receipt-row" style={{ color: '#444', fontSize: '11px' }}>
                    <span>{it.quantity} @ {currency}{it.price.toFixed(2)}</span>
                    <span className="bold">{currency}{(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <hr className="receipt-divider" />

            <div className="receipt-row">
              <span>Subtotal:</span>
              <span>{currency}{transaction.subtotal.toFixed(2)}</span>
            </div>
            {transaction.discountAmount > 0 && (
              <div className="receipt-row">
                <span>Discount:</span>
                <span>-{currency}{transaction.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="receipt-row">
              <span>Tax ({transaction.taxRate}%):</span>
              <span>{currency}{transaction.taxAmount.toFixed(2)}</span>
            </div>

            <div className="receipt-row receipt-total-large">
              <span>TOTAL DUE:</span>
              <span>{currency}{transaction.total.toFixed(2)}</span>
            </div>

            <div className="receipt-row">
              <span>Payment Mode:</span>
              <span className="bold">{transaction.paymentMethod}</span>
            </div>
            {transaction.paymentMethod === 'Cash' && (
              <>
                <div className="receipt-row">
                  <span>Cash Paid:</span>
                  <span>{currency}{transaction.amountPaid.toFixed(2)}</span>
                </div>
                <div className="receipt-row">
                  <span>Change Due:</span>
                  <span className="bold">{currency}{transaction.changeDue.toFixed(2)}</span>
                </div>
              </>
            )}

            <hr className="receipt-divider" />

            <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '0.5rem' }}>
              <p>{settings?.receiptHeader || 'Thank you for your visit!'}</p>
              <p style={{ marginTop: '2px', color: '#666' }}>{settings?.receiptFooter || 'Exchange within 14 days.'}</p>
            </div>

            <div className="receipt-barcode-visual">
              ||||| | |||| ||| || ||||| ||| |||
              <div style={{ fontSize: '9px', letterSpacing: '0.1em' }}>{transaction.id}</div>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => {
              onClose();
              if (onNewSale) onNewSale();
            }}
          >
            <span>Next Order</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
