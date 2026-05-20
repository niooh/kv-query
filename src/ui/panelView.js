import { addFreq } from '../core/data.js';
import { escapeHTML } from '../core/kvFormat.js';

/**
 * 渲染主面板
 * @param {object} app 应用实例
 * @param {HTMLElement} container 面板容器
 */
export function renderPanel(app, container) {
  container.innerHTML = '';

  // 如果有编辑器打开，面板不显示其他内容，仅显示一个提示（可调整）
  // 这里我们只处理两种状态：显示日志或搜索结果
  // 简单起见，始终先显示日志，再显示当前结果列表（类似原版行为）

  // 显示日志
  const logs = app.state.logs;
  if (logs.length) {
    for (const line of logs) {
      const div = document.createElement('div');
      div.className = line.startsWith('>') ? 'cmd-line' : (line.startsWith('error:') ? 'err' : 'info');
      div.textContent = line;
      container.appendChild(div);
    }
  }

  // 显示结果列表
  const results = app.state.results;
  if (results && results.length) {
    // 按频率排序
    const sorted = [...results].sort((a, b) =>
      (app.state.freqMap[b.k] || 0) - (app.state.freqMap[a.k] || 0)
    );

    for (const e of sorted) {
      const div = document.createElement('div');
      div.innerHTML = `<span class="key">${escapeHTML(e.k)}</span><span class="sep"> : </span><span class="val">${escapeHTML(e.v)}</span>`;

      // 点击复制 + 频率 + 闪烁反馈
      div.addEventListener('click', () => {
        // 复制逻辑（使用 execCommand 确保兼容）
        const ta = document.createElement('textarea'); // textarea 可以保留换行等
        ta.value = e.v;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Copy failed:', err);
        }
        document.body.removeChild(ta);

        addFreq(e.k);

        // 闪烁反馈
        div.style.opacity = '0.55';
        setTimeout(() => { div.style.opacity = ''; }, 200);
      });
    
      container.appendChild(div);
    }
  } else if (!logs.length) {
    container.innerHTML = '<div class="info">No data. Type <code>help</code> to get started.</div>';
  }

  // 滚动到底部
  container.scrollTop = container.scrollHeight;
}
