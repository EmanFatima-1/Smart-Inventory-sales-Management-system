let state = {
    products: [],
    cart: [],
    sales: []
};

document.addEventListener("DOMContentLoaded", () => {
    loadData();
    renderDashboard();
    renderProducts();
    renderSaleProducts();
    renderCart();
    renderSalesHistory();

    document.getElementById("products-table-body").addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-id]");
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.action === "edit") editProduct(id);
        if (btn.dataset.action === "delete") deleteProduct(id);
    });

    document.getElementById("sale-products-table-body").addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-id]");
        if (!btn) return;
        if (btn.dataset.action === "addToCart") addToCart(btn.dataset.id);
    });

    document.getElementById("cart-table-body").addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-id]");
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.action === "dec") updateCartQty(id, -1);
        if (btn.dataset.action === "inc") updateCartQty(id, 1);
        if (btn.dataset.action === "remove") removeFromCart(id);
    });
});

function td(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}

function emptyRow(message, cols) {
    const tr = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = cols;
    cell.style.textAlign = "center";
    cell.textContent = message;
    tr.appendChild(cell);
    return tr;
}

function switchTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    event.target.classList.add("active");

    if (tabId === "dashboard") renderDashboard();
    if (tabId === "products") renderProducts();
    if (tabId === "sales") renderSaleProducts();
    if (tabId === "history") renderSalesHistory();
}

function loadData() {
    try {
        const savedProducts = localStorage.getItem("app_products");
        const savedSales = localStorage.getItem("app_sales");

        state.products = savedProducts ? JSON.parse(savedProducts) : getInitialProducts();
        state.sales = savedSales ? JSON.parse(savedSales) : [];
    } catch (e) {
        showToast("Error loading saved data. Resetting to default state.");
        state.products = getInitialProducts();
        state.sales = [];
    }
}

function saveData() {
    localStorage.setItem("app_products", JSON.stringify(state.products));
    localStorage.setItem("app_sales", JSON.stringify(state.sales));
}

function getInitialProducts() {
    return [
        {
            id: "PRD-001",
            name: "Wireless Mouse",
            category: "Electronics",
            purchasePrice: 1200,
            sellingPrice: 1800,
            quantity: 25,
            minThreshold: 5
        }
    ];
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
}

function handleProductSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById("edit-product-id").value;
    const id = document.getElementById("prod-id").value.trim();
    const name = document.getElementById("prod-name").value.trim();
    const category = document.getElementById("prod-category").value.trim();
    const purchasePrice = parseFloat(document.getElementById("prod-buy-price").value);
    const sellingPrice = parseFloat(document.getElementById("prod-sell-price").value);
    const quantity = parseInt(document.getElementById("prod-qty").value, 10);
    const minThreshold = parseInt(document.getElementById("prod-min-threshold").value, 10);

    if (purchasePrice <= 0 || sellingPrice <= 0) {
        alert("Prices must be positive values.");
        return;
    }
    if (quantity < 0 || minThreshold < 0) {
        alert("Quantities must be non-negative whole numbers.");
        return;
    }
    if (!editId && state.products.some(p => p.id === id)) {
        alert("Product ID already exists. Please use a unique ID.");
        return;
    }

    const productData = { id, name, category, purchasePrice, sellingPrice, quantity, minThreshold };

    if (editId) {
        const index = state.products.findIndex(p => p.id === editId);
        if (index !== -1) {
            state.products[index] = productData;
            showToast("Product updated successfully.");
        }
    } else {
        state.products.push(productData);
        showToast("Product added successfully.");
    }

    saveData();
    resetProductForm();
    renderProducts();
}

function resetProductForm() {
    document.getElementById("product-form").reset();
    document.getElementById("edit-product-id").value = "";
    document.getElementById("prod-id").disabled = false;
    document.getElementById("form-title").innerText = "Add New Product";
    document.getElementById("save-prod-btn").innerText = "Save Product";
}

function editProduct(id) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;

    document.getElementById("edit-product-id").value = product.id;
    document.getElementById("prod-id").value = product.id;
    document.getElementById("prod-id").disabled = true;
    document.getElementById("prod-name").value = product.name;
    document.getElementById("prod-category").value = product.category;
    document.getElementById("prod-buy-price").value = product.purchasePrice;
    document.getElementById("prod-sell-price").value = product.sellingPrice;
    document.getElementById("prod-qty").value = product.quantity;
    document.getElementById("prod-min-threshold").value = product.minThreshold;

    document.getElementById("form-title").innerText = "Edit Product";
    document.getElementById("save-prod-btn").innerText = "Update Product";
}

function deleteProduct(id) {
    if (confirm(`Are you sure you want to delete product ID: ${id}?`)) {
        state.products = state.products.filter(p => p.id !== id);
        saveData();
        renderProducts();
        showToast("Product deleted.");
    }
}

