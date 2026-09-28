import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Printer, 
  Download, 
  Trash2,
  Calendar, 
  User, 
  CreditCard, 
  Banknote, 
  QrCode,
  CheckCircle2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import ReceiptModal from '../pos/ReceiptModal';
import { sounds } from '../../utils/sound';

export default function SalesHistory({ 
  transactions, 
  settings, 
  onDeleteTransaction, 
  onClearTransactions 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState(null);

  const currency = settings?.currencySymbol || 'PKR ';

  const filteredTransactions = transactions.filter((tx) => {
    const matchesPayment = paymentFilter === 'all' || tx.paymentMethod === paymentFilter;
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.customerName && tx.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.customerPhone && tx.customerPhone.includes(searchQuery)) ||
      tx.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPayment && matchesSearch;
  });

  const totalSalesRevenue = transactions.reduce((acc, tx) => acc + tx.total, 0);
  const totalInvoicesCount = transactions.length;

  const handleReprint = (tx) => {
    sounds.playClick();
    setSelectedTx(tx);
    setIsReceiptOpen(true);
  };

  const handleExportCSV = () => {
    sounds.playClick();
    const headers = ['Invoice ID,Timestamp,Customer Name,Phone,Items Count,Subtotal,Discount,Tax,Total,Payment Method,Status'];
    const rows = transactions.map(tx => 
      `"${tx.id}","${tx.timestamp}","${tx.customerName || 'Walk-in'}","${tx.customerPhone || ''}",${tx.items.length},${tx.subtotal},${tx.discountAmount},${tx.taxAmount},${tx.total},"${tx.paymentMethod}","${tx.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Receipt size={24} />
          </div>
          <div>
            <div className="kpi-title">Gross Sales Volume</div>
            <div className="kpi-value">{currency}{totalSalesRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="kpi-title">Completed Invoices</div>
            <div className="kpi-value">{totalInvoicesCount}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>AVG</span>
          </div>
          <div>
            <div className="kpi-title">Average Order Value</div>
            <div className="kpi-value">
              {currency}{totalInvoicesCount > 0 ? (totalSalesRevenue / totalInvoicesCount).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search invoice #, customer name, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Payment Method Filter */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['all', 'Cash', 'Card', 'QR / UPI'].map((m) => (
            <button
              key={m}
              type="button"
              className={`btn ${paymentFilter === m ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => setPaymentFilter(m)}
            >
              {m === 'all' ? 'All Payments' : m}
            </button>
          ))}
        </div>

        {/* Export & Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Export Invoices</span>
          </button>
          {transactions.length > 0 && onClearTransactions && (
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
              onClick={() => {
                if (window.confirm('Are you sure you want to permanently clear ALL sales history and completed invoices? This cannot be undone.')) {
                  sounds.playClick();
                  onClearTransactions();
                }
              }}
              title="Clear all completed sales history"
            >
              <Trash2 size={16} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date &amp; Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total Amount</th>
              <th style={{ textAlign: 'right', minWidth: '175px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Receipt size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <div>No sales invoices found matching the criteria.</div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isExpanded = expandedTxId === tx.id;
                const totalUnits = tx.items.reduce((s, i) => s + i.quantity, 0);

                return (
                  <React.Fragment key={tx.id}>
                    <tr>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ padding: '2px', width: '20px', height: '20px' }}
                            onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818cf8' }}>
                            {tx.id}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{tx.customerName || 'Walk-in Customer'}</div>
                        {tx.customerPhone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.customerPhone}</div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                          {tx.items.length} line items ({totalUnits} pcs)
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-info">
                          {tx.paymentMethod}
                        </span>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.05rem' }}>
                        {currency}{tx.total.toFixed(2)}
                      </td>

                      <td style={{ textAlign: 'right', minWidth: '175px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', gap: '0.3rem' }}
                            onClick={() => handleReprint(tx)}
                            title="View & Print Receipt"
                          >
                            <Printer size={13} />
                            <span>Receipt</span>
                          </button>
                          {onDeleteTransaction && (
                            <button
                              type="button"
                              className="table-action-btn-danger"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete invoice ${tx.id}? This cannot be undone.`)) {
                                  sounds.playClick();
                                  onDeleteTransaction(tx.id);
                                }
                              }}
                              title="Delete this invoice"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Line Items Preview */}
                    {isExpanded && (
                      <tr style={{ background: 'rgba(99, 102, 241, 0.04)' }}>
                        <td colSpan="7" style={{ padding: '0.75rem 1.5rem 1.25rem 3.5rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Invoice Item Breakdown:
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                            {tx.items.map((it, idx) => (
                              <div 
                                key={idx} 
                                style={{ 
                                  background: 'var(--bg-card)', 
                                  border: '1px solid var(--border-subtle)', 
                                  borderRadius: 'var(--radius-md)', 
                                  padding: '0.5rem 0.75rem',
                                  fontSize: '0.8rem' 
                                }}
                              >
                                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {it.name}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                                  <span>{it.quantity} x {currency}{it.price.toFixed(2)}</span>
                                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currency}{(it.price * it.quantity).toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal for Invoices */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={selectedTx}
        settings={settings}
      />
    </div>
  );
}
