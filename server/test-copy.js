import fs from 'fs';
try {
  const data = fs.readFileSync('/Users/eugeniucazmal/.gemini/antigravity-ide/brain/050e1ac0-b533-40cd-9d91-2fd11c85b243/breakfast_plate_embossed_1781098146618.png');
  fs.writeFileSync('/Users/eugeniucazmal/Downloads/dev_office/nutri-plan-plus/public/images/healthy_breakfast.png', data);
  console.log('SUCCESS!');
} catch (e) {
  console.error(e);
}
