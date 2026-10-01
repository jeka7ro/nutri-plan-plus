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
  const imagesDir = path.join(process.cwd(), '..', 'public', 'images');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  const prompts = [
    {
      name: 'healthy_breakfast.jpg',
      prompt: "A professional food photography shot of a healthy breakfast oatmeal and berries on a ceramic plate. The text 'eatnfit' is 3D EMBOSSED and engraved directly into the ceramic rim of the plate. The letters 'eat' and 'fit' are dark grey, and the 'n' is green. highly detailed, photorealistic."
    },
    {
      name: 'healthy_lunch.jpg',
      prompt: "A professional food photography shot of a healthy lunch salad with salmon and vegetables. The text 'eatnfit' is 3D EMBOSSED and engraved directly into the ceramic rim of the plate or bowl. The letters 'eat' and 'fit' are dark grey, and the 'n' is green. highly detailed, photorealistic."
    },
    {
      name: 'healthy_dinner.jpg',
      prompt: "A professional food photography shot of a healthy dinner with grilled chicken breasts, sweet potatoes and broccoli. The text 'eatnfit' is 3D EMBOSSED and engraved directly into the wooden cutting board or ceramic plate. The letters 'eat' and 'fit' are dark grey, and the 'n' is green. highly detailed."
    }
  ];

  for (const item of prompts) {
    const dest = path.join(imagesDir, item.name);
    console.log(`Downloading ${item.name}...`);
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(item.prompt)}?width=800&height=600&nologo=true`;
      await download(url, dest);
      console.log(`Saved ${item.name}`);
    } catch (err) {
      console.error(`Failed to download ${item.name}:`, err);
    }
  }
}

main();
