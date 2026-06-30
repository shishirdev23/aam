document.addEventListener('DOMContentLoaded', () => {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const totalOrdersCount = document.getElementById('totalOrdersCount');
    const refreshBtn = document.getElementById('refreshOrdersBtn');
    
    // Auth Elements
    const loginModal = document.getElementById('loginModal');
    const adminDashboard = document.getElementById('adminDashboard');
    const adminPassword = document.getElementById('adminPassword');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Filter Elements
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    let allOrders = [];

    const engToBdNum = (str) => {
        if (str === null || str === undefined) return '';
        const bdNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return str.toString().replace(/\d/g, x => bdNums[x]);
    };

    // --- Authentication ---
    const checkAuth = () => {
        const token = localStorage.getItem('adminToken');
        if (token === 'admin-token-101202') {
            loginModal.style.display = 'none';
            adminDashboard.style.display = 'block';
            fetchOrders();
        } else {
            loginModal.style.display = 'flex';
            adminDashboard.style.display = 'none';
        }
    };

    loginSubmitBtn.addEventListener('click', async () => {
        const password = adminPassword.value;
        try {
            const res = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                loginError.style.display = 'none';
                checkAuth();
            } else {
                loginError.style.display = 'block';
            }
        } catch (err) {
            loginError.textContent = 'সার্ভার এরর!';
            loginError.style.display = 'block';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        adminPassword.value = '';
        checkAuth();
    });

    // --- Data Fetching ---
    const fetchOrders = async () => {
        ordersTableBody.innerHTML = '<tr><td colspan="6" class="loading-msg">অর্ডার লোড হচ্ছে...</td></tr>';
        
        try {
            const response = await fetch('http://localhost:5000/api/orders');
            if (!response.ok) throw new Error('Failed to fetch orders');
            
            allOrders = await response.json();
            allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            filterAndRenderOrders();
        } catch (error) {
            console.error('Error:', error);
            ordersTableBody.innerHTML = '<tr><td colspan="6" class="error-msg">সার্ভার থেকে ডাটা পাওয়া যায়নি। নিশ্চিত করুন যে ব্যাক-এন্ড সার্ভার চালু আছে।</td></tr>';
        }
    };

    // --- Search & Filter ---
    const filterAndRenderOrders = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusTerm = statusFilter.value;

        const filteredOrders = allOrders.filter(order => {
            const matchSearch = (order.customer.name && order.customer.name.toLowerCase().includes(searchTerm)) || 
                                (order.customer.phone && order.customer.phone.includes(searchTerm));
            const matchStatus = statusTerm === 'All' || order.status === statusTerm || (statusTerm === 'Pending' && !order.status);
            return matchSearch && matchStatus;
        });

        renderOrders(filteredOrders);
        totalOrdersCount.textContent = engToBdNum(filteredOrders.length);
    };

    searchInput.addEventListener('input', filterAndRenderOrders);
    statusFilter.addEventListener('change', filterAndRenderOrders);
    refreshBtn.addEventListener('click', fetchOrders);

    // --- Render Orders ---
    const renderOrders = (orders) => {
        if (orders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="6" class="loading-msg">কোনো অর্ডার পাওয়া যায়নি।</td></tr>';
            return;
        }

        ordersTableBody.innerHTML = '';
        
        orders.forEach(order => {
            const date = new Date(order.date);
            const formattedDate = `${date.toLocaleDateString('bn-BD')} ${date.toLocaleTimeString('bn-BD')}`;
            
            const itemsHtml = order.items.map(item => 
                `<li>
                    <strong>${item.name}</strong><br>
                    ${engToBdNum(item.weight)} কেজি x ৳${engToBdNum(item.price)} = ৳${engToBdNum(item.weight * item.price)}
                </li>`
            ).join('');
            
            const currentStatus = order.status || 'Pending';

            const row = `
                <tr>
                    <td><span class="order-id">#${order.id}</span></td>
                    <td class="customer-cell">
                        <h4>${order.customer.name}</h4>
                        <p>📞 ${order.customer.phone}</p>
                        <p>📍 ${order.customer.address}</p>
                        <p style="margin-top: 5px;"><span class="badge-payment">${order.customer.paymentMethod || 'ক্যাশ অন ডেলিভারি'}</span></p>
                    </td>
                    <td>
                        <ul class="items-list">
                            ${itemsHtml}
                        </ul>
                    </td>
                    <td>
                        <div class="price-breakdown">
                            <p>সাবটোটাল: ৳${engToBdNum(order.subtotal)}</p>
                            <p>ডেলিভারি: ৳${engToBdNum(order.deliveryCharge)}</p>
                            <hr style="margin: 5px 0; opacity: 0.1;">
                            <span class="order-total">মোট: ৳${engToBdNum(order.total)}</span>
                        </div>
                    </td>
                    <td>
                        <span class="order-date">${formattedDate}</span>
                    </td>
                    <td>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <select class="status-select" data-id="${order.id}" style="padding: 5px; border-radius: 5px; border: 1px solid #ccc; font-size: 12px; font-family: inherit;">
                                <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Processing" ${currentStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                                <option value="Shipped" ${currentStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="Delivered" ${currentStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            </select>
                            <button class="btn btn-secondary" style="padding: 5px 12px; font-size: 12px; color: #333; border: 1px solid #ddd;" onclick="window.print()">প্রিন্ট করুন</button>
                            <button class="btn-delete" style="padding: 5px 12px; font-size: 12px; border: none; background: #fff0f0; color: #ff4d4d; border-radius: 8px; cursor: pointer; font-weight: 600;" data-id="${order.id}">অর্ডার মুছুন</button>
                        </div>
                    </td>
                </tr>
            `;
            ordersTableBody.insertAdjacentHTML('beforeend', row);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const deleteBtn = e.target.closest('.btn-delete');
                const id = deleteBtn.getAttribute('data-id');
                
                if (confirm('আপনি কি নিশ্চিত যে এই অর্ডারটি মুছে ফেলতে চান?')) {
                    try {
                        const response = await fetch(`http://localhost:5000/api/orders/${id}`, { method: 'DELETE' });
                        const result = await response.json();
                        if (result.success) {
                            fetchOrders(); // Refresh table
                        } else {
                            throw new Error(result.error);
                        }
                    } catch (error) {
                        alert('অর্ডার মুছতে সমস্যা হয়েছে।');
                    }
                }
            });
        });

        // Add event listeners for status change
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const newStatus = e.target.value;
                try {
                    const response = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    });
                    const result = await response.json();
                    if (!result.success) {
                        alert('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে!');
                        fetchOrders(); // Revert on fail
                    }
                } catch (error) {
                    alert('সার্ভার এরর!');
                    fetchOrders();
                }
            });
        });
    };

    // --- CSV Export ---
    exportCsvBtn.addEventListener('click', () => {
        if(allOrders.length === 0) return alert('কোনো ডাটা নেই!');
        
        // Define CSV headers
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM for Bangla
        csvContent += "Order ID,Date,Customer Name,Phone,Address,Items,Subtotal,Delivery,Total,Status\n";

        allOrders.forEach(order => {
            const d = new Date(order.date);
            const dateStr = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
            const itemsStr = order.items.map(i => `${i.name} (${i.weight}kg)`).join('; ');
            
            const row = [
                order.id,
                `"${dateStr}"`,
                `"${order.customer.name}"`,
                `"${order.customer.phone}"`,
                `"${order.customer.address}"`,
                `"${itemsStr}"`,
                order.subtotal,
                order.deliveryCharge,
                order.total,
                order.status || 'Pending'
            ];
            csvContent += row.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Start
    checkAuth();
});
