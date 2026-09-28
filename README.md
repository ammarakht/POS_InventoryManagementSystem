# ApexPOS • Smart Inventory & Point of Sale System

ApexPOS is an ultra-fast, modern, browser-based **Inventory Management & Point of Sale (POS)** solution built with React and Vite. It is tailored for retail, convenience stores, and supermarkets, featuring physical barcode scanner support, real-time stock management, thermal receipt generation, and business analytics.

![ApexPOS Banner](public/icons.svg)

---

## ✨ Features

- ⚡ **Point of Sale (POS) Terminal**:
  - Instant barcode scan handling with custom debounce logic that prevents premature form submission.
  - Multi-category catalog filtering with real-time text and SKU search.
  - Cart calculations with customizable tax rates, line-item totals, and percentage discounts.
  - Multi-tender checkout: Cash, Card, and Mobile Wallets (Easypaisa / JazzCash) with quick-cash tender buttons.
  - Thermal receipt printing and exportable invoices (80mm & 58mm formats).

- 📦 **Inventory & Stock Management**:
  - Real-time stock counts with automated **Low Stock** and **Out of Stock** alerts.
  - Stock adjustment workflows (Restock, Damage write-off, Inventory audit).
  - Add / edit / delete products with automatic barcode and SKU generators.
  - CSV inventory export for easy accounting and backup.

- 🧾 **Sales & Transaction History**:
  - Detailed ledger of all completed sales, payment methods, and timestamps.
  - Search and filter by payment type, invoice number, and cashier.
  - Re-print any past transaction thermal receipt on demand.

- 📊 **Analytics & Business Insights**:
  - Key Performance Indicators (KPIs): Total Revenue, Total Orders, Average Order Value, Items Sold.
  - Category sales breakdown and top-selling product leaderboards.
  - Stock health alerts and inventory valuation metrics.

- ⚙️ **Store & Hardware Configuration**:
  - Store identity (Store Name, Address, Contact, Tax ID/NTN).
  - Multi-currency support (Default: **PKR**, USD, EUR, GBP, INR, AED, SAR, and more).
  - Hardware barcode scanner debounce tuning and auto-focus toggle.
  - Audio FX with Web Audio API (zero audio file dependencies).
  - One-click JSON database backup and restore.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler & Dev Server**: [Vite](https://vite.dev/)
- **Styling**: Vanilla CSS (Tailored Design System with Dark/Light mode support)
- **Icons**: [Lucide React](https://lucide.dev/) (Tree-shaken via custom lightweight proxy)
- **Effects**: Canvas Confetti
- **Storage**: Browser LocalStorage with automated schema migration

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ammarakht/POS_InventoryManagementSystem.git
   cd POS_InventoryManagementSystem
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production bundle**:
   ```bash
   npm run preview
   ```

---

## 🛡️ License

This project is open source and available under the [MIT License](LICENSE).
