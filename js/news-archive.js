(function () {
  const target = document.getElementById('news-archive-list');
  if (!target) return;
  const base = new URL('../', document.currentScript.src);
  fetch(new URL('parts/news.html?v=20261101-news', base))
    .then(response => {
      if (!response.ok) throw new Error('News unavailable');
      return response.text();
    })
    .then(html => {
      const template = document.createElement('template');
      template.innerHTML = html;
      template.content.querySelectorAll('a[href]').forEach(link => {
        link.href = new URL(link.getAttribute('href'), base).href;
      });
      const count = template.content.querySelectorAll('.news-item').length;
      target.replaceChildren(template.content);
      document.getElementById('news-count').textContent = count + '件のお知らせ';
    })
    .catch(error => { console.error(error); });
})();
