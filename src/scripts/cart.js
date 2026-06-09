export function initCart() {
  // Update badge count based on localStorage
  const cartCountElement = document.querySelector('.cart-count');
  
  function getCart() {
    return JSON.parse(localStorage.getItem('mangoCart')) || [];
  }

  function saveCart(cartData) {
    localStorage.setItem('mangoCart', JSON.stringify(cartData));
  }

  function updateCartCount() {
    if (cartCountElement) {
      const cart = getCart();
      const engToBdNum = (str) => {
        const bdNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return str.toString().replace(/\d/g, x => bdNums[x]);
      };
      cartCountElement.textContent = engToBdNum(cart.length);
    }
  }

  updateCartCount();

  // Add to cart logic and redirect
  function addToCartAndRedirect(id, name, price, weight) {
    const cart = getCart();
    // Unique ID for the cart item
    const cartItemId = id + '_' + Date.now();
    cart.push({ cartItemId, id, name, price, weight });
    saveCart(cart);
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
  }

  // Dynamic price calculation on cards
  const engToBdNumHelper = (str) => {
    const bdNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.toString().replace(/\d/g, x => bdNums[x]);
  };

  const weightDropdowns = document.querySelectorAll('.weight-dropdown');
  weightDropdowns.forEach(dropdown => {
    dropdown.addEventListener('change', (e) => {
      const select = e.target;
      const weight = parseInt(select.value);
      const card = select.closest('.product-card');
      
      if (card) {
        const btn = card.querySelector('.order-now-btn');
        if (btn) {
          const basePrice = parseInt(btn.getAttribute('data-price'));
          const totalPrice = basePrice * weight;
          
          const priceDisplay = card.querySelector('.price');
          if (priceDisplay) {
            priceDisplay.innerHTML = `৳${engToBdNumHelper(totalPrice)} <span>/ ${engToBdNumHelper(weight)} কেজি</span>`;
          }
        }
      }
    });
  });

  // Event Listeners for Order Now buttons
  const orderNowBtns = document.querySelectorAll('.order-now-btn');

  function handleOrder(e) {
    const btn = e.target;
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    const price = parseInt(btn.getAttribute('data-price'));
    
    const weightSelect = document.getElementById(`weight-${id}`);
    const weight = weightSelect ? parseInt(weightSelect.value) : 1;

    // Button feedback before redirect
    const originalText = btn.textContent;
    btn.textContent = 'অপেক্ষা করুন...';
    btn.style.background = '#2E7D32';
    btn.style.color = '#fff';
    
    setTimeout(() => {
      addToCartAndRedirect(id, name, price, weight);
      // Reset after a tiny delay in case redirect is slow
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 500);
    }, 300);
  }

  orderNowBtns.forEach(btn => {
    btn.addEventListener('click', handleOrder);
  });
}
