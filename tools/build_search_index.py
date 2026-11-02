#!/usr/bin/env python3
"""Rebuild js/search-index.js from public HTML pages (standard library only)."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {
    'index.html', '404.html', 'article/article.html', 'series/index.html',
    'article/tech.html', 'article/voice.html', 'article/science.html',
    'search/search.html',
}


class PageText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_main = False
        self.in_h1 = False
        self.skips = []
        self.title = []
        self.text = []
        self.description = ''
        self.noindex = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            if attrs.get('name') == 'description':
                self.description = attrs.get('content', '')
            if attrs.get('name') == 'robots' and 'noindex' in attrs.get('content', ''):
                self.noindex = True
        if tag == 'main':
            self.in_main = True
        if not self.in_main:
            return
        if tag in ('script', 'style', 'noscript', 'nav', 'form'):
            self.skips.append(tag)
        if tag == 'h1':
            self.in_h1 = True

    def handle_endtag(self, tag):
        if tag == 'h1':
            self.in_h1 = False
        if self.skips and self.skips[-1] == tag:
            self.skips.pop()
        if tag == 'main':
            self.in_main = False

    def handle_data(self, text):
        if self.in_main and not self.skips:
            self.text.append(text)
            if self.in_h1:
                self.title.append(text)


def tidy(parts):
    return re.sub(r'\s+', ' ', ' '.join(parts)).strip()


def category(path, source):
    if path.startswith('voice/yoboki-'):
        return '連載｜予防課員のボヤキ'
    if path.startswith('series/rescue-'):
        return '連載｜救助の「なぜ？」を考える'
    if path.startswith('series/equipment-'):
        return '連載｜わたしは救急資器材'
    if path.startswith('series/'):
        return '連載｜ある消防士が大事にしていること'
    if path.startswith('article/a'):
        match = re.search(r'119(?:TECH|VOICE|SCIENCE)', source)
        if match:
            return match.group(0)
    if path.startswith('news/'):
        return 'お知らせ'
    return 'ご案内'


records = []
for file in sorted(ROOT.rglob('*.html')):
    path = file.relative_to(ROOT).as_posix()
    if path in EXCLUDED or path.startswith(('parts/', 'tools/')):
        continue
    source = file.read_text(encoding='utf-8')
    parser = PageText()
    parser.feed(source)
    if parser.noindex or not parser.title:
        continue
    records.append({
        'title': tidy(parser.title),
        'description': parser.description,
        'url': path,
        'category': category(path, source),
        'text': tidy(parser.text),
    })

payload = json.dumps(records, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
target = ROOT / 'js/search-index.js'
target.write_text('window.LAB_SEARCH_INDEX = ' + payload + ';\n', encoding='utf-8')
print(f'Indexed {len(records)} pages: {target.name}')
