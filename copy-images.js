import fs from 'fs';
import path from 'path';

const sourceDir = '/Users/eugeniucazmal/.gemini/antigravity-ide/brain/050e1ac0-b533-40cd-9d91-2fd11c85b243';
const targetDir = '/Users/eugeniucazmal/Downloads/dev_office/nutri-plan-plus/public/images';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir).filter(f => f.startsWith('healthy_') && f.endsWith('.png'));

for (const file of files) {
  const sourceFile = path.join(sourceDir, file);
  const targetFile = path.join(targetDir, file);
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`Copied ${file}`);
}
