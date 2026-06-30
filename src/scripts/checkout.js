// Checkout Logic
document.addEventListener('DOMContentLoaded', () => {
  const DELIVERY_CHARGE = 120;
  let cart = JSON.parse(localStorage.getItem('mangoCart')) || [];

  // Elements
  const cartCountElement = document.querySelector('.cart-count');
  const itemsContainer = document.getElementById('checkoutItemsContainer');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const totalEl = document.getElementById('checkoutTotal');
  const orderForm = document.getElementById('checkoutOrderForm');

  // Bengali numeral converter helper
  const engToBdNum = (str) => {
    const bdNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.toString().replace(/\d/g, x => bdNums[x]);
  };

  function updateCartUI() {
    // Badge
    if (cartCountElement) {
      cartCountElement.textContent = engToBdNum(cart.length);
    }

    if (cart.length === 0) {
      itemsContainer.innerHTML = '<div class="empty-cart-message">আপনার কার্টে কোনো আম নেই। দয়া করে হোম পেজ থেকে আম নির্বাচন করুন।</div>';
      subtotalEl.textContent = '৳০';
      totalEl.textContent = '৳০';
      if (orderForm) {
        orderForm.querySelector('button').disabled = true;
      }
      return;
    }

    let subtotal = 0;
    itemsContainer.innerHTML = '';

    cart.forEach(item => {
      const itemTotal = item.price * item.weight;
      subtotal += itemTotal;

      const itemHtml = `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>${engToBdNum(item.weight)} কেজি x ৳${engToBdNum(item.price)}</p>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="cart-item-price">৳${engToBdNum(itemTotal)}</div>
            <button class="cart-item-remove" data-id="${item.cartItemId}">✖</button>
          </div>
        </div>
      `;
      itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
    });

    subtotalEl.textContent = `৳${engToBdNum(subtotal)}`;
    totalEl.textContent = `৳${engToBdNum(subtotal + DELIVERY_CHARGE)}`;

    // Re-attach remove listeners
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idToRemove = e.target.getAttribute('data-id');
        removeFromCart(idToRemove);
      });
    });
  }

  function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    localStorage.setItem('mangoCart', JSON.stringify(cart));
    updateCartUI();
  }

  // Initial render
  updateCartUI();

  // Form submission
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (cart.length === 0) {
        alert('আপনার কার্টে কোনো আইটেম নেই!');
        return;
      }

      const btn = document.getElementById('confirmOrderBtn');
      const originalText = btn.textContent;
      btn.textContent = 'প্রসেস হচ্ছে...';
      btn.disabled = true;
      
      // Get form data
      const formData = new FormData(orderForm);
      const customerInfo = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        paymentMethod: formData.get('payment')
      };

      const orderData = {
        customer: customerInfo,
        items: cart,
        subtotal: cart.reduce((acc, item) => acc + (item.price * item.weight), 0),
        deliveryCharge: DELIVERY_CHARGE,
        total: cart.reduce((acc, item) => acc + (item.price * item.weight), 0) + DELIVERY_CHARGE
      };

      // Send order to backend
      fetch('https://mango-backend-api.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })
      .then(response => {
        if (!response.ok) throw new Error('Order failed');
        return response.json();
      })
      .then(data => {
        // Clear cart first
        localStorage.removeItem('mangoCart');
        cart = [];
        updateCartUI();
        orderForm.reset();
        
        btn.textContent = originalText;
        btn.disabled = false;
        
        // Show alert using setTimeout so it doesn't block DOM updates
        setTimeout(() => {
          alert('আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে! অর্ডার আইডি: ' + data.orderId);
          window.location.href = 'index.html';
        }, 100);
      })
      .catch(error => {
        console.error('Error:', error);
        alert('অর্ডার সেভ করতে সমস্যা হয়েছে। দয়া করে নিশ্চিত করুন যে আপনার সার্ভারটি চালু আছে (https://mango-backend-api.onrender.com)।');
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }
});
