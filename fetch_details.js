const https = require('https');

function fetch(urlStr) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    };
    https.get(urlStr, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function getGomBatTrangProducts() {
  // Fetch specific category pages for more relevant images
  const pages = [
    'https://gomsubattrang.com/san-pham/am-chen-su-bat-trang.html',
    'https://gomsubattrang.com/san-pham/lo-hoa-binh-hoa.html',
    'https://gomsubattrang.com/san-pham/lo-loc-binh-su-bat-trang.html',
    'https://gomsubattrang.com/san-pham/tuong-gom-su-bat-trang.html',
    'https://gomsubattrang.com/san-pham/do-tho-cung-men-mau.html',
    'https://gomsubattrang.com/san-pham/den-ngu-va-den-trang-tri.html',
    'https://gomsubattrang.com/san-pham/bo-bat-dia-ban-an-su-bat-trang.html',
    'https://gomsubattrang.com/san-pham/gom-su-phong-thuy.html',
  ];
  
  for (const url of pages) {
    try {
      const html = await fetch(url);
      const regex = /<img[^>]+src="([^">]*Images\/[Ss]an[Pp]ham[^">]*)"/gi;
      let match;
      const imgs = new Set();
      while ((match = regex.exec(html)) !== null) {
        let src = match[1];
        if (src.startsWith('/')) src = 'https://gomsubattrang.com' + src;
        else if (!src.startsWith('http')) src = 'https://gomsubattrang.com/' + src;
        // Get full size image by removing Thumb_ prefix
        const fullSrc = src.replace('Thumb_', '');
        imgs.add(fullSrc);
      }
      console.log(`\n=== ${url.split('/').pop()} ===`);
      [...imgs].slice(0, 3).forEach(i => console.log(i));
    } catch(e) {
      console.error(`Error on ${url}: ${e.message}`);
    }
  }
}

async function getLuaVanPhucProducts() {
  const pages = [
    'https://luavanvanphuc.com/khan-lua-ve-tay-thu-cong',
    'https://luavanvanphuc.com/khan-lua-van',
    'https://luavanvanphuc.com/ca-vat',
    'https://luavanvanphuc.com/vai-lua-to-tam',
    'https://luavanvanphuc.com/ao-dai',
    'https://luavanvanphuc.com/set-qua-tang-ky-niem',
    'https://luavanvanphuc.com/khan-lua-van-to-tam',
  ];
  
  for (const url of pages) {
    try {
      const html = await fetch(url);
      const regex = /<img[^>]+src="([^">]*upload\/product[^">]*)"/gi;
      let match;
      const imgs = new Set();
      while ((match = regex.exec(html)) !== null) {
        let src = match[1];
        if (src.startsWith('/')) src = 'https://luavanvanphuc.com' + src;
        else if (!src.startsWith('http')) src = 'https://luavanvanphuc.com/' + src;
        imgs.add(src);
      }
      console.log(`\n=== ${url.split('/').pop()} ===`);
      [...imgs].slice(0, 3).forEach(i => console.log(i));
    } catch(e) {
      console.error(`Error on ${url}: ${e.message}`);
    }
  }
}

(async () => {
  console.log("========== GỐM BÁT TRÀNG ==========");
  await getGomBatTrangProducts();
  console.log("\n\n========== LỤA VẠN PHÚC ==========");
  await getLuaVanPhucProducts();
})();
