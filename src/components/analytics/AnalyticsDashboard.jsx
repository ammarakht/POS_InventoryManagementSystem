import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  AlertTriangle,
  Award,
  PieChart,
  BarChart2
} from 'lucide-react';

export default function AnalyticsDashboard({ products, transactions, categories, settings }) {
  const currency = settings?.currencySymbol || 'PKR ';

  // Metrics
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalOrders = transactions.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalItemsSold = transactions.reduce(
    (sum, tx) => sum + tx.items.reduce((s, i) => s + i.quantity, 0), 
    0
  );

  // Top Selling Items
  const itemSalesMap = {};
  transactions.forEach((tx) => {
    tx.items.forEach((item) => {
      if (!itemSalesMap[item.name]) {
        itemSalesMap[item.name] = { name: item.name, quantity: 0, revenue: 0, barcode: item.barcode };
      }
      itemSalesMap[item.name].quantity += item.quantity;
      itemSalesMap[item.name].revenue += item.price * item.quantity;
    });
  });

  const topSellingItems = Object.values(itemSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Payment Breakdown
  const paymentBreakdown = transactions.reduce((acc, tx) => {
    acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + tx.total;
    return acc;
  }, {});

  // Category Inventory Count
  const categoryStockMap = {};
  products.forEach((prod) => {
    categoryStockMap[prod.category] = (categoryStockMap[prod.category] || 0) + prod.stock;
  });

  // Stock health counts
  const healthyCount = products.filter(p => p.stock > p.minStock).length;
  const lowCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outCount = products.filter(p => p.stock <= 0).length;

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Top Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="kpi-title">Total Sales Revenue</div>
            <div className="kpi-value">{currency}{totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="kpi-title">Total Transactions</div>
            <div className="kpi-value">{totalOrders} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bills</span></div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="kpi-title">Avg. Ticket Size</div>
            <div className="kpi-value">{currency}{avgOrderValue.toFixed(2)}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <Package size={24} />
          </div>
          <div>
            <div className="kpi-title">Units Sold</div>
            <div className="kpi-value">{totalItemsSold} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pcs</span></div>
          </div>
        </div>
      </div>

      {/* Main Analysis Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* Top Selling Products */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem' }}>
            <Award size={20} style={{ color: 'var(--color-warning)' }} />
            <span>Top Performing Items</span>
          </div>

          {topSellingItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No sales data recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topSellingItems.map((item, idx) => {
                const percentOfMax = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(0) : 0;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>#{idx + 1} {item.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {currency}{item.revenue.toFixed(2)} ({item.quantity} sold)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percentOfMax}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #10b981)',
                        borderRadius: 'var(--radius-full)'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stock Health & Category Distribution */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem' }}>
            <PieChart size={20} style={{ color: 'var(--accent-primary)' }} />
            <span>Inventory Health &amp; Stock Levels</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-success)' }}>{healthyCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Healthy Stock</div>
            </div>
            <div style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-warning)' }}>{lowCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low Stock Alert</div>
            </div>
            <div style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-danger)' }}>{outCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Out of Stock</div>
            </div>
          </div>

          {/* Payment Methods Share */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Payment Method Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {Object.entries(paymentBreakdown).map(([method, amount]) => (
                <div key={method} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>{method}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{currency}{amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
