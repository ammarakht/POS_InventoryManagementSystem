import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  Receipt, 
  BarChart3, 
  Settings, 
  Layers, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function Sidebar({ activeView, onViewChange, lowStockCount }) {
  const menuItems = [
    { id: 'pos', label: 'POS Terminal', icon: ShoppingCart, badge: null },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null },
    { id: 'sales', label: 'Sales & Invoices', icon: Receipt, badge: null },
    { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Store Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="app-sidebar no-print">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Layers size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="brand-title">ApexPOS</span>
            <span className="brand-badge">PRO</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Inventory &amp; Retail Engine</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge !== null && (
                <span className="nav-badge" title={`${item.badge} Low Stock Items`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Terminal #01</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-success)' }}>● Scanner Online</span>
        </div>
      </div>
    </aside>
  );
}
