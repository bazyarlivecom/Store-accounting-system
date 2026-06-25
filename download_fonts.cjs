const fs = require('fs');
const https = require('https');
const path = require('path');

const cssUrl = "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&family=Lalezar&family=Readex+Pro:wght@200..700&family=Cairo:wght@200..1000&family=Amiri:wght@400;700&family=Changa:wght@200..800&family=Tahoma&display=swap";
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const fontsDir = path.join(process.cwd(), 'public', 'fonts', 'google');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

https.get(cssUrl, { headers: { 'User-Agent': userAgent } }, (res) => {
  let css = '';
  res.on('data', d => css += d);
  res.on('end', async () => {
    let newCss = css;
    const urlRegex = /url\((https:\/\/[^)]+)\)/g;
    let match;
    let index = 0;
    const promises = [];
    
    while ((match = urlRegex.exec(css)) !== null) {
      const fontUrl = match[1];
      const ext = path.extname(new URL(fontUrl).pathname) || '.woff2';
      const filename = `font-${index++}${ext}`;
      const filepath = path.join(fontsDir, filename);
      
      newCss = newCss.replace(fontUrl, `/fonts/google/${filename}`);
      
      promises.push(new Promise((resolve, reject) => {
        https.get(fontUrl, (fontRes) => {
          const fileStream = fs.createWriteStream(filepath);
          fontRes.pipe(fileStream);
          fileStream.on('finish', () => resolve());
          fileStream.on('error', reject);
        }).on('error', reject);
      }));
    }
    
    await Promise.all(promises);
    fs.writeFileSync(path.join(process.cwd(), 'src', 'google-fonts.css'), newCss);
    console.log('Fonts downloaded and google-fonts.css generated successfully.');
  });
}).on('error', console.error);
