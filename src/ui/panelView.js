import { addFreq } from '../core/data.ts';
import { escapeHTML } from '../core/kvFormat.ts';
import { copyText } from './dom.ts';

export function setupPanel(container) {
  container.innerHTML = '<div class="info">type `help` to get started.</div>';

  let renderToken = 0;

  // 点击处理：复制值 + 增加频率 + 闪烁
  container.addEventListener('click', (e) => {
    const div = e.target.closest('.entry');
    if (!div || !container.contains(div)) return;

    // 从 DOM 上取数据
    const key = div.dataset.key;
    const value = div.dataset.value;
    if (key === undefined || value === undefined) return;

    copyText(value);
    addFreq(key);

    // 点击闪烁
    div.style.opacity = '0.55';
    setTimeout(() => {
      div.style.opacity = '';
    }, 150);
  });

  function append(x) {
    if (typeof x === 'string') {
      container.insertAdjacentHTML('beforeend', x);
      container.scrollTop = container.scrollHeight;
      return;
    }

    const entries = x;
    const token = ++renderToken;
    let i = 0;
    const batchSize = 400;

    function step() {
      if (token !== renderToken) return;

      const frag = document.createDocumentFragment();
      const end = Math.min(i + batchSize, entries.length);

      for (; i < end; i++) {
        const e = entries[i];
        const div = document.createElement('div');
        div.className = 'entry';
        // 将键和值直接写入 dataset
        div.dataset.key = e.k;
        div.dataset.value = e.v;
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
    container.innerHTML = '';
  };

  return append;
}