function renderProducts() {
    const tbody = document.getElementById("products-table-body");
    const searchQuery = document.getElementById("prod-search").value.toLowerCase();
    const categoryFilter = document.getElementById("prod-filter-category").value;
    const sortBy = document.getElementById("prod-sort-by").value;

    updateCategoryDropdown();

    let filtered = state.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.id.toLowerCase().includes(searchQuery);
        const matchesCategory = categoryFilter === "" || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "price") return a.sellingPrice - b.sellingPrice;
        if (sortBy === "qty") return a.quantity - b.quantity;
        return 0;
    });

    tbody.textContent = "";

    if (filtered.length === 0) {
        tbody.appendChild(emptyRow("No products found.", 8));
        return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(p => {
        const tr = document.createElement("tr");

        tr.appendChild(td(p.id));
        tr.appendChild(td(p.name));
        tr.appendChild(td(p.category));
        tr.appendChild(td(`PKR ${p.purchasePrice.toLocaleString()}`));
        tr.appendChild(td(`PKR ${p.sellingPrice.toLocaleString()}`));
        tr.appendChild(td(p.quantity));

        const statusTd = document.createElement("td");
        const badge = document.createElement("span");
        if (p.quantity === 0) {
            badge.className = "badge badge-danger";
            badge.textContent = "Out of Stock";
        } else if (p.quantity <= p.minThreshold) {
            badge.className = "badge badge-warning";
            badge.textContent = "Low Stock";
        } else {
            badge.className = "badge badge-success";
            badge.textContent = "In Stock";
        }
        statusTd.appendChild(badge);
        tr.appendChild(statusTd);

        const actionTd = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-secondary";
        editBtn.textContent = "Edit";
        editBtn.dataset.id = p.id;
        editBtn.dataset.action = "edit";

        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-danger";
        delBtn.textContent = "Delete";
        delBtn.dataset.id = p.id;
        delBtn.dataset.action = "delete";

        actionTd.appendChild(editBtn);
        actionTd.appendChild(delBtn);
        tr.appendChild(actionTd);

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

function updateCategoryDropdown() {
    const select = document.getElementById("prod-filter-category");
    const categories = [...new Set(state.products.map(p => p.category))];
    const currentValue = select.value;


    select.textContent = "";

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "All Categories";
    select.appendChild(defaultOpt);

    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        if (cat === currentValue) opt.selected = true;
        select.appendChild(opt);
    });
}

function renderSaleProducts() {
    const tbody = document.getElementById("sale-products-table-body");
    const searchQuery = document.getElementById("sale-prod-search").value.toLowerCase();

    const filtered = state.products.filter(
        p => p.name.toLowerCase().includes(searchQuery) || p.id.toLowerCase().includes(searchQuery)
    );

    tbody.textContent = "";

    if (filtered.length === 0) {
        tbody.appendChild(emptyRow("No available products found.", 4));
        return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(p => {
        const isOutOfStock = p.quantity === 0;
        const tr = document.createElement("tr");

        const nameTd = document.createElement("td");
        nameTd.textContent = p.name + " ";
        const small = document.createElement("small");
        small.textContent = p.id;
        nameTd.appendChild(document.createElement("br"));
        nameTd.appendChild(small);
        tr.appendChild(nameTd);

        tr.appendChild(td(`PKR ${p.sellingPrice.toLocaleString()}`));
        tr.appendChild(td(p.quantity));

        const btnTd = document.createElement("td");
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-primary";
        btn.textContent = isOutOfStock ? "Out of Stock" : "Add";
        btn.disabled = isOutOfStock;
        btn.dataset.id = p.id;
        btn.dataset.action = "addToCart";
        btnTd.appendChild(btn);
        tr.appendChild(btnTd);

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || product.quantity <= 0) return;

    const cartItem = state.cart.find(item => item.id === productId);

    if (cartItem) {
        if (cartItem.qty < product.quantity) {
            cartItem.qty++;
        } else {
            alert(`Cannot add more than available stock (${product.quantity}).`);
        }
    } else {
        state.cart.push({
            id: product.id,
            name: product.name,
            price: product.sellingPrice,
            qty: 1
        });
    }

    renderCart();
}

function updateCartQty(productId, change) {
    const cartItem = state.cart.find(item => item.id === productId);
    const product = state.products.find(p => p.id === productId);
    if (!cartItem || !product) return;

    const newQty = cartItem.qty + change;

    if (newQty <= 0) {
        state.cart = state.cart.filter(item => item.id !== productId);
    } else if (newQty > product.quantity) {
        alert(`Cannot exceed available stock level (${product.quantity}).`);
    } else {
        cartItem.qty = newQty;
    }

    renderCart();
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    renderCart();
}

function renderCart() {
    const tbody = document.getElementById("cart-table-body");
    tbody.textContent = "";

    if (state.cart.length === 0) {
        tbody.appendChild(emptyRow("Cart is empty.", 5));
        calculateTotals(0);
        return;
    }

    let subtotal = 0;
    const fragment = document.createDocumentFragment();

    state.cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const tr = document.createElement("tr");

        tr.appendChild(td(item.name));
        tr.appendChild(td(`PKR ${item.price.toLocaleString()}`));

        const qtyTd = document.createElement("td");

        const decBtn = document.createElement("button");
        decBtn.className = "btn btn-sm";
        decBtn.textContent = "-";
        decBtn.dataset.id = item.id;
        decBtn.dataset.action = "dec";

        const qtySpan = document.createElement("span");
        qtySpan.textContent = ` ${item.qty} `;

        const incBtn = document.createElement("button");
        incBtn.className = "btn btn-sm";
        incBtn.textContent = "+";
        incBtn.dataset.id = item.id;
        incBtn.dataset.action = "inc";

        qtyTd.appendChild(decBtn);
        qtyTd.appendChild(qtySpan);
        qtyTd.appendChild(incBtn);
        tr.appendChild(qtyTd);

        tr.appendChild(td(`PKR ${itemTotal.toLocaleString()}`));

        const removeTd = document.createElement("td");
        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.textContent = "×";
        removeBtn.dataset.id = item.id;
        removeBtn.dataset.action = "remove";
        removeTd.appendChild(removeBtn);
        tr.appendChild(removeTd);

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
    calculateTotals(subtotal);
}

function calculateTotals(subtotal) {
    let discount = 0;
    if (subtotal >= 10000) {
        discount = subtotal * 0.10;
    }

    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.05;
    const grandTotal = discountedSubtotal + tax;

    document.getElementById("cart-subtotal").innerText = `PKR ${subtotal.toFixed(2)}`;
    document.getElementById("cart-discount").innerText = `- PKR ${discount.toFixed(2)}`;
    document.getElementById("cart-tax").innerText = `PKR ${tax.toFixed(2)}`;
    document.getElementById("cart-grand-total").innerText = `PKR ${grandTotal.toFixed(2)}`;

    return { subtotal, discount, tax, grandTotal };
}

function checkout() {
    if (state.cart.length === 0) {
        alert("Cannot process an empty checkout.");
        return;
    }

    for (let item of state.cart) {
        const product = state.products.find(p => p.id === item.id);
        if (!product || product.quantity < item.qty) {
            alert(`Checkout failed: Stock for "${item.name}" changed or is insufficient.`);
            return;
        }
    }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totals = calculateTotals(subtotal);

    state.cart.forEach(item => {
        const product = state.products.find(p => p.id === item.id);
        if (product) product.quantity -= item.qty;
    });

    const newSale = {
        saleId: "SALE-" + Date.now().toString().slice(-6),
        timestamp: new Date().toISOString(),
        items: [...state.cart],
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        grandTotal: totals.grandTotal
    };

    state.sales.push(newSale);
    state.cart = [];

    saveData();
    renderCart();
    renderSaleProducts();
    showToast("Checkout completed successfully!");
}

function renderDashboard() {
    const totalProducts = state.products.length;
    const totalRevenue = state.sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalOrders = state.sales.length;
    const lowStockCount = state.products.filter(p => p.quantity <= p.minThreshold).length;
    const totalCostValue = state.products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);

    const unitsSoldMap = {};
    state.sales.forEach(sale => {
        sale.items.forEach(item => {
            unitsSoldMap[item.name] = (unitsSoldMap[item.name] || 0) + item.qty;
        });
    });

    let topProduct = "None";
    let maxUnits = 0;
    for (const [name, units] of Object.entries(unitsSoldMap)) {
        if (units > maxUnits) {
            maxUnits = units;
            topProduct = `${name} (${units} units sold)`;
        }
    }

    document.getElementById("metric-total-products").innerText = totalProducts;
    document.getElementById("metric-total-revenue").innerText = `PKR ${totalRevenue.toFixed(2)}`;
    document.getElementById("metric-total-orders").innerText = totalOrders;
    document.getElementById("metric-low-stock").innerText = lowStockCount;
    document.getElementById("metric-top-product").innerText = topProduct;
    document.getElementById("metric-inventory-cost").innerText = `PKR ${totalCostValue.toLocaleString()}`;
}

function renderSalesHistory() {
    const tbody = document.getElementById("history-table-body");
    const searchQuery = document.getElementById("history-search").value.toLowerCase();
    const dateQuery = document.getElementById("history-date-filter").value;

    let filtered = state.sales.filter(s => {
        const matchesId = s.saleId.toLowerCase().includes(searchQuery);
        const saleDate = s.timestamp.split("T")[0];
        const matchesDate = !dateQuery || saleDate === dateQuery;
        return matchesId && matchesDate;
    });

    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    tbody.textContent = "";

    if (filtered.length === 0) {
        tbody.appendChild(emptyRow("No sales records found.", 4));
        return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(sale => {
        const tr = document.createElement("tr");

        const idTd = document.createElement("td");
        const strong = document.createElement("strong");
        strong.textContent = sale.saleId;
        idTd.appendChild(strong);
        tr.appendChild(idTd);

        tr.appendChild(td(new Date(sale.timestamp).toLocaleString()));

        tr.appendChild(td(sale.items.map(i => `${i.name} (x${i.qty})`).join(", ")));

        tr.appendChild(td(`PKR ${sale.grandTotal.toFixed(2)}`));

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

function clearHistoryFilters() {
    document.getElementById("history-search").value = "";
    document.getElementById("history-date-filter").value = "";
    renderSalesHistory();
}