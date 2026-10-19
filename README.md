# Smart Inventory & Sales Management System

A light-weight browser-based inventory and sales management application built using HTML, CSS, and Vanilla JavaScript.

## Setup Instructions

1. Download or clone all files (`index.html`, `styles.css`, `script.js`) into a single folder.
2. Open `index.html` in any web browser (Chrome, Firefox, Safari, Edge).
3. No server setup or build step required.

## Key Features

- **Dashboard Metrics**: Displays real-time counts for total products, overall sales revenue, order counts, low-stock count, top-selling items, and current inventory cost value.
- **Product Management**: Full CRUD operations (Add, Edit, Delete) with form validations, category filtering, search, and sorting.
- **Cart & Discount Engine**: Add items to cart, auto-apply 10% discount on subtotals over PKR 10,000, calculate 5% tax, and adjust inventory automatically on checkout.
- **Data Persistence**: Uses `localStorage` to save inventory and sales history across page reloads.

## Assumptions & Limitations

- LocalStorage stores data per browser/device. Clearing browser storage will reset state to default settings.
- Designed for small retail stores with browser-bound operations.