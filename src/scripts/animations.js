export function initScrollAnimations() {
  const processCards = document.querySelectorAll('.process-card');
  
  if (processCards.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Find the index of the card to stagger the animation
          const index = Array.from(processCards).indexOf(entry.target);
          
          // Add delay: 1st card 0ms, 2nd card 400ms, 3rd card 800ms
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 400); 
          
          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: "0px 0px -150px 0px" // Trigger animation only when 150px inside viewport
    });

    processCards.forEach(card => observer.observe(card));
  }
}
