// --- Global State ---
let inventory = [];

// --- Toast System ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="${type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse'; // Logic direction? Just opacity out for now if lazy
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Navigation ---
function showTab(tabName, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    document.getElementById(tabName + '-section').style.display = 'block';
    if (element) element.classList.add('active');

    if (tabName === 'dashboard') loadDashboardStats();
    if (tabName === 'inventory') loadInventory();
    if (tabName === 'reports') loadReports();
}

// --- Dashboard & Charts ---
async function loadDashboardStats() {
    try {
        const [invRes, prodRes] = await Promise.all([
            fetch('/api/v1/billing/history'),
            fetch('/api/v1/inventory/products')
        ]);

        const invoices = await invRes.json();
        const products = await prodRes.json();

        if (Array.isArray(invoices)) {
            const totalSales = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
            document.getElementById('dash-sales').innerText = '₹' + totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 });
            document.getElementById('dash-invoices').innerText = invoices.length;

            // Chart Data
            const dates = {};
            invoices.forEach(inv => {
                const d = new Date(inv.created_at).toLocaleDateString();
                dates[d] = (dates[d] || 0) + inv.total_amount;
            });
            renderChart(Object.keys(dates), Object.values(dates));
        }

        if (Array.isArray(products)) {
            document.getElementById('dash-products').innerText = products.length;
        }

    } catch (error) {
        console.error("Dashboard Load Error", error);
    }
}

let salesChart = null;
function renderChart(labels, data) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (salesChart) salesChart.destroy();

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (₹)',
                data: data,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [2, 2] } },
                x: { grid: { display: false } }
            }
        }
    });
}


// --- Inventory ---
async function loadInventory() {
    try {
        const res = await fetch('/api/v1/inventory/products');
        inventory = await res.json();
        const tbody = document.getElementById('inventory-table-body');

        if (Array.isArray(inventory)) {
            tbody.innerHTML = inventory.map(p => `
                <tr>
                    <td><span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${p.sku}</span></td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.stock_quantity > 10 ?
                    `<span style="color:var(--success)">${p.stock_quantity} in stock</span>` :
                    `<span style="color:var(--danger)">Low Stock (${p.stock_quantity})</span>`}
                    </td>
                    <td>₹${p.selling_price}</td>
                    <td><span style="font-size: 0.8rem; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px;">Active</span></td>
                </tr>
            `).join('');
        }
    } catch (err) {
        showToast("Failed to load inventory", "error");
    }
}

async function addProduct() {
    const data = {
        sku: document.getElementById('p-sku').value,
        name: document.getElementById('p-name-in').value,
        category: "General",
        purchase_price: 0,
        selling_price: parseFloat(document.getElementById('p-price-in').value),
        stock_quantity: parseInt(document.getElementById('p-stock').value)
    };

    if (!data.sku || !data.name) return showToast("Please fill details", "error");

    const res = await fetch('/api/v1/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        showToast("Product Added Successfully!");
        loadInventory();
        // clear inputs
        document.getElementById('p-sku').value = '';
        document.getElementById('p-name-in').value = '';
        document.getElementById('p-stock').value = '';
        document.getElementById('p-price-in').value = '';
    } else {
        showToast("Error adding product", "error");
    }
}

