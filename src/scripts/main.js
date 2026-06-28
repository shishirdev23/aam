import { initQuiz } from './quiz.js';
import { initChatWidget } from './chat-widget.js';
import { initScrollAnimations } from './animations.js';
import { initCart } from './cart.js';

// Initialize App
console.log("Mango Marketplace UI Initialized!");
initQuiz();
initChatWidget();
initScrollAnimations();
initCart();

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Cart logic moved to cart.js
