export function initQuiz() {
  const sweetBtn = document.getElementById('quizSweetBtn');
  const sourBtn = document.getElementById('quizSourBtn');
  const resultBox = document.getElementById('quizResult');
  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');

  if(sweetBtn && sourBtn) {
    sweetBtn.addEventListener('click', () => {
      resultTitle.textContent = "আপনার জন্য 'আম্রপালি' পারফেক্ট!";
      resultText.textContent = "আপনি যেহেতু মিষ্টি আম পছন্দ করেন, তাই প্রচণ্ড মিষ্টি ও গাঢ় কমলা রঙের আম্রপালি আপনার সবচেয়ে ভালো লাগবে।";
      resultBox.classList.add('active');
    });

    sourBtn.addEventListener('click', () => {
      resultTitle.textContent = "আপনার জন্য 'ল্যাংড়া' পারফেক্ট!";
      resultText.textContent = "ল্যাংড়া আমের হালকা টক-মিষ্টি স্বাদ এবং অতুলনীয় ঘ্রাণ আপনার মন জয় করে নেবে।";
      resultBox.classList.add('active');
    });
  }
}
