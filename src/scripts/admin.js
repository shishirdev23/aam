document.addEventListener('DOMContentLoaded', () => {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const totalOrdersCount = document.getElementById('totalOrdersCount');
    const refreshBtn = document.getElementById('refreshOrdersBtn');

    const engToBdNum = (str) => {
        const bdNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return str.toString().replace(/\d/g, x => bdNums[x]);
    };

    const fetchOrders = async () => {
        ordersTableBody.innerHTML = '<tr><td colspan="6" class="loading-msg">অর্ডার লোড হচ্ছে...</td></tr>';
        
        try {
            const response = await fetch('http://localhost:5000/api/orders');
            if (!response.ok) throw new Error('Failed to fetch orders');
            
            const orders = await response.json();
            
            // Sort by date (newest first)
            orders.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            renderOrders(orders);
            totalOrdersCount.textContent = engToBdNum(orders.length);
        } catch (error) {
            console.error('Error:', error);
            ordersTableBody.innerHTML = '<tr><td colspan="6" class="error-msg">সার্ভার থেকে ডাটা পাওয়া যায়নি। নিশ্চিত করুন যে ব্যাক-এন্ড সার্ভার চালু আছে।</td></tr>';
        }
    };

    const renderOrders = (orders) => {
        if (orders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="6" class="loading-msg">এখনও কোনো অর্ডার আসেনি।</td></tr>';
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
                            <span class="badge-status">নতুন অর্ডার</span>
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
                const row = deleteBtn.closest('tr');

                if (confirm('আপনি কি নিশ্চিত যে এই অর্ডারটি মুছে ফেলতে চান?')) {
                    try {
                        const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
                            method: 'DELETE'
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            // Instant UI update
                            row.style.transition = 'all 0.5s ease';
                            row.style.opacity = '0';
                            row.style.transform = 'translateX(20px)';
                            
                            setTimeout(() => {
                                row.remove();
                                // Update total count
                                const currentCount = parseInt(totalOrdersCount.textContent.replace(/[^০-৯]/g, x => '০১২৩৪৫৬৭৮৯'.indexOf(x)));
                                totalOrdersCount.textContent = engToBdNum(currentCount - 1);
                                
                                if (document.querySelectorAll('.orders-table tbody tr').length === 0) {
                                    ordersTableBody.innerHTML = '<tr><td colspan="6" class="loading-msg">এখনও কোনো অর্ডার আসেনি।</td></tr>';
                                }
                            }, 500);
                        } else {
                            throw new Error(result.error || 'Delete failed');
                        }
                    } catch (error) {
                        console.error('Delete error:', error);
                        alert('অর্ডার মুছতে সমস্যা হয়েছে। নিশ্চিত করুন সার্ভার চালু আছে।');
                    }
                }
            });
        });
    };

    refreshBtn.addEventListener('click', fetchOrders);

    // Initial fetch
    fetchOrders();
});
