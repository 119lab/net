(function () {
  const form = document.getElementById('site-search-form');
  if (!form) return;
  const input = document.getElementById('site-search-input');
  const results = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  const base = new URL('../', document.currentScript.src);
  const records = Array.isArray(window.LAB_SEARCH_INDEX) ? window.LAB_SEARCH_INDEX : null;
  const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase('ja').replace(/\s+/g, ' ').trim();

  function search(query) {
    results.replaceChildren();
    if (!records) {
      status.textContent = '検索データを読み込めませんでした。ページを再読み込みしてください。';
      return;
    }
    const terms = [...new Set(normalize(query).split(' ').filter(Boolean))];
    if (!terms.length) {
      status.textContent = 'キーワードを入力して検索してください。';
      return;
    }
    const matches = records.map((record, order) => {
      const title = normalize(record.title);
      const description = normalize(record.description);
      const category = normalize(record.category);
      const text = normalize(record.text);
      const combined = [title, description, category, text].join(' ');
      if (!terms.every(term => combined.includes(term))) return null;
      const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 12 : 0) + (description.includes(term) ? 5 : 0) + (category.includes(term) ? 3 : 0) + (text.includes(term) ? 1 : 0), 0);
      return { record, score, order };
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.order - b.order);
    status.textContent = '「' + query + '」の検索結果：' + matches.length + '件';
    if (!matches.length) {
      const message = document.createElement('p');
      message.textContent = '該当するページは見つかりませんでした。キーワードを短くするか、別の言葉でお試しください。';
      results.appendChild(message);
      return;
    }
    const fragment = document.createDocumentFragment();
    matches.forEach(({ record }) => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = new URL(record.url, base).href;
      const category = document.createElement('span');
      category.className = 'search-result-category';
      category.textContent = record.category;
      const title = document.createElement('h2');
      title.textContent = record.title;
      const snippet = document.createElement('p');
      const source = record.text || record.description;
      const normalized = normalize(source);
      const positions = terms.map(term => normalized.indexOf(term)).filter(position => position >= 0);
      const start = positions.length ? Math.max(0, Math.min(...positions) - 35) : 0;
      snippet.textContent = (start ? '…' : '') + source.slice(start, start + 150) + (source.length > start + 150 ? '…' : '');
      link.append(category, title, snippet);
      fragment.appendChild(link);
    });
    results.appendChild(fragment);
  }

  function submit(query, push) {
    query = query.trim().slice(0, 120);
    input.value = query;
    const url = new URL(location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    if (push && url.href !== location.href) history.pushState(null, '', url);
    search(query);
  }
  form.addEventListener('submit', event => { event.preventDefault(); submit(input.value, true); });
  document.querySelectorAll('[data-search-query]').forEach(button => {
    button.addEventListener('click', () => { submit(button.dataset.searchQuery, true); input.focus(); });
  });
  window.addEventListener('popstate', () => submit(new URL(location.href).searchParams.get('q') || '', false));
  submit(new URL(location.href).searchParams.get('q') || '', false);
})();
