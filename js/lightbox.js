(function () {
  if (document.body.dataset.siteUiInitialized === 'true') return;
  document.body.dataset.siteUiInitialized = 'true';

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
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') setOpen(false); });
    document.addEventListener('click', function (event) { if (!nav.parentNode.contains(event.target)) setOpen(false); });
  });

  const images = document.querySelectorAll('img:not(.brand img)');
  if (!images.length) return;
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = '<button class="lightbox-close" aria-label="画像を閉じる">×</button><img alt=""><p>画像をクリックすると閉じます</p>';
  document.body.appendChild(overlay);
  const large = overlay.querySelector('img');
  function close() { overlay.classList.remove('is-open'); document.body.classList.remove('lightbox-open'); }
  images.forEach(function (img) { img.classList.add('zoomable'); img.addEventListener('click', function () { large.src = img.currentSrc || img.src; large.alt = img.alt || ''; overlay.classList.add('is-open'); document.body.classList.add('lightbox-open'); }); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay || e.target === large || e.target.classList.contains('lightbox-close')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
