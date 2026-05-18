const https = require('https');
const http = require('http');

function fetchImages(urlStr, callback) {
  const lib = urlStr.startsWith('https') ? https : http;
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  };
  
  lib.get(urlStr, options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Basic regex to find img src tags
      const regex = /<img[^>]+src="([^">]+)"/gi;
      let match;
      const images = [];
      while ((match = regex.exec(data)) !== null) {
        let imgSrc = match[1];
        // Only keep jpg, png, webp
        if (imgSrc.match(/\.(jpg|jpeg|png|webp)/i)) {
           // Resolve relative urls
           if (imgSrc.startsWith('//')) {
             imgSrc = 'https:' + imgSrc;
           } else if (imgSrc.startsWith('/')) {
             const url = new URL(urlStr);
             imgSrc = url.origin + imgSrc;
           }
           images.push(imgSrc);
        }
      }
      callback([...new Set(images)]);
    });
  }).on('error', (e) => {
    console.error(e);
  });
}

const urls = [
  'https://chieucoi.com.vn/shop/',
  'https://luavanvanphuc.com/san-pham',
  'https://gomsubattrang.com/san-pham.html'
];

urls.forEach(url => {
  fetchImages(url, (images) => {
    console.log(`\n--- Images for ${url} ---`);
    console.log(images.slice(0, 10).join('\n'));
  });
});
