import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Scan, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Receipt, 
  Tag, 
  Package, 
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Percent
} from 'lucide-react';
import { useBarcodeScanner } from '../../utils/useBarcodeScanner';
import { sounds } from '../../utils/sound';
import BarcodeScannerWidget from './BarcodeScannerWidget';
import CheckoutModal from './CheckoutModal';
import ReceiptModal from './ReceiptModal';

export default function POSTerminal({ 
  products, 
  categories, 
  settings, 
  onSaveTransaction,
  onUpdateProductStock,
  onNotifyBarcode
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastCompletedTx, setLastCompletedTx] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [scanAlert, setScanAlert] = useState(null);

  const barcodeInputRef = useRef(null);
  const currency = settings?.currencySymbol || '$';
  const taxRate = settings?.defaultTaxRate ?? 8.0;

  // Auto-focus barcode search on terminal mount if configured
  useEffect(() => {
    if (settings?.autoFocusScanner !== false && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [settings]);

  // Flash scan alert notification
  const triggerScanAlert = (message, type = 'success') => {
    setScanAlert({ message, type });
    setTimeout(() => {
      setScanAlert(null);
    }, 2800);
  };

  // Barcode Handler (Handles both physical USB scanner bursts and virtual simulations)
  const handleBarcodeScanned = (barcodeString) => {
    const cleanCode = barcodeString.trim().toLowerCase();
    if (!cleanCode) return;

    if (onNotifyBarcode) {
      onNotifyBarcode(barcodeString);
    }

    // Lookup product by exact barcode, or exact SKU, or name
    const foundProduct = products.find(
      (p) => p.barcode.toLowerCase() === cleanCode || p.sku.toLowerCase() === cleanCode
    );

    if (foundProduct) {
      addToCart(foundProduct);
      triggerScanAlert(`Scanned: ${foundProduct.name}`, 'success');
      setSearchQuery('');
    } else {
      sounds.playError();
      triggerScanAlert(`Unrecognized barcode / SKU: ${barcodeString}`, 'error');
    }
  };

  // Attach Hardware Scanner hook
  useBarcodeScanner({
    onScan: handleBarcodeScanned,
    enabled: !isCheckoutOpen && !isReceiptOpen,
    maxInterval: settings?.scannerDebounceMs || 45,
  });

  // Add Item to Cart
  const addToCart = (product) => {
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (product.stock <= currentQtyInCart) {
      sounds.playError();
      triggerScanAlert(`Cannot add more "${product.name}". Only ${product.stock} in stock!`, 'error');
      return;
    }

    sounds.playBeep();

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          sku: product.sku,
          price: product.price,
          costPrice: product.costPrice,
          taxRate: product.taxRate ?? taxRate,
          quantity: 1,
          maxStock: product.stock,
          image: product.image
        }
      ]);
    }
  };

  // Update Cart Item Quantity
  const updateQuantity = (productId, delta) => {
    const product = products.find(p => p.id === productId);
    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex === -1) return;

    const currentQty = cart[existingIndex].quantity;
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (product && newQty > product.stock) {
      sounds.playError();
      triggerScanAlert(`Only ${product.stock} available in stock!`, 'error');
      return;
    }

    sounds.playClick();
    const updated = [...cart];
    updated[existingIndex].quantity = newQty;
    setCart(updated);
  };

  // Remove Item
  const removeFromCart = (productId) => {
    sounds.playClick();
    setCart(cart.filter((item) => item.id !== productId));
  };

  // Clear Cart
  const clearCart = () => {
    if (cart.length === 0) return;
    sounds.playClick();
    setCart([]);
    setDiscountPercent(0);
  };

  // Filter products by category and search text
  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate Subtotals & Taxes
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableTotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableTotal * taxRate) / 100;
  const total = taxableTotal + taxAmount;

  // Complete Sale Confirmation
  const handleCompleteSale = ({ customerName, customerPhone, paymentMethod, amountPaid, changeDue }) => {
    const newTransaction = {
      id: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      cashier: 'Main Terminal',
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        barcode: item.barcode,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      subtotal,
      discountAmount,
      taxRate,
      taxAmount,
      total,
      paymentMethod,
      amountPaid,
      changeDue,
      status: 'COMPLETED'
    };

    // 1. Decrement Stock from Storage
    cart.forEach((item) => {
      onUpdateProductStock(item.id, -item.quantity);
    });

    // 2. Save Transaction
    onSaveTransaction(newTransaction);

    // 3. Open Receipt Modal
    setLastCompletedTx(newTransaction);
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);
    setCart([]);
    setDiscountPercent(0);
  };

  return (
    <div className="pos-container">
      {/* Left Column: Catalog & Barcode Scanner */}
      <div className="pos-catalog-panel">
        {/* Barcode Search & Hardware Input */}
        <div className="barcode-action-bar">
          <div className="barcode-input-wrapper">
            <Scan size={18} />
            <input
              ref={barcodeInputRef}
              type="text"
              className="barcode-search-input"
              data-barcode-input="true"
              placeholder="Scan Barcode or Search SKU / Product Name (Press Enter to add)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    handleBarcodeScanned(searchQuery.trim());
                  }
                }
              }}
            />
            <span className="keyboard-badge">F2 / SCAN</span>
          </div>

          {searchQuery && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>

        {/* Real-time Scan Notification Alert */}
        {scanAlert && (
          <div style={{
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: scanAlert.type === 'error' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
            color: scanAlert.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            border: `1px solid ${scanAlert.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            animation: 'fadeIn 0.15s ease'
          }}>
            {scanAlert.type === 'error' ? <AlertCircle size={16} /> : <Sparkles size={16} />}
            <span>{scanAlert.message}</span>
          </div>
        )}

        {/* Quick Barcode Simulator */}
        <BarcodeScannerWidget 
          products={products} 
          onSimulateScan={handleBarcodeScanned} 
        />

        {/* Category Pills Filter */}
        <div className="category-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Product Catalog Grid */}
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Package size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <div>No products found matching "{searchQuery}"</div>
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const isOutOfStock = prod.stock <= 0;
              const isLowStock = prod.stock > 0 && prod.stock <= prod.minStock;

              return (
                <div
                  key={prod.id}
                  className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                  onClick={() => !isOutOfStock && addToCart(prod)}
                >
                  <div className="product-card-img-wrap">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="product-card-img" 
                      loading="lazy" 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span className={`stock-tag ${isOutOfStock ? 'zero' : isLowStock ? 'low' : ''}`}>
                      {isOutOfStock ? 'Out of Stock' : `${prod.stock} in stock`}
                    </span>
                  </div>

                  <h4 className="product-title" title={prod.name}>{prod.name}</h4>
                  
                  <div className="product-barcode-code">
                    <Scan size={11} />
                    <span>{prod.barcode}</span>
                  </div>

                  <div className="product-footer">
                    <span className="product-price">{currency}{prod.price.toFixed(2)}</span>
                    <button 
                      type="button" 
                      className="quick-add-btn" 
                      title="Add to Cart"
                      disabled={isOutOfStock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Cart & Billing */}
      <div className="pos-cart-panel">
        <div className="cart-header">
          <div className="cart-title-wrap">
            <ShoppingBag size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Current Bill</h3>
            <span className="cart-badge">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
          </div>

          {cart.length > 0 && (
            <button 
              className="btn-icon" 
              onClick={clearCart} 
              title="Clear all cart items"
              style={{ color: 'var(--color-danger)' }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Cart Item Rows */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">
                <Scan size={26} />
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Cart is Empty</div>
              <div style={{ fontSize: '0.8rem' }}>Scan a barcode or click any product from the catalog to start billing.</div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-info">
                  <div className="cart-item-name" title={item.name}>{item.name}</div>
                  <div className="cart-item-unit-price">
                    {currency}{item.price.toFixed(2)} / unit &bull; <span style={{ color: 'var(--text-muted)' }}>{item.barcode}</span>
                  </div>
                </div>

                <div className="qty-control">
                  <button 
                    type="button" 
                    className="qty-btn" 
                    onClick={() => updateQuantity(item.id, -1)}
                    title="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="qty-val">{item.quantity}</span>
                  <button 
                    type="button" 
                    className="qty-btn" 
                    onClick={() => updateQuantity(item.id, 1)}
                    title="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="cart-item-total">
                  {currency}{(item.price * item.quantity).toFixed(2)}
                </div>

                <button 
                  type="button" 
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Calculation & Checkout Trigger */}
        <div className="cart-summary-section">
          {/* Quick Discount Pill Buttons */}
          {cart.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Discount (%):</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[0, 5, 10, 15, 20].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`btn ${discountPercent === d ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                    onClick={() => setDiscountPercent(d)}
                  >
                    {d === 0 ? 'None' : `${d}%`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="summary-row">
            <span>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{currency}{subtotal.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="summary-row" style={{ color: 'var(--color-success)' }}>
              <span>Discount ({discountPercent}%)</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>-{currency}{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Tax ({taxRate}%)</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{currency}{taxAmount.toFixed(2)}</span>
          </div>

          <div className="summary-row total-row">
            <span>Total Payable</span>
            <span className="total-amount-highlight">{currency}{total.toFixed(2)}</span>
          </div>

          <button
            type="button"
            className="checkout-action-btn"
            disabled={cart.length === 0}
            onClick={() => {
              sounds.playClick();
              setIsCheckoutOpen(true);
            }}
          >
            <CreditCard size={18} />
            <span>Proceed to Payment ({currency}{total.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        subtotal={subtotal}
        discountAmount={discountAmount}
        taxAmount={taxAmount}
        total={total}
        settings={settings}
        onCompleteSale={handleCompleteSale}
      />

      {/* Thermal Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={lastCompletedTx}
        settings={settings}
        onNewSale={() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }}
      />
    </div>
  );
}
