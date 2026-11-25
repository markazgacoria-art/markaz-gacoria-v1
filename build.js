const fs = require('fs');
const path = require('path');

console.log('Building standalone HTML for Vercel deployment...');

const indexFile = path.join(__dirname, 'index.html');
const cssFile = path.join(__dirname, 'css.html');
const modalsFile = path.join(__dirname, 'modals.html');
const jsFile = path.join(__dirname, 'js.html');
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

let indexHtml = fs.readFileSync(indexFile, 'utf8');
const cssContent = fs.readFileSync(cssFile, 'utf8');
const modalsContent = fs.readFileSync(modalsFile, 'utf8');
const jsContent = fs.readFileSync(jsFile, 'utf8');

// Replace GAS template include tags
indexHtml = indexHtml.replace(/<\?!\s*include\('css'\);\s*\?>/g, `<style>\n${cssContent}\n</style>`);
indexHtml = indexHtml.replace(/<\?!\s*include\('modals'\);\s*\?>/g, `\n${modalsContent}\n`);
indexHtml = indexHtml.replace(/<\?!\s*include\('js'\);\s*\?>/g, `<script>\n${jsContent}\n</script>`);

const outputFile = path.join(publicDir, 'index.html');
fs.writeFileSync(outputFile, indexHtml, 'utf8');

console.log('Build complete! Output generated at:', outputFile);
