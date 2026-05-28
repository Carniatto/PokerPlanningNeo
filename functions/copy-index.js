const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../dist/poker-planning-neo/browser/index.html');
const destDir = path.resolve(__dirname, 'lib');
const dest = path.join(destDir, 'index.html');

try {
  if (fs.existsSync(src)) {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`Successfully copied ${src} to ${dest}`);
  } else {
    console.warn(`Warning: Source index.html not found at ${src}. SEO functions may not work properly until Angular build is run.`);
  }
} catch (err) {
  console.error('Error copying index.html:', err);
}
