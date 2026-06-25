import { addFreq, load } from '../core/data.ts';
import { escapeHTML } from '../core/kvFormat.ts';
import { runCommand } from '../cli/commands.ts';
import { setupPanel } from './panelView.js';
import { copyText } from './dom.ts';

export function createApp(root) {
  const state = { logs: [] };
  const panel = document.getElementById('panel');
  const appendLog = setupPanel(panel);

  const app = {
    state,

    // 输出日志
    log(msg) {
      state.logs.push(msg);
      appendLog(msg);
    },

    logInfo(msg) {
      this.log(`<div class="info">${escapeHTML(msg)}</div>`);
    },

    clearLogs() {
      state.logs = [];
      appendLog.clear();
    },
  
    // 渲染条目
    renderEntries(entries) {
      appendLog(entries);
    },
   
    // 弹出全屏编辑器
    showEditor(text, onSave) {
      const overlay = document.createElement('div');
      overlay.className = 'edit-overlay';
      const box = document.createElement('div');
      box.className = 'edit-box';

      const ta = document.createElement('textarea');
      ta.value = text;

      const actions = document.createElement('div');
      actions.className = 'edit-actions';

      const btnSave = document.createElement('button');
      btnSave.className = 'btn-save';
      btnSave.textContent = 'Save';
      const btnCancel = document.createElement('button');
      btnCancel.className = 'btn-cancel';
      btnCancel.textContent = 'Cancel';

      actions.append(btnSave, btnCancel);
      box.append(ta, actions);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      ta.focus();

      btnSave.onclick = () => {
        onSave(ta.value);
        overlay.remove();
      };
      btnCancel.onclick = () => {
        overlay.remove();
      };
    },
  };

  // 初始化
  load();

  // 绑定 CLI 表单
  const form = root.querySelector('#cliForm');
  const input = root.querySelector('#cliInput');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const line = input.value.trim();
    if (!line) return;
    input.value = '';
    await runCommand(app, line);
    input.focus();
  });
  return app;
}
