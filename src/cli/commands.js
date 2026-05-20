import { parseCommand } from './parser.js';
import {
  HELP,
  hasHelpFlag,
  usageOf,
  commandHelpText,
  allHelpText,
} from './help.js';
import { getEntries, getFreqMap, setEntries, importEntries } from '../core/data.js';
import { search } from '../core/query.js';
import { parseKVText, escapeKVKey, formatKVEntry } from '../core/kvFormat.js';

// 搜索命令
function cmdGet(app, args) {
  const opt = args[0];
  const terms = args.slice(1);

  let results;
  switch (opt) {
    case '-a':
      results = getEntries();
      break;
    case '-s':
      results = search(terms, true, false);
      break;
    case '-sa':
      results = search(terms, true, true);
      break;
    case '-c':
      results = search(terms, false, false);
      break;
    case '-ca':
      results = search(terms, false, true);
      break;
    default:
      throw new Error(`unknown option: ${opt}\n${usageOf('get')}`);
  }
  app.setResults(results);
}

// 编辑命令：弹出全屏编辑器，保存后更新数据
function cmdEdit(app) {
  const text = entriesToText();
  app.showEditor(text, (newText) => {
    const parsed = parseKVText(newText);
    if (parsed.tags.length) {
      setEntries(parsed.tags.map(t => ({ k: t.key, v: t.value })));
      for (const [k, v] of Object.entries(parsed.freqs)) {
        app.state.freqMap[k] = v;
      }
      app.log(`saved (${getEntries().length} entries)`);
    }
    app.render();
  });
}

// 导入命令：弹出编辑器，支持 replace / append / overwrite 模式
function cmdImport(app, args) {
  const mode = args[0] === '-a' ? 'append' : args[0] === '-o' ? 'overwrite' : 'replace';
  app.showEditor('', (text) => {
    const parsed = parseKVText(text);
    if (parsed.tags.length) {
      const incoming = parsed.tags.map(t => ({ k: t.key, v: t.value }));
      importEntries(incoming, mode);
      app.log(`imported (mode: ${mode}, ${getEntries().length} entries)`);
    }
    app.render();
  });
}

// 导出命令：默认下载为文本文件，-c 复制到剪贴板
function cmdExport(app, args) {
  const text = entriesToText();

  if (!args.length || args[0] === '-f') {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kv_data.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
    app.log('Exported as kv_data.txt');
    return;
  }

  if (args[0] === '-c') {
    navigator.clipboard.writeText(text).then(() => {
      app.log('Copied to clipboard.');
    }).catch(() => {
      app.log('error: Failed to copy to clipboard.');
    });
    return;
  }

  throw new Error(`unknown option: ${args[0]}\n${usageOf('export')}`);
}

// 帮助命令：可查看全部或单个命令的详细帮助
function cmdHelp(app, args) {
  const name = args[0];
  if (name) {
    app.log(commandHelpText(name));
  } else {
    app.log(allHelpText());
  }
}

// 将当前所有条目和频率序列化为可编辑文本
function entriesToText() {
  const entries = getEntries();
  const freqMap = getFreqMap();
  const lines = entries.map(e => formatKVEntry(e.k, e.v));
  lines.push('---');
  for (const e of entries) {
    if (freqMap[e.k] > 0) {
      lines.push(`"${escapeKVKey(e.k)}" ${freqMap[e.k]}`);
    }
  }
  return lines.join('\n');
}

// 命令派发入口，统一处理 -h 帮助标志
export async function runCommand(app, line) {
  const { name, args } = parseCommand(line);
  if (!name) return;

  app.log(`> ${line}`);

  try {
    // 任何非 help 命令携带 -h 或 --help 时，显示该命令的帮助并返回
    if (name !== 'help' && hasHelpFlag(args)) {
      app.log(commandHelpText(name));
      app.render();
      return;
    }

    switch (name) {
      case 'help': case '-h': case 'h':
        cmdHelp(app, args);
        break;
      case 'get':
        cmdGet(app, args);
        break;
      case 'ls':
        cmdGet(app, ['-a']);
        break;
      case 'edit':
        cmdEdit(app);
        break;
      case 'import':
        cmdImport(app, args);
        break;
      case 'export':
        cmdExport(app, args);
        break;
      default:
        throw new Error(`unknown command: ${name}\nType \`help\` to see available commands.`);
    }
  } catch (err) {
    app.log(`error: ${err.message || err}`);
  } finally {
    app.render();
  }
}