// --- Billing ---
function addRow() {
    const tbody = document.getElementById('bill-items');
    // We'll use a datalist for product suggestions if we wanted, 
    // but for now let's keep it simple text input that detects product by name? 
    // Or just simple manual entry as requested in the mockup for simplicity first.

    // Future enhancement: data-list for <input> using 'inventory' array.

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <input type="text" class="p-name" placeholder="Search or Type Item..." list="product-list" onchange="autoFillProduct(this)">
            <datalist id="product-list">
                ${inventory.map(p => `<option value="${p.name}">₹${p.selling_price}</option>`).join('')}
            </datalist>
        </td>
        <td><input type="number" class="p-price" value="0" oninput="calculateRow(this)"></td>
        <td><input type="number" class="p-qty" value="1" oninput="calculateRow(this)"></td>
        <td class="p-total" style="font-weight: 600;">0.00</td>
        <td><button class="btn btn-danger" style="padding: 5px 10px;" onclick="removeRow(this)"><i class="ri-delete-bin-line"></i></button></td>
    `;
    tbody.appendChild(row);
}

function removeRow(btn) {
    btn.parentElement.parentElement.remove();
    updateGrandTotal();
}

function autoFillProduct(input) {
    const val = input.value;
    const found = inventory.find(p => p.name === val);
    if (found) {
        const row = input.parentElement.parentElement;
        row.querySelector('.p-price').value = found.selling_price;
        calculateRow(input);
    }
}

function calculateRow(input) {
    const row = input.parentElement.parentElement;
    const qty = parseFloat(row.querySelector('.p-qty').value) || 0;
    const price = parseFloat(row.querySelector('.p-price').value) || 0;
    const total = qty * price;
    row.querySelector('.p-total').innerText = total.toFixed(2);
    updateGrandTotal();
}

function updateGrandTotal() {
    let sum = 0;
    document.querySelectorAll('.p-total').forEach(td => sum += parseFloat(td.innerText));
    const final = sum.toFixed(2);
    document.getElementById('sub-total').innerText = final;
    document.getElementById('grand-total').innerText = final;
}

async function submitInvoice() {
    const rows = document.querySelectorAll('#bill-items tr');
    if (rows.length === 0) return showToast("Add items to invoice!", "error");

    const items = [];
    let hasError = false;

    // Validate Items
    for (const row of rows) {
        const name = row.querySelector('.p-name').value.trim();
        const qty = parseInt(row.querySelector('.p-qty').value);
        const price = parseFloat(row.querySelector('.p-price').value);

        if (!name) continue;

        // Find product in inventory to get ID
        const product = inventory.find(p => p.name === name);
        if (!product) {
            showToast(`Product "${name}" not found in inventory!`, "error");
            hasError = true;
            break; // Stop payload construction
        }

        // Optional: Client-side stock check
        if (product.stock_quantity < qty) {
            showToast(`Insufficient stock for "${name}" (Avail: ${product.stock_quantity})`, "error");
            hasError = true;
            break;
        }

        items.push({
            product_id: product.id,
            name: product.name,
            quantity: qty,
            price: price
        });
    }

    if (hasError) return;

    const payload = {
        customer_name: document.getElementById('cust-name').value || "Walk-in Customer",
        customer_phone: document.getElementById('cust-phone').value || "",
        items: items,
        discount_amount: 0,
        payment_mode: document.getElementById('payment-mode').value
    };

    try {
        const res = await fetch('/api/v1/billing/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const result = await res.json();
            showToast(`Invoice ${result.invoice_number} Created!`);
            // Optional: Print
            setTimeout(() => {
                // simple print workaround for now
                window.print();
                // clear form
                document.getElementById('bill-items').innerHTML = '';
                updateGrandTotal();
                // Reload stats
                loadDashboardStats();
                loadInventory(); // Update stock
            }, 1000);
        } else {
            const err = await res.json();
            showToast(err.detail || "Error creating invoice", "error");
        }
    } catch (e) {
        showToast("Network Error", "error");
    }
}

// --- Reports ---
async function loadReports() {
    const res = await fetch('/api/v1/billing/history');
    const invoices = await res.json();
    const tbody = document.getElementById('reports-table-body');
    if (Array.isArray(invoices)) {
        tbody.innerHTML = invoices.map(inv => `
            <tr>
                <td>${new Date(inv.created_at).toLocaleDateString()}</td>
                <td>#${inv.invoice_number}</td>
                <td>${inv.customer_name}</td>
                <td><span style="font-weight:600">₹${inv.total_amount}</span></td>
                <td><span class="badge">${inv.payment_mode || 'Cash'}</span></td>
            </tr>
        `).join('');
    }
}