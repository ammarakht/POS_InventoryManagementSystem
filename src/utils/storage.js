// LocalStorage State & Data Management with Sample Products & Transactions

const STORAGE_KEYS = {
  PRODUCTS: 'apex_pos_products_v1',
  TRANSACTIONS: 'apex_pos_transactions_v1',
  SETTINGS: 'apex_pos_settings_v1',
  CATEGORIES: 'apex_pos_categories_v1',
};

export const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Items', icon: 'LayoutGrid' },
  { id: 'groceries', name: 'Groceries & Food', icon: 'Apple' },
  { id: 'beverages', name: 'Beverages', icon: 'CupSoda' },
  { id: 'electronics', name: 'Electronics & Tech', icon: 'Smartphone' },
  { id: 'personal_care', name: 'Personal Care', icon: 'Sparkles' },
  { id: 'stationery', name: 'Stationery & Office', icon: 'BookOpen' },
  { id: 'apparel', name: 'Apparel & Wear', icon: 'Shirt' }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    barcode: '8901030383842',
    sku: 'BEV-ORG-01',
    name: 'Organic Orange Juice 1L',
    category: 'beverages',
    costPrice: 2.10,
    price: 4.50,
    stock: 48,
    minStock: 15,
    unit: 'Bottle',
    supplier: 'SunValley Naturals',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&auto=format&fit=crop&q=80',
    description: 'Freshly squeezed 100% pure organic orange juice with pulp.',
    taxRate: 5
  },
  {
    id: 'prod-002',
    barcode: '7350053850019',
    sku: 'BEV-OAT-02',
    name: 'Barista Oat Milk 1L',
    category: 'beverages',
    costPrice: 1.80,
    price: 3.99,
    stock: 6,
    minStock: 12,
    unit: 'Carton',
    supplier: 'Nordic Agro Foods',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80',
    description: 'Creamy plant-based oat milk designed for specialty coffee.',
    taxRate: 5
  },
  {
    id: 'prod-003',
    barcode: '012000000133',
    sku: 'BEV-COL-03',
    name: 'Sparkling Mineral Cola 330ml',
    category: 'beverages',
    costPrice: 0.65,
    price: 1.75,
    stock: 120,
    minStock: 24,
    unit: 'Can',
    supplier: 'Craft Soda Co',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80',
    description: 'Artisan craft cola made with natural cane sugar.',
    taxRate: 8
  },
  {
    id: 'prod-004',
    barcode: '028400070560',
    sku: 'SNK-CHS-04',
    name: 'Artisan Aged Cheddar Crisps 150g',
    category: 'groceries',
    costPrice: 1.20,
    price: 2.95,
    stock: 35,
    minStock: 10,
    unit: 'Pack',
    supplier: 'Gourmet Bites Ltd',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80',
    description: 'Slow-cooked crunchy potato crisps with sharp aged cheddar.',
    taxRate: 5
  },
  {
    id: 'prod-005',
    barcode: '049000000450',
    sku: 'SNK-CHOC-05',
    name: 'Swiss Dark Chocolate 72% 100g',
    category: 'groceries',
    costPrice: 1.60,
    price: 3.80,
    stock: 4,
    minStock: 10,
    unit: 'Bar',
    supplier: 'Alpine Confectionery',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&auto=format&fit=crop&q=80',
    description: 'Rich single-origin Swiss dark chocolate with delicate sea salt.',
    taxRate: 5
  },
  {
    id: 'prod-006',
    barcode: '194252056821',
    sku: 'ELE-WIR-06',
    name: 'Pro Wireless ANC Earbuds',
    category: 'electronics',
    costPrice: 38.00,
    price: 79.99,
    stock: 18,
    minStock: 5,
    unit: 'Unit',
    supplier: 'SonicTech Global',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80',
    description: 'Active noise cancelling wireless earbuds with 32hr battery life.',
    taxRate: 12
  },
  {
    id: 'prod-007',
    barcode: '840130002100',
    sku: 'ELE-USBC-07',
    name: 'Braided Fast USB-C Cable 2M',
    category: 'electronics',
    costPrice: 3.50,
    price: 12.50,
    stock: 65,
    minStock: 20,
    unit: 'Unit',
    supplier: 'SonicTech Global',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80',
    description: 'Ultra durable nylon braided 100W PD fast charging cable.',
    taxRate: 12
  },
  {
    id: 'prod-008',
    barcode: '793573189201',
    sku: 'ELE-MAG-08',
    name: 'Magnetic Qi2 Wireless Charger Stand',
    category: 'electronics',
    costPrice: 14.20,
    price: 34.00,
    stock: 2,
    minStock: 8,
    unit: 'Unit',
    supplier: 'Nexus Hardware',
    image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=300&auto=format&fit=crop&q=80',
    description: 'Fast 15W magnetic aluminum desktop charging stand.',
    taxRate: 12
  },
  {
    id: 'prod-009',
    barcode: '810023450912',
    sku: 'PC-HYD-09',
    name: 'Hydrating Botanical Face Mist 120ml',
    category: 'personal_care',
    costPrice: 4.80,
    price: 14.50,
    stock: 22,
    minStock: 8,
    unit: 'Bottle',
    supplier: 'PureBliss Botanicals',
    image: 'https://images.unsplash.com/photo-1608248597359-bb43063f16d8?w=300&auto=format&fit=crop&q=80',
    description: 'Refreshing facial mist enriched with rosewater and hyaluronic acid.',
    taxRate: 8
  },
  {
    id: 'prod-010',
    barcode: '761303567891',
    sku: 'PC-SHP-10',
    name: 'Nourishing Argan Oil Shampoo 400ml',
    category: 'personal_care',
    costPrice: 3.90,
    price: 10.90,
    stock: 31,
    minStock: 10,
    unit: 'Bottle',
    supplier: 'PureBliss Botanicals',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80',
    description: 'Sulfate-free nourishing argan oil formula for silky hair.',
    taxRate: 8
  },
  {
    id: 'prod-011',
    barcode: '890214560123',
    sku: 'OFF-NBK-11',
    name: 'Hardcover Dot-Grid Journal A5',
    category: 'stationery',
    costPrice: 4.00,
    price: 11.50,
    stock: 45,
    minStock: 12,
    unit: 'Book',
    supplier: 'PaperCraft Studio',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80',
    description: '160gsm bleed-proof bamboo paper with premium linen cover.',
    taxRate: 5
  },
  {
    id: 'prod-012',
    barcode: '490168122241',
    sku: 'OFF-GEL-12',
    name: 'Precision Gel Pen 0.5mm Pack of 4',
    category: 'stationery',
    costPrice: 2.20,
    price: 6.99,
    stock: 58,
    minStock: 15,
    unit: 'Pack',
    supplier: 'PaperCraft Studio',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&auto=format&fit=crop&q=80',
    description: 'Smooth quick-dry Japanese archival pigment ink.',
    taxRate: 5
  },
  {
    id: 'prod-013',
    barcode: '880912345678',
    sku: 'APP-TEE-13',
    name: 'Heavyweight Cotton Tee - Black (L)',
    category: 'apparel',
    costPrice: 8.50,
    price: 24.00,
    stock: 14,
    minStock: 6,
    unit: 'Piece',
    supplier: 'UrbanThread Co',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
    description: '100% combed ringspun organic cotton relaxed fit t-shirt.',
    taxRate: 8
  },
  {
    id: 'prod-014',
    barcode: '880912345679',
    sku: 'APP-CAP-14',
    name: 'Minimalist Embroidered Dad Cap',
    category: 'apparel',
    costPrice: 5.00,
    price: 18.00,
    stock: 0,
    minStock: 5,
    unit: 'Piece',
    supplier: 'UrbanThread Co',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&auto=format&fit=crop&q=80',
    description: 'Vintage washed cotton twill baseball cap with brass buckle.',
    taxRate: 8
  }
];

