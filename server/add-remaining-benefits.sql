-- Add benefits to remaining recipes

-- PHASE 3 cont.
UPDATE recipes SET 
  benefits_en = 'Wild-caught salmon with butter provides omega-3s and healthy fats for hormone production. Lemon aids digestion while supporting Phase 3 metabolic balance.',
  benefits_ro = 'Somonul sălbatic cu unt furnizează omega-3 și grăsimi sănătoase pentru producția de hormoni. Lămâia ajută digestia susținând echilibrul metabolic al Fazei 3.'
WHERE id = 88; -- Baked Salmon with Butter and Lemon

UPDATE recipes SET 
  benefits_en = 'Chicken piccata combines lean protein with healthy fats from butter and olive oil. Supports hormone synthesis and provides sustained energy during Phase 3.',
  benefits_ro = 'Puiul piccata combină proteine slabe cu grăsimi sănătoase din unt și ulei de măsline. Susține sinteza hormonală și oferă energie susținută în Faza 3.'
WHERE id = 89; -- Chicken Piccata

UPDATE recipes SET 
  benefits_en = 'Nutrient-dense shake packed with protein, healthy fats, and antioxidants. Quick energy source that supports all Phase 3 hormonal balance goals.',
  benefits_ro = 'Shake dens în nutrienți, plin de proteine, grăsimi sănătoase și antioxidanți. Sursă rapidă de energie care susține toate obiectivele de echilibru hormonal din Faza 3.'
WHERE id = 101; -- Chia Pudding with Coconut Milk

UPDATE recipes SET 
  benefits_en = 'Greek yogurt provides probiotics for gut health. Nuts and seeds add healthy fats, protein, and minerals essential for hormone production.',
  benefits_ro = 'Iaurtul grecesc oferă probiotice pentru sănătatea intestinală. Nucile și semințele adaugă grăsimi sănătoase, proteine și minerale esențiale pentru producția de hormoni.'
WHERE id = 102; -- Greek Yogurt with Nuts and Seeds

UPDATE recipes SET 
  benefits_en = 'Avocado delivers monounsaturated fats while salmon adds omega-3s. This powerhouse combination optimizes hormone balance and reduces inflammation.',
  benefits_ro = 'Avocado furnizează grăsimi mononesaturate, iar somonul adaugă omega-3. Această combinație puternică optimizează echilibrul hormonal și reduce inflamația.'
WHERE id = 103; -- Avocado Stuffed with Salmon

UPDATE recipes SET 
  benefits_en = 'Arugula provides nitrates for cardiovascular health. Walnuts offer omega-3 ALA while Parmesan adds protein and healthy fats for Phase 3.',
  benefits_ro = 'Rucola furnizează nitrați pentru sănătatea cardiovasculară. Nucile oferă omega-3 ALA, iar Parmezanul adaugă proteine și grăsimi sănătoase pentru Faza 3.'
WHERE id = 104; -- Arugula Salad with Walnuts and Parmesan

UPDATE recipes SET 
  benefits_en = 'Teriyaki sauce adds flavor while salmon provides omega-3s. Broccoli delivers fiber and supports estrogen metabolism during Phase 3.',
  benefits_ro = 'Sosul teriyaki adaugă aromă, iar somonul furnizează omega-3. Broccoli oferă fibre și susține metabolismul estrogenilor în Faza 3.'
WHERE id = 105; -- Teriyaki Salmon with Broccoli

UPDATE recipes SET 
  benefits_en = 'Almonds are rich in vitamin E, magnesium, and healthy monounsaturated fats. Perfect Phase 3 snack for sustained energy and hormonal support.',
  benefits_ro = 'Migdalele sunt bogate în vitamina E, magneziu și grăsimi mononesaturate sănătoase. Gustare perfectă pentru Faza 3 pentru energie susținută și suport hormonal.'
WHERE id = 106; -- Raw Almonds

UPDATE recipes SET 
  benefits_en = 'Eggs provide complete protein and cholesterol for hormone synthesis. Salmon adds omega-3s while avocado contributes heart-healthy monounsaturated fats.',
  benefits_ro = 'Ouăle oferă proteine complete și colesterol pentru sinteza hormonală. Somonul adaugă omega-3, iar avocado contribuie cu grăsimi mononesaturate sănătoase pentru inimă.'
WHERE id = 107; -- Omelet with Smoked Salmon and Avocado

UPDATE recipes SET 
  benefits_en = 'Nicoise salad combines protein-rich tuna and eggs with healthy fats from olive oil. This Mediterranean classic supports Phase 3 hormonal balance perfectly.',
  benefits_ro = 'Salata Nicoise combină tonul bogat în proteine și ouă cu grăsimi sănătoase din ulei de măsline. Acest clasic mediteraneean susține perfect echilibrul hormonal din Faza 3.'
