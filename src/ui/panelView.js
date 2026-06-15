import { addFreq } from '../core/data.ts';
import { escapeHTML } from '../core/kvFormat.ts';
import { copyText } from './utils.ts';

export function setupPanel(container) {
  container.innerHTML = '<div class="info">type `help` to get started.</div>';

  let renderToken = 0;
  let currentEntries = [];

  // 复制 + 加频率 + 闪烁
  container.addEventListener('click', (e) => {
    const div = e.target.closest('.entry');
    if (!div || !container.contains(div)) return;

    const item = currentEntries[Number(div.dataset.i)];
    if (!item) return;

    copyText(item.v);
    addFreq(item.k);

    div.style.opacity = '0.55';
    setTimeout(() => { div.style.opacity = ''; }, 200);
  });

  function append(x) {
    if (typeof x === 'string') {
      container.insertAdjacentHTML('beforeend', x);
      container.scrollTop = container.scrollHeight;
      return;
    }

    const entries = x;
    const token = ++renderToken;
    currentEntries = entries;

    let i = 0;
    const batchSize = 400; // 每次渲染 400 条

    function step() {
      if (token !== renderToken) return;

      const frag = document.createDocumentFragment();
      const end = Math.min(i + batchSize, entries.length);

      for (; i < end; i++) {
        const e = entries[i];
        const div = document.createElement('div');
        div.className = 'entry';
        div.dataset.i = String(i);
        div.innerHTML = `<span class="key">${escapeHTML(e.k)}</span>  ${escapeHTML(e.v)}`;
        frag.appendChild(div);
      }

      container.appendChild(frag);

      if (i < entries.length) {
        requestAnimationFrame(step);
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }

    requestAnimationFrame(step);
  }

  append.clear = () => {
    renderToken++;
    currentEntries = [];
    container.innerHTML = '';
  };

  return append;
}