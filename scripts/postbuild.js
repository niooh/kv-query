import { readFileSync, writeFileSync, existsSync, unlinkSync, rmSync } from 'fs';
import { minify } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';

let html = readFileSync('dist/index.html', 'utf8');

// 内联 JS（用 DOMContentLoaded 包装，保证 DOM 就绪）
const scriptMatch = html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/);
if (scriptMatch) {
  const jsPath = 'dist/' + scriptMatch[1].replace(/^\//, '');
  if (existsSync(jsPath)) {
    const js = readFileSync(jsPath, 'utf8');
    const out = await minifyJs(js, { compress: true, mangle: true });
    html = html.replace(scriptMatch[0], () =>
      `<script>document.addEventListener('DOMContentLoaded',() => {${out.code || js}})</script>`
    );
    try { unlinkSync(jsPath); } catch {}
  }
}

// 内联 CSS
const cssMatch = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/);
if (cssMatch) {
  const cssPath = 'dist/' + cssMatch[1].replace(/^\//, '');
  if (existsSync(cssPath)) {
    let css = readFileSync(cssPath, 'utf8');
    css = css.replace(/url\(\/assets\//g, 'url(./assets/');
    html = html.replace(cssMatch[0], () => `<style>${css}</style>`);
    try { unlinkSync(cssPath); } catch {}
  }
}

// 清理空 assets 目录
try { rmSync('dist/assets', { recursive: true, force: true }); } catch {}

// 压缩 HTML
const minified = await minify(html, {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: true
});
writeFileSync('dist/index.html', minified);
console.log('Done');
