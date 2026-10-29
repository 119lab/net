(function () {
  if (document.body.dataset.siteUiInitialized === 'true') return;
  document.body.dataset.siteUiInitialized = 'true';

  const skipLink = document.querySelector('.skip-link');
  if (skipLink) skipLink.addEventListener('click', function (event) {
    const main = document.getElementById('main-content');
    if (main) { event.preventDefault(); main.focus(); main.scrollIntoView({ block: 'start', behavior: 'instant' }); }
  });

  const menus = document.querySelectorAll('header .mainnav');
  if (menus.length) document.body.classList.add('has-hamburger');
  menus.forEach(function (nav, index) {
    if (!nav.id) nav.id = 'site-mainnav-' + (index + 1);
    if (!nav.getAttribute('aria-label')) nav.setAttribute('aria-label', 'メインメニュー');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'menu-toggle';
    button.setAttribute('aria-label', 'メニューを開く');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', nav.id);
    button.innerHTML = '<span></span><span></span><span></span>';
    nav.parentNode.insertBefore(button, nav);
    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    }
    button.addEventListener('click', function () { setOpen(button.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (event) { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setOpen(false); button.focus(); } });
    document.addEventListener('click', function (event) { if (!nav.parentNode.contains(event.target)) setOpen(false); });
  });

  // Only standalone article figures are expandable. Linked thumbnails keep navigation.
  const images = Array.from(document.querySelectorAll('.article-figure img, .series-hero img')).filter(img => !img.closest('a'));
  if (!images.length) return;
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', '画像の拡大表示');
  overlay.hidden = true;
  overlay.innerHTML = '<button type="button" class="lightbox-close" aria-label="画像を閉じる">×</button><img alt=""><p>画像または背景を押すと閉じます</p>';
  document.body.appendChild(overlay);
  const large = overlay.querySelector('img');
  const closeButton = overlay.querySelector('button');
  let trigger = null;
  const inertNodes = [];
  function close() {
    overlay.classList.remove('is-open'); overlay.hidden = true;
    document.body.classList.remove('lightbox-open');
    inertNodes.splice(0).forEach(node => { node.inert = false; });
    if (trigger) trigger.focus();
  }
  function open(img) {
    trigger = img;
    large.src = img.currentSrc || img.src; large.alt = img.alt || '';
    overlay.hidden = false; overlay.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    Array.from(document.body.children).forEach(node => {
      if (node !== overlay && !node.inert && node.tagName !== 'SCRIPT') {
        node.inert = true; inertNodes.push(node);
      }
    });
    closeButton.focus();
  }
  images.forEach(function (img) {
    img.classList.add('zoomable'); img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', (img.alt || '画像') + 'を拡大');
    img.setAttribute('aria-haspopup', 'dialog');
    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(img); }
    });
  });
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay || event.target === large || event.target === closeButton) close();
  });
  overlay.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { event.stopPropagation(); close(); }
    if (event.key === 'Tab') { event.preventDefault(); closeButton.focus(); }
  });
})();
