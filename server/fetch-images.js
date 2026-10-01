import fs from 'fs';
import https from 'https';
import path from 'path';

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  const prompts = [
    {
      name: 'healthy_breakfast.jpg',
      url: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=800&q=80'
    },
    {
      name: 'healthy_lunch.jpg',
      url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80'
    },
    {
      name: 'healthy_dinner.jpg',
      url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80'
    }
  ];

  for (const item of prompts) {
    const dest = path.join(imagesDir, item.name);
    console.log(`Downloading ${item.name}...`);
    try {
      await download(item.url, dest);
      console.log(`Saved ${item.name}`);
    } catch (err) {
      console.error(`Failed to download ${item.name}:`, err);
    }
  }
}

main();