export const DEFAULT_SETTINGS = {
  storeName: 'APEX RETAIL & PROVISIONS',
  storeAddress: '742 Evergreen Terrace, Suite 100',
  storePhone: '+1 (555) 839-2041',
  storeEmail: 'contact@apexretail.io',
  taxId: 'TAX-US-992014',
  currencySymbol: '$',
  defaultTaxRate: 8.0,
  enableSound: true,
  receiptHeader: 'Thank you for shopping with us!',
  receiptFooter: 'Exchange within 14 days with original receipt.',
  paperWidth: '80mm', // '80mm' or '58mm'
  scannerDebounceMs: 40,
  quickAddOnScan: true,
  autoFocusScanner: true,
};

// Initial Seed Transactions
export const INITIAL_TRANSACTIONS = [
  {
    id: 'INV-20260928-001',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    cashier: 'Alex Mercer',
    customerName: 'Sarah Connor',
    customerPhone: '+1 555-0192',
    items: [
      { id: 'prod-001', barcode: '8901030383842', name: 'Organic Orange Juice 1L', price: 4.50, quantity: 2, subtotal: 9.00 },
      { id: 'prod-004', barcode: '028400070560', name: 'Artisan Aged Cheddar Crisps 150g', price: 2.95, quantity: 1, subtotal: 2.95 }
    ],
    subtotal: 11.95,
    discountAmount: 0,
    taxRate: 5,
    taxAmount: 0.60,
    total: 12.55,
    paymentMethod: 'Card',
    amountPaid: 12.55,
    changeDue: 0,
    status: 'COMPLETED'
  },
  {
    id: 'INV-20260928-002',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    cashier: 'Alex Mercer',
    customerName: 'Walk-in Customer',
    customerPhone: '',
    items: [
      { id: 'prod-006', barcode: '194252056821', name: 'Pro Wireless ANC Earbuds', price: 79.99, quantity: 1, subtotal: 79.99 },
      { id: 'prod-007', barcode: '840130002100', name: 'Braided Fast USB-C Cable 2M', price: 12.50, quantity: 1, subtotal: 12.50 }
    ],
    subtotal: 92.49,
    discountAmount: 5.00,
    taxRate: 12,
    taxAmount: 10.50,
    total: 97.99,
    paymentMethod: 'Cash',
    amountPaid: 100.00,
    changeDue: 2.01,
    status: 'COMPLETED'
  }
];

// Helper methods with safe JSON parse
export const storage = {
  getProducts: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts: (products) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  },

  getTransactions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        return INITIAL_TRANSACTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransactions: (txs) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  },

  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  resetAll: () => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
};
