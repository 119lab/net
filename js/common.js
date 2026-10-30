(async function () {
  const base = new URL('../', document.currentScript.src);
  async function part(path) {
    const response = await fetch(new URL(path, base));
    if (!response.ok) throw new Error('Common part unavailable: ' + path);
    const html = await response.text();
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('[href], [src]').forEach(element => {
      ['href', 'src'].forEach(attribute => {
        const value = element.getAttribute(attribute);
        if (value && value.startsWith('/net/')) {
          element.setAttribute(attribute, new URL(value.slice(5), base).href);
        }
      });
    });
    return template.innerHTML;
  }
  // Keep a failed part from hiding other parts that loaded successfully.
  async function availablePart(path, fallback) {
    try {
      return await part(path);
    } catch (error) {
      console.error(error);
      return fallback;
    }
  }

  function normalize(path) {
    return path.replace(/index\.html$/, '').replace(/\/$/, '');
  }

  function markCurrentLinks() {
    const current = normalize(location.pathname);
    document.querySelectorAll('header nav a, footer nav a').forEach(link => {
      if (normalize(new URL(link.href).pathname) === current) link.setAttribute('aria-current', 'page');
    });
  }

  const home = new URL('index.html', base).href;
  const articles = new URL('article/article.html', base).href;
  const sitemap = new URL('sitemap.html', base).href;
  const headerFallback = '<header><div class="wrap headrow">' +
    '<a class="brand" href="' + home + '">119LAB.net</a>' +
    '<div id="common-menu"></div></div></header>';
  const menuFallback = '<nav class="mainnav" aria-label="メインメニュー">' +
    '<a href="' + home + '">ホーム</a>' +
    '<a href="' + articles + '">最新記事</a>' +
    '<a href="' + sitemap + '">サイトマップ</a></nav>';
  const footerFallback = '<footer><div class="wrap">' +
    '<nav aria-label="フッターメニュー"><a href="' + home + '">ホーム</a>　' +
    '<a href="' + sitemap + '">サイトマップ</a></nav></div></footer>';

  // Requests are independent. The menu only waits for its header placeholder.
  const header = availablePart('parts/header.html', headerFallback);
  const menu = availablePart('parts/menu.html', menuFallback);
  const footer = availablePart('parts/footer.html', footerFallback);

  const headerTask = (async function () {
    const target = document.getElementById('common-header');
    if (!target) return;
    target.innerHTML = await header;
    const menuTarget = document.getElementById('common-menu');
    if (menuTarget) menuTarget.outerHTML = await menu;
    markCurrentLinks();

    // Menu and image controls do not wait for the footer request.
    const script = document.createElement('script');
    script.src = new URL('js/lightbox.js?v=20261030-shared', base).href;
    document.body.appendChild(script);
  })();

  const footerTask = (async function () {
    const target = document.getElementById('common-footer');
    if (!target) return;
    target.innerHTML = await footer;
    markCurrentLinks();
  })();

  await Promise.allSettled([headerTask, footerTask]);
})();
