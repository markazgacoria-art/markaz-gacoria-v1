const fs = require('fs');
const path = require('path');

console.log('Building standalone HTML and PWA assets for Vercel deployment...');

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

// Replace GAS template include tags using callback functions to prevent '$' character corruption
indexHtml = indexHtml.replace(/<\?!=\s*include\(['"]css['"]\);\s*\?>/g, () => cssContent);
indexHtml = indexHtml.replace(/<\?!=\s*include\(['"]modals['"]\);\s*\?>/g, () => modalsContent);
indexHtml = indexHtml.replace(/<\?!=\s*include\(['"]js['"]\);\s*\?>/g, () => jsContent);

const outputFile = path.join(publicDir, 'index.html');
fs.writeFileSync(outputFile, indexHtml, 'utf8');

// Copy PWA files to public directory
const pwaFiles = ['manifest.json', 'sw.js', 'logo.jpg', 'icon-192.jpg', 'icon-512.jpg'];
for (const file of pwaFiles) {
  const src = path.join(__dirname, file);
  const dest = path.join(publicDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

console.log('Build complete! Output file size:', fs.statSync(outputFile).size, 'bytes');
