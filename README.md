# Smart Inventory & Sales Management System
A lightweight, robust browser-based inventory and sales management application built using HTML5, CSS3, and Vanilla JavaScript.

## Key Features

- **Dashboard & Business Analytics**: Displays real-time metrics including total inventory cost value, total revenue, order count, low-stock threshold alerts, top-selling product (aggregated accurately by Product ID), and overall profit margin calculations.

- **Product Management**: Full CRUD operations (Add, Edit, Delete) with form validation, category filtering, case-insensitive searching, purchase/selling price checks, and dynamic sorting.

- **POS & Cart Engine**: Dynamic shopping cart with real-time subtotal tracking, auto-calculated discounts (10% on subtotals ≥ PKR 10,000), 5% tax application, floating-point currency precision rounding, and immediate stock adjustment upon checkout.

- **Transaction Audit Log**: Secure sale tracking powered by standard `crypto.randomUUID()` with fallback mechanisms, transaction filtering, and detailed receipt generation.

- **Data Persistence**: Uses browser `localStorage` to retain inventory, cart, and sales history across sessions without requiring external database configuration.

## Setup & Usage Instructions

Clone or download the repository:
git clone https://github.com/EmanFatima-1/Smart-Inventory-sales-Management-system.git

Navigate to the project directory:
cd Smart-Inventory-sales-Management-system

Open index.html directly in any web browser or serve via Live Server.

Technical Scope & Assumptions

Data is securely managed client-side via localStorage.
Designed for small-to-medium retail operations with zero build step or server-side dependencies.