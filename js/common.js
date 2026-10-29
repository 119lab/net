(async function () {
  const base = new URL('../', document.currentScript.src);
  async function part(path) {
    const response = await fetch(new URL(path, base));
    if (!response.ok) throw new Error('Common part unavailable: ' + path);
    return response.text();
  }
  try {
    const [header, menu, footer] = await Promise.all([
      part('parts/header.html'), part('parts/menu.html'), part('parts/footer.html')
    ]);
    document.getElementById('common-header').innerHTML = header;
    document.getElementById('common-menu').outerHTML = menu;
    document.getElementById('common-footer').innerHTML = footer;
    function normalize(path) { return path.replace(/index\.html$/, '').replace(/\/$/, ''); }
    const current = normalize(location.pathname);
    document.querySelectorAll('header nav a, footer nav a').forEach(link => {
      if (normalize(new URL(link.href).pathname) === current) link.setAttribute('aria-current', 'page');
    });
    const script = document.createElement('script');
    script.src = new URL('js/lightbox.js?v=20261029-shared', base).href;
    document.body.appendChild(script);
  } catch (error) {
    console.error(error);
    const message = document.createElement('p');
    message.textContent = '共通メニューを読み込めませんでした。ページを再読み込みしてください。';
    document.getElementById('common-header').replaceChildren(message);
  }
})();
