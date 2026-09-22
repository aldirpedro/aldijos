// Junta CSS e JS num único HTML (dist/aldijos.html) e gera a versão para artefacto (dist/artifact.html).
// Uso: node scripts/build.js
const fs = require('fs');
const path = require('path');

const pub = path.join(__dirname, '..', 'public');
const dist = path.join(__dirname, '..', 'dist');
fs.mkdirSync(dist, { recursive: true });

let html = fs.readFileSync(path.join(pub, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(pub, 'styles.css'), 'utf8');
html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}\n</style>`);
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, file) => {
  const js = fs.readFileSync(path.join(pub, file), 'utf8');
  if (js.includes('</script')) throw new Error(`${file} contém </script`);
  return `<script>\n${js}\n</script>`;
});
// incorpora todas as imagens (data URI): o ficheiro único não depende de pedidos de rede para imagens
const assets = {};
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(jpe?g|png)$/i.test(f.name)) assets[path.relative(pub, p).split(path.sep).join('/')] = `data:image/${/png$/i.test(f.name) ? 'png' : 'jpeg'};base64,` + fs.readFileSync(p).toString('base64');
  }
})(path.join(pub, 'img'));
{ const i = html.indexOf('<script>'); html = html.slice(0, i) + `<script>\nwindow.ASSETS = ${JSON.stringify(assets)};\n</script>\n` + html.slice(i); }
if (!html.includes('window.ASSETS')) throw new Error('não foi possível inserir ASSETS');
fs.writeFileSync(path.join(dist, 'aldijos.html'), html);

// versão sem <!doctype>/<html>/<head>/<body>, para publicar como artefacto
const fragment = html
  .replace(/<!doctype html>\s*/i, '').replace(/<html[^>]*>\s*/i, '').replace(/<\/html>\s*/i, '')
  .replace(/<head>\s*/i, '').replace(/<\/head>\s*/i, '').replace(/<body>\s*/i, '').replace(/<\/body>\s*/i, '')
  .replace(/<meta charset[^>]*>\s*/i, '').replace(/<meta name="viewport"[^>]*>\s*/i, '');
fs.writeFileSync(path.join(dist, 'artifact.html'), fragment);
console.log('dist/aldijos.html', Math.round(html.length / 1024) + ' KB;', 'dist/artifact.html', Math.round(fragment.length / 1024) + ' KB');