WHERE id = 98; -- Niçoise Salad with Tuna and Eggs

UPDATE recipes SET 
  benefits_en = 'Poblano peppers add metabolism-boosting capsaicin. Pork provides protein while healthy cooking fats support hormone production in Phase 3.',
  benefits_ro = 'Ardeii poblano adaugă capsaicină care stimulează metabolismul. Porcul oferă proteine, iar grăsimile sănătoase de gătit susțin producția de hormoni în Faza 3.'
WHERE id = 99; -- Poblano Pork Chili Verde

UPDATE recipes SET 
  benefits_en = 'Crab is lean protein rich in zinc and selenium. Bell peppers provide vitamin C while healthy fats support Phase 3 hormone synthesis.',
  benefits_ro = 'Crabul este o proteină slabă bogată în zinc și seleniu. Ardeii oferă vitamina C, iar grăsimile sănătoase susțin sinteza hormonală din Faza 3.'
WHERE id = 100; -- Crab-Stuffed Bell Peppers

-- PHASE 1 remaining
UPDATE recipes SET 
  benefits_en = 'Whey protein delivers quick-absorbing amino acids. Tropical fruits provide natural sugars and enzymes that support Phase 1 metabolic healing.',
  benefits_ro = 'Proteina din zer furnizează aminoacizi cu absorbție rapidă. Fructele tropicale oferă zaharuri naturale și enzime care susțin vindecarea metabolică din Faza 1.'
WHERE id = 90; -- Tropical Protein Smoothie

UPDATE recipes SET 
  benefits_en = 'Brown rice and lentils create complete protein profile. High fiber content stabilizes blood sugar while supporting Phase 1 adrenal restoration.',
  benefits_ro = 'Orezul brun și lintea creează un profil complet de proteine. Conținutul ridicat de fibre stabilizează glicemia susținând restaurarea suprarenalelor din Faza 1.'
WHERE id = 91; -- Brown Rice with Lentils and Vegetables

UPDATE recipes SET 
  benefits_en = 'Oats provide beta-glucan fiber for heart health. Baked pears add natural sweetness and pectin that supports digestive health in Phase 1.',
  benefits_ro = 'Ovăzul furnizează fibre beta-glucan pentru sănătatea inimii. Perele coapte adaugă dulceață naturală și pectină care susține sănătatea digestivă în Faza 1.'
WHERE id = 92; -- Oatmeal with Baked Pears

UPDATE recipes SET 
  benefits_en = 'Strawberries are packed with vitamin C and antioxidants. Natural fruit sugars provide quick energy while fiber maintains stable blood glucose during Phase 1.',
  benefits_ro = 'Căpșunile sunt pline de vitamina C și antioxidanți. Zaharurile naturale din fructe oferă energie rapidă, iar fibrele mențin glicemia stabilă în Faza 1.'
WHERE id = 93; -- Fresh Strawberries

-- PHASE 2 remaining
UPDATE recipes SET 
  benefits_en = 'Shrimp offers ultra-lean protein with minimal calories. Mixed salad greens provide volume, fiber, and nutrients perfect for Phase 2 fat burning.',
  benefits_ro = 'Creveții oferă proteine ultra-slabe cu calorii minime. Verdețurile mixte de salată furnizează volum, fibre și nutrienți perfecți pentru arderea grăsimilor din Faza 2.'
WHERE id = 94; -- Grilled Shrimp with Salad

UPDATE recipes SET 
  benefits_en = 'Tofu provides plant-based protein while staying low in fat. Vegetables add nutrients and fiber without compromising Phase 2 fat-loss goals.',
  benefits_ro = 'Tofu oferă proteine vegetale rămânând sărac în grăsimi. Legumele adaugă nutrienți și fibre fără a compromite obiectivele de pierdere în greutate din Faza 2.'
WHERE id = 95; -- Tofu Scramble

UPDATE recipes SET 
  benefits_en = 'Grilled chicken is ultra-lean protein source. Coleslaw provides fiber and crunch while keeping calories minimal for optimal Phase 2 results.',
  benefits_ro = 'Puiul la grătar este sursă de proteine ultra-slabe. Coleslaw-ul oferă fibre și crunch menținând caloriile minime pentru rezultate optime în Faza 2.'
WHERE id = 96; -- Grilled Chicken with Coleslaw

UPDATE recipes SET 
  benefits_en = 'Portobello mushrooms are meaty yet low-calorie. Lean protein filling with vegetables creates satisfying Phase 2 meal without excess fat or carbs.',
  benefits_ro = 'Ciupercile Portobello sunt cărnoase dar sărace în calorii. Umplutura cu proteine slabe și legume creează o masă satisfăcătoare pentru Faza 2 fără grăsimi sau carbohidrați în exces.'
WHERE id = 97; -- Stuffed Portobello Mushrooms

COMMIT;

