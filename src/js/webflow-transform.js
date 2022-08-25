function transformDOM(window) {
  const tag = window.document.createElement('script');
  tag.setAttribute('src', 'js/index.js');
  window.document.body.appendChild(tag);
}

function transformHTML(html) {
  // Remove comments
  const newHtml = html.replace(/\/\/\s.*/g, '');
  return newHtml;
}

exports.transformDOM = transformDOM;
exports.transformHTML = transformHTML;
