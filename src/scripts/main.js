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

// Hero Background Slideshow
const heroSection = document.querySelector('.hero-section');
if (heroSection) {
  const bgImages = [
    '/src/assets/images/hero-bg-1.jpg',
    '/src/assets/images/hero-bg-2.jpg',
    '/src/assets/images/hero-bg-3.jpg'
  ];
  let currentBgIndex = 0;
  
  setInterval(() => {
    currentBgIndex = (currentBgIndex + 1) % bgImages.length;
    heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('${bgImages[currentBgIndex]}')`;
  }, 1500);
}
