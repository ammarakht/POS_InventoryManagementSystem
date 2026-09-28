import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  Download, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Barcode,
  Layers
} from 'lucide-react';
import ProductModal from './ProductModal';
import StockAdjustmentModal from './StockAdjustmentModal';
import { sounds } from '../../utils/sound';

export default function InventoryList({ 
  products, 
  categories, 
  settings, 
  onSaveProduct, 
  onDeleteProduct, 
  onAdjustStock 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all', 'low', 'out'
  const [productToEdit, setProductToEdit] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const currency = settings?.currencySymbol || 'PKR ';

  // Filters
  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.supplier && prod.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesStatus = true;
    if (stockStatusFilter === 'low') {
      matchesStatus = prod.stock > 0 && prod.stock <= prod.minStock;
    } else if (stockStatusFilter === 'out') {
      matchesStatus = prod.stock <= 0;
    }

    return matchesCat && matchesSearch && matchesStatus;
  });

  // Export CSV
  const handleExportCSV = () => {
    sounds.playClick();
    const headers = ['ID,Name,Barcode,SKU,Category,Cost Price,Selling Price,Stock,Min Stock,Supplier'];
    const rows = products.map(p => 
      `"${p.id}","${p.name.replace(/"/g, '""')}","${p.barcode}","${p.sku}","${p.category}",${p.costPrice},${p.price},${p.stock},${p.minStock},"${p.supplier || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCostValuation = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockItems = products.filter(p => p.stock <= 0).length;

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Metrics Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <Package size={24} />
          </div>
          <div>
            <div className="kpi-title">Total Products</div>
            <div className="kpi-value">{products.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKUs</span></div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="kpi-title">Total Stock Units</div>
            <div className="kpi-value">{totalStockUnits}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currency}</span>
          </div>
          <div>
            <div className="kpi-title">Retail Valuation</div>
            <div className="kpi-value">{currency}{totalRetailValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: lowStockItems > 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #64748b, #475569)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="kpi-title">Stock Attention</div>
            <div className="kpi-value" style={{ color: lowStockItems > 0 ? 'var(--color-warning)' : 'inherit' }}>
              {lowStockItems} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low / {outOfStockItems} Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Action Bar */}
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
            placeholder="Search by product name, barcode, SKU, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Status Filter Chips */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            className={`btn ${stockStatusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => setStockStatusFilter('all')}
          >
            All ({products.length})
          </button>
          <button
            type="button"
            className={`btn ${stockStatusFilter === 'low' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => setStockStatusFilter('low')}
          >
            Low Stock ({lowStockItems})
          </button>
          <button
            type="button"
            className={`btn ${stockStatusFilter === 'out' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => setStockStatusFilter('out')}
          >
            Out of Stock ({outOfStockItems})
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV} title="Export inventory as CSV">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Inventory Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU &amp; Barcode</th>
              <th>Category</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock Level</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Package size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <div>No inventory items match your search filters.</div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= prod.minStock;

                return (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={prod.image} 
                          alt="" 
                          style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', objectFit: 'cover', background: 'var(--bg-input)' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='1.5'%3E%3Crect width='18' height='18' x='3' y='3' rx='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{prod.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.supplier || 'No supplier'}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>{prod.sku}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Barcode size={12} /> {prod.barcode}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                        {prod.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {currency}{prod.costPrice.toFixed(2)}
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818cf8' }}>
                      {currency}{prod.price.toFixed(2)}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem' }}>
                          {prod.stock}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.unit || 'units'}</span>
                      </div>
                    </td>

                    <td>
                      {isOutOfStock ? (
                        <span className="badge badge-danger">
                          <XCircle size={12} /> Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="badge badge-warning">
                          <AlertTriangle size={12} /> Low Stock (≤{prod.minStock})
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Healthy
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setProductToAdjust(prod);
                            setIsAdjustModalOpen(true);
                          }}
                          title="Restock or Adjust Inventory"
                        >
                          <ArrowUpDown size={14} />
                          <span>Adjust</span>
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ padding: '0.35rem' }}
                          onClick={() => {
                            setProductToEdit(prod);
                            setIsProductModalOpen(true);
                          }}
                          title="Edit product details"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ padding: '0.35rem', color: 'var(--color-danger)' }}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                              sounds.playClick();
                              onDeleteProduct(prod.id);
                            }
                          }}
                          title="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        categories={categories}
        onSaveProduct={onSaveProduct}
        currency={currency}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        product={productToAdjust}
        onAdjustStock={onAdjustStock}
        currency={currency}
      />
    </div>
  );
}
