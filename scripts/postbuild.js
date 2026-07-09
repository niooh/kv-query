import { readFileSync, writeFileSync, existsSync, unlinkSync, rmSync, readdirSync } from 'fs';

let html = readFileSync('dist/index.html', 'utf8');

// 内联 JS，用 DOMContentLoaded 包装
const scriptRegex = /<script[^>]+src="([^"]+)"[^>]*><\/script>/;
let match;
while ((match = html.match(scriptRegex))) {
  const src = match[1];
  const jsPath = 'dist/' + src.replace(/^\//, '');
  if (existsSync(jsPath)) {
    const js = readFileSync(jsPath, 'utf8');
    html = html.replace(match[0], () =>
      `<script>document.addEventListener('DOMContentLoaded',() => {${js}})</script>`
    );
    try { unlinkSync(jsPath); } catch {}
  }
}

// 内联 CSS
const cssRegex = /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/;
while ((match = html.match(cssRegex))) {
  const href = match[1];
  const cssPath = 'dist/' + href.replace(/^\//, '');
  if (existsSync(cssPath)) {
    let css = readFileSync(cssPath, 'utf8');
    css = css.replace(/url\(\/assets\//g, 'url(./assets/');
    html = html.replace(match[0], () => `<style>${css}</style>`);
    try { unlinkSync(cssPath); } catch {}
  }
}

// 清理 assets 目录，保留 .woff2 字体
const assetsDir = 'dist/assets';
if (existsSync(assetsDir)) {
  for (const file of readdirSync(assetsDir)) {
    if (!file.endsWith('.woff2')) {
      try { unlinkSync(assetsDir + '/' + file); } catch {}
    }
  }
  try {
    if (!readdirSync(assetsDir).length) rmSync(assetsDir, { recursive: true, force: true });
  } catch {}
}

writeFileSync('dist/index.html', html);
console.log('✓ Post-build done');
