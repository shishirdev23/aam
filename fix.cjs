const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /(<div class="live-status-badge">[\s\S]*?<\/div>)\s*(<div class="product-image">[\s\S]*?<\/div>)\s*(<div class="product-info">\s*<h3>.*?<\/h3>)/g;

html = html.replace(regex, (match, badge, image, infoAndH3) => {
  let newInfo = infoAndH3.replace(/(<h3>.*?<\/h3>)/, `<div class="title-with-badge" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">\n              $1\n              ${badge.trim()}\n            </div>`);
  return `${image}\n            ${newInfo}`;
});

fs.writeFileSync('index.html', html, 'utf8');
