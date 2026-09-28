import React, { useState, useEffect } from 'react';
import { X, Check, Barcode, Wand2, Package, Tag, DollarSign, Image } from 'lucide-react';
import { sounds } from '../../utils/sound';

export default function ProductModal({ isOpen, onClose, productToEdit, categories, onSaveProduct, currency = 'PKR ' }) {
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    sku: '',
    category: 'groceries',
    costPrice: 0,
    price: 0,
    stock: 0,
    minStock: 5,
    unit: 'Unit',
    supplier: '',
    image: '',
    description: '',
    taxRate: 8
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      // Auto-generate fresh random barcode and SKU for new item
      const randomBarcode = '890' + Math.floor(1000000000 + Math.random() * 9000000000);
      const randomSku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
      setFormData({
        name: '',
        barcode: randomBarcode,
        sku: randomSku,
        category: categories[1]?.id || 'groceries',
        costPrice: 500,
        price: 850,
        stock: 25,
        minStock: 5,
        unit: 'Unit',
        supplier: 'Default Vendor',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
        description: '',
        taxRate: 8
      });
    }
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const generateNewBarcode = () => {
    sounds.playClick();
    const newBarcode = '890' + Math.floor(1000000000 + Math.random() * 9000000000);
    setFormData((prev) => ({ ...prev, barcode: newBarcode }));
  };

  const generateNewSku = () => {
    sounds.playClick();
    const prefix = formData.category.slice(0, 3).toUpperCase();
    const newSku = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
    setFormData((prev) => ({ ...prev, sku: newSku }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.barcode.trim()) {
      sounds.playError();
      return;
    }

    const payload = {
      ...formData,
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      costPrice: parseFloat(formData.costPrice) || 0,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      minStock: parseInt(formData.minStock, 10) || 0,
      taxRate: parseFloat(formData.taxRate) || 0,
    };

    sounds.playSuccess();
    onSaveProduct(payload);
    onClose();
  };

  const profitMargin = formData.price > 0 ? (((formData.price - formData.costPrice) / formData.price) * 100).toFixed(1) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3>{productToEdit ? 'Edit Product Item' : 'Add New Inventory Product'}</h3>
          </div>
          <button className="btn-icon" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wireless Gaming Mouse"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.filter(c => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Barcode & SKU Row */}
            <div className="form-grid-2">
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Barcode (UPC / EAN / Code128) *</label>
                  <button 
                    type="button" 
                    onClick={generateNewBarcode} 
                    style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Wand2 size={12} /> Auto Gen
                  </button>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Barcode size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.2rem', fontFamily: 'var(--font-mono)' }}
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">SKU Identifier</label>
                  <button 
                    type="button" 
                    onClick={generateNewSku} 
                    style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Wand2 size={12} /> Auto Gen
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>

            {/* Pricing & Margins */}
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Cost Price ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Selling Price ({currency}) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profit Margin</label>
                <div style={{
                  padding: '0.65rem 0.9rem',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: profitMargin > 0 ? 'var(--color-success)' : 'var(--text-muted)'
                }}>
                  {profitMargin}%
                </div>
              </div>
            </div>

            {/* Stock Quantities */}
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Initial Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit Type</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g. Unit, Pack, Bottle"
                />
              </div>
            </div>

            {/* Supplier & Image URL */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Supplier / Vendor</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="e.g. Acme Supplies Inc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{productToEdit ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
