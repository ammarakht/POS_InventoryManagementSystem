import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Check, AlertCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';

export default function StockAdjustmentModal({ isOpen, onClose, product, onAdjustStock, currency = 'PKR ' }) {
  const [adjustmentType, setAdjustmentType] = useState('add'); // 'add' or 'remove' or 'set'
  const [quantity, setQuantity] = useState(10);
  const [reason, setReason] = useState('Restock / Supplier Delivery');

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    let delta = qty;
    if (adjustmentType === 'remove') delta = -qty;
    if (adjustmentType === 'set') delta = qty - product.stock;

    sounds.playClick();
    onAdjustStock(product.id, delta);
    onClose();
  };

  const newStockPreview = 
    adjustmentType === 'add' ? product.stock + (parseInt(quantity, 10) || 0) :
    adjustmentType === 'remove' ? Math.max(0, product.stock - (parseInt(quantity, 10) || 0)) :
    parseInt(quantity, 10) || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Adjust Stock Inventory</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.name}</span>
          </div>
          <button className="btn-icon" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current Stock Level</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {product.stock} {product.unit || 'Units'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Updated Stock</span>
                <div style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 700, 
                  fontFamily: 'var(--font-mono)',
                  color: newStockPreview <= product.minStock ? 'var(--color-warning)' : 'var(--color-success)'
                }}>
                  {newStockPreview} {product.unit || 'Units'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adjustment Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn ${adjustmentType === 'add' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setAdjustmentType('add')}
                >
                  <ArrowUpRight size={16} />
                  <span>Restock (+)</span>
                </button>
                <button
                  type="button"
                  className={`btn ${adjustmentType === 'remove' ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => setAdjustmentType('remove')}
                >
                  <ArrowDownRight size={16} />
                  <span>Deduct (-)</span>
                </button>
                <button
                  type="button"
                  className={`btn ${adjustmentType === 'set' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setAdjustmentType('set')}
                >
                  <span>Set Exact</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {adjustmentType === 'set' ? 'New Exact Quantity' : 'Quantity to Adjust'}
              </label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Reference Note</label>
              <select 
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="Restock / Supplier Delivery">Restock / Supplier Delivery</option>
                <option value="Physical Inventory Audit">Physical Inventory Audit / Count Correction</option>
                <option value="Damaged / Expired Goods">Damaged / Expired Goods</option>
                <option value="Customer Return to Stock">Customer Return to Stock</option>
                <option value="Internal Store Usage">Internal Store Usage / Demonstration</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <Check size={16} />
              <span>Update Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
