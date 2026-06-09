export function initChatWidget() {
  const widgetContainer = document.getElementById('chatWidgetContainer');
  const mainBtn = document.getElementById('chatMainBtn');

  if (mainBtn && widgetContainer) {
    mainBtn.addEventListener('click', () => {
      widgetContainer.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!widgetContainer.contains(e.target)) {
        widgetContainer.classList.remove('active');
      }
    });
  }
}
