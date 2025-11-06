-- Add benefits to all recipes in both EN and RO

-- PHASE 1 RECIPES (High carb, low fat - Destress adrenal glands)

-- Breakfast
UPDATE recipes SET 
  benefits_en = 'Rich in complex carbohydrates and fiber, this breakfast helps stabilize blood sugar levels, reduces cortisol, and kickstarts your metabolism for the day. Perfect for Phase 1 adrenal restoration.',
  benefits_ro = 'Bogat în carbohidrați complecși și fibre, acest mic dejun ajută la stabilizarea glicemiei, reduce cortizolul și stimulează metabolismul pentru întreaga zi. Perfect pentru restabilirea suprarenalelor în Faza 1.'
WHERE id = 52; -- Oatmeal with Fruits and Cinnamon

UPDATE recipes SET 
  benefits_en = 'Packed with antioxidants from berries and natural sugars for quick energy. Helps repair cellular damage and supports thyroid function during Phase 1.',
  benefits_ro = 'Plin de antioxidanți din fructe de pădure și zaharuri naturale pentru energie rapidă. Ajută la repararea celulară și susține funcția tiroidei în Faza 1.'
WHERE id = 53; -- Berry Smoothie Bowl

UPDATE recipes SET 
  benefits_en = 'Provides sustained energy from complex carbs and beta-carotene. The quinoa offers complete protein while vegetables deliver essential vitamins for metabolic repair.',
  benefits_ro = 'Oferă energie susținută din carbohidrați complecși și beta-caroten. Quinoa furnizează proteine complete, iar legumele aduc vitamine esențiale pentru repararea metabolică.'
WHERE id = 108; -- Quinoa Bowl with Roasted Vegetables

UPDATE recipes SET 
  benefits_en = 'Whole grains provide steady energy release, while turkey offers lean protein. This combination helps stabilize blood sugar and supports adrenal recovery in Phase 1.',
  benefits_ro = 'Cerealele integrale furnizează eliberare constantă de energie, iar curcanu oferă proteine slabe. Această combinație stabilizează glicemia și susține recuperarea suprarenalelor în Faza 1.'
WHERE id = 109; -- Tropical Protein Smoothie

-- Snacks Phase 1
UPDATE recipes SET 
  benefits_en = 'Natural fruit sugars provide quick energy, while fiber helps maintain steady blood glucose. The cinnamon enhances insulin sensitivity and adds anti-inflammatory properties.',
  benefits_ro = 'Zaharurile naturale din fructe oferă energie rapidă, iar fibrele mențin glicemia stabilă. Scorțișoara îmbunătățește sensibilitatea la insulină și are proprietăți antiinflamatorii.'
WHERE id = 54; -- Apple with Cinnamon

UPDATE recipes SET 
  benefits_en = 'Bromelain enzyme in pineapple aids digestion and reduces inflammation. Natural sugars provide energy while supporting Phase 1 metabolic healing.',
  benefits_ro = 'Enzima bromelină din ananas ajută digestia și reduce inflamația. Zaharurile naturale oferă energie susținând vindecarea metabolică din Faza 1.'
WHERE id = 55; -- Fresh Pineapple

UPDATE recipes SET 
  benefits_en = 'Hydrating and rich in lycopene, watermelon supports cellular repair and provides natural sugars for sustained energy without spiking blood glucose.',
  benefits_ro = 'Hidratant și bogat în licopen, pepenele verde susține repararea celulară și oferă zaharuri naturale pentru energie susținută fără creșteri bruște ale glicemiei.'
WHERE id = 59; -- Watermelon

UPDATE recipes SET 
  benefits_en = 'Rich in vitamins A and C, mango supports immune function and provides natural energy. The fiber content helps maintain stable blood sugar during Phase 1.',
  benefits_ro = 'Bogat în vitaminele A și C, mangoul susține funcția imună și oferă energie naturală. Conținutul de fibre ajută la menținerea stabilă a glicemiei în Faza 1.'
WHERE id = 60; -- Fresh Mango

-- Lunch Phase 1
UPDATE recipes SET 
  benefits_en = 'Lean protein from chicken repairs tissues while brown rice provides sustained energy. Broccoli delivers sulforaphane for liver detox support.',
  benefits_ro = 'Proteinele slabe din pui repară țesuturile, iar orezul brun oferă energie susținută. Broccoli furnizează sulforafan pentru suport în detoxifierea ficatului.'
WHERE id = 56; -- Chicken Breast with Brown Rice and Broccoli

UPDATE recipes SET 
  benefits_en = 'Omega-3 fatty acids from salmon support brain health and reduce inflammation. Quinoa provides complete protein and complex carbs for Phase 1 metabolic repair.',
  benefits_ro = 'Acizii grași omega-3 din somon susțin sănătatea creierului și reduc inflamația. Quinoa oferă proteine complete și carbohidrați complecși pentru repararea metabolică din Faza 1.'
WHERE id = 57; -- Salmon with Quinoa and Asparagus

UPDATE recipes SET 
  benefits_en = 'Plant-based protein from black beans combined with brown rice creates complete amino acid profile. High fiber content supports digestive health and steady energy release.',
  benefits_ro = 'Proteinele vegetale din fasolea neagră combinate cu orezul brun creează un profil complet de aminoacizi. Conținutul ridicat de fibre susține sănătatea digestivă și eliberarea constantă de energie.'
WHERE id = 58; -- Vegan Bowl with Black Beans and Rice

UPDATE recipes SET 
  benefits_en = 'Sweet potato provides complex carbohydrates rich in beta-carotene. Lean turkey protein repairs muscle tissue while supporting Phase 1 metabolic reset.',
  benefits_ro = 'Cartofii dulci furnizează carbohidrați complecși bogați în beta-caroten. Proteinele slabe din curcan repară țesutul muscular susținând resetarea metabolică din Faza 1.'
WHERE id = 110; -- Sweet Potato with Lean Turkey

-- Dinner Phase 1
UPDATE recipes SET 
  benefits_en = 'Whole wheat pasta provides slow-releasing carbs while turkey offers lean protein. This combination promotes overnight cellular repair and metabolic healing.',
  benefits_ro = 'Pastele integrale furnizează carbohidrați cu eliberare lentă, iar curcanu oferă proteine slabe. Această combinație promovează repararea celulară pe timpul nopții și vindecarea metabolică.'
WHERE id = 61; -- Turkey with Whole Wheat Pasta and Vegetables

UPDATE recipes SET 
  benefits_en = 'White fish provides easily digestible protein while jasmine rice offers quick-absorbing carbs. Perfect evening meal for Phase 1 adrenal restoration.',
  benefits_ro = 'Peștele alb oferă proteine ușor digestibile, iar orezul jasmine furnizează carbohidrați cu absorbție rapidă. Cină perfectă pentru restaurarea suprarenalelor în Faza 1.'
WHERE id = 62; -- White Fish with Jasmine Rice

UPDATE recipes SET 
  benefits_en = 'Lean chicken breast combined with nutrient-dense vegetables provides essential amino acids and vitamins for overnight metabolic repair during Phase 1.',
  benefits_ro = 'Pieptul de pui slab combinat cu legume dense în nutrienți oferă aminoacizi esențiali și vitamine pentru repararea metabolică pe timpul nopții în Faza 1.'
WHERE id = 63; -- Grilled Chicken with Mixed Vegetables

-- PHASE 2 RECIPES (High protein, high veg, low carb/fat - Build muscle, burn fat)

-- Breakfast Phase 2
UPDATE recipes SET 
  benefits_en = 'High protein from egg whites builds lean muscle mass. Spinach provides iron and nutrients while keeping calories low for Phase 2 fat burning.',
  benefits_ro = 'Proteinele ridicate din albușuri construiesc masa musculară slabă. Spanacul oferă fier și nutrienți menținând caloriile scăzute pentru arderea grăsimilor în Faza 2.'
WHERE id = 64; -- Egg White Omelette with Spinach

UPDATE recipes SET 
  benefits_en = 'Turkey breast offers ultra-lean protein to preserve muscle during fat loss. Vegetables add volume and nutrients without adding carbs or fats.',
  benefits_ro = 'Pieptul de curcan oferă proteine ultra-slabe pentru a preserva mușchii în timpul pierderii de grăsime. Legumele adaugă volum și nutrienți fără a adăuga carbohidrați sau grăsimi.'
WHERE id = 65; -- Turkey Breast with Vegetables

UPDATE recipes SET 
  benefits_en = 'Pure protein from egg whites maximizes muscle preservation. Tomatoes and peppers provide antioxidants and vitamins with minimal calories.',
  benefits_ro = 'Proteinele pure din albușuri maximizează păstrarea masei musculare. Roșiile și ardeii oferă antioxidanți și vitamine cu calorii minime.'
WHERE id = 111; -- Egg White Scramble with Vegetables

-- Snacks Phase 2  
UPDATE recipes SET 
  benefits_en = 'Ultra-lean protein source that keeps you full. Stimulates muscle protein synthesis while maintaining low calorie intake for Phase 2 fat burning.',
  benefits_ro = 'Sursă de proteine ultra-slabe care menține sațietatea. Stimulează sinteza proteinelor musculare menținând un aport scăzut de calorii pentru arderea grăsimilor în Faza 2.'
WHERE id = 66; -- Sliced Turkey Breast

UPDATE recipes SET 
  benefits_en = 'Hydrating and low in calories, cucumber provides volume without compromising Phase 2 goals. Supports detoxification and keeps you feeling full.',
  benefits_ro = 'Hidratant și sărac în calorii, castravețele oferă volum fără a compromite obiectivele Fazei 2. Susține detoxifierea și menține sațietatea.'
WHERE id = 67; -- Cucumber Slices

UPDATE recipes SET 
  benefits_en = 'Low-calorie, high-volume snack that provides vitamin C and fiber. Perfect for between meals without disrupting Phase 2 fat-burning state.',
  benefits_ro = 'Gustare cu calorii scăzute și volum ridicat care oferă vitamina C și fibre. Perfect între mese fără a perturba starea de ardere a grăsimilor din Faza 2.'
WHERE id = 71; -- Bell Pepper Strips

UPDATE recipes SET 
  benefits_en = 'High water content keeps you hydrated while providing vitamins and minerals. Zero fat content aligns perfectly with Phase 2 requirements.',
  benefits_ro = 'Conținutul ridicat de apă te menține hidratat oferind vitamine și minerale. Conținutul zero de grăsimi se aliniază perfect cu cerințele Fazei 2.'
WHERE id = 72; -- Celery Sticks

-- Lunch Phase 2
UPDATE recipes SET 
  benefits_en = 'Lean white fish provides complete protein for muscle maintenance. Steamed vegetables deliver nutrients and fiber while keeping fat intake minimal.',
  benefits_ro = 'Peștele alb slab oferă proteine complete pentru menținerea musculară. Legumele la abur furnizează nutrienți și fibre menținând aportul minim de grăsimi.'
WHERE id = 68; -- White Fish with Steamed Vegetables

UPDATE recipes SET 
  benefits_en = 'Ultra-lean poultry protein supports muscle preservation during fat loss. Cauliflower provides volume and nutrients with virtually no carbs or fat.',
  benefits_ro = 'Proteinele ultra-slabe din carne de pasăre susțin păstrarea musculară în timpul pierderii de grăsime. Conopida oferă volum și nutrienți cu aproape zero carbohidrați sau grăsimi.'
WHERE id = 69; -- Chicken Breast with Steamed Cauliflower

UPDATE recipes SET 
  benefits_en = 'Lean beef provides iron and B vitamins essential for energy during calorie restriction. Asparagus supports detox while adding fiber.',
  benefits_ro = 'Vita slabă furnizează fier și vitamine B esențiale pentru energie în timpul restricției calorice. Sparanghelul susține detoxifierea adăugând fibre.'
WHERE id = 70; -- Lean Beef with Asparagus

UPDATE recipes SET 
  benefits_en = 'Tuna offers high-quality protein and omega-3s while staying ultra-lean. Mixed greens provide antioxidants and fiber without adding calories.',
  benefits_ro = 'Tonul oferă proteine de înaltă calitate și omega-3 rămânând ultra-slab. Verdețurile mixte furnizează antioxidanți și fibre fără a adăuga calorii.'
WHERE id = 112; -- Tuna Salad with Mixed Greens

-- Dinner Phase 2
UPDATE recipes SET 
  benefits_en = 'Grilled turkey breast delivers maximum protein with minimum fat. Broccoli adds fiber and supports estrogen metabolism during Phase 2 fat burning.',
  benefits_ro = 'Pieptul de curcan la grătar oferă proteine maxime cu grăsime minimă. Broccoli adaugă fibre și susține metabolismul estrogenilor în timpul arderii grăsimilor din Faza 2.'
WHERE id = 73; -- Grilled Turkey with Broccoli

UPDATE recipes SET 
  benefits_en = 'Lean white fish provides easily digestible protein. Zucchini offers volume and nutrients while maintaining Phase 2 low-carb, low-fat requirements.',
  benefits_ro = 'Peștele alb slab oferă proteine ușor digestibile. Dovlecelul furnizează volum și nutrienți menținând cerințele Fazei 2 de carbohidrați și grăsimi scăzute.'
WHERE id = 74; -- White Fish with Zucchini

UPDATE recipes SET 
  benefits_en = 'High-protein chicken preserves lean muscle mass overnight. Green beans provide fiber and minerals without compromising Phase 2 fat-burning goals.',
  benefits_ro = 'Puiul bogat în proteine păstrează masa musculară slabă pe timpul nopții. Fasolea verde oferă fibre și minerale fără a compromite obiectivele de ardere a grăsimilor din Faza 2.'
WHERE id = 75; -- Chicken Breast with Green Beans

-- PHASE 3 RECIPES (Healthy fats, moderate carbs - Hormonal balance)

-- Breakfast Phase 3
UPDATE recipes SET 
  benefits_en = 'Healthy fats from avocado support hormone production. Eggs provide complete protein and cholesterol needed for cortisol and sex hormone synthesis.',
  benefits_ro = 'Grăsimile sănătoase din avocado susțin producția de hormoni. Ouăle oferă proteine complete și colesterol necesar sintezei cortizolului și hormonilor sexuali.'
WHERE id = 76; -- Avocado with Boiled Eggs

UPDATE recipes SET 
  benefits_en = 'Salmon delivers omega-3 fatty acids critical for reducing inflammation. Eggs add protein while healthy fats support brain function and hormone balance.',
  benefits_ro = 'Somonul furnizează acizi grași omega-3 critici pentru reducerea inflamației. Ouăle adaugă proteine, iar grăsimile sănătoase susțin funcția cerebrală și echilibrul hormonal.'
WHERE id = 77; -- Smoked Salmon with Eggs

UPDATE recipes SET 
  benefits_en = 'Coconut oil provides MCT fats for quick energy and brain fuel. Berries add antioxidants while nuts contribute healthy fats for hormone production.',
  benefits_ro = 'Uleiul de cocos furnizează grăsimi MCT pentru energie rapidă și combustibil cerebral. Fructele de pădure adaugă antioxidanți, iar nucile contribuie cu grăsimi sănătoase pentru producția de hormoni.'
WHERE id = 113; -- Coconut Berry Smoothie

-- Snacks Phase 3
UPDATE recipes SET 
  benefits_en = 'Rich in monounsaturated fats that support cardiovascular health. Provides sustained energy and helps absorb fat-soluble vitamins during Phase 3.',
  benefits_ro = 'Bogat în grăsimi mononesaturate care susțin sănătatea cardiovasculară. Oferă energie susținută și ajută la absorbția vitaminelor liposolubile în Faza 3.'
WHERE id = 78; -- Avocado Slices

UPDATE recipes SET 
  benefits_en = 'Almonds provide vitamin E, magnesium, and healthy fats. Supports brain health, hormone production, and provides long-lasting satiety.',
  benefits_ro = 'Migdalele oferă vitamina E, magneziu și grăsimi sănătoase. Susține sănătatea creierului, producția de hormoni și oferă sațietate de lungă durată.'
WHERE id = 79; -- Raw Almonds

UPDATE recipes SET 
  benefits_en = 'Hummus provides plant-based protein and fiber. Olive oil adds healthy monounsaturated fats essential for hormone balance in Phase 3.',
  benefits_ro = 'Hummusul oferă proteine vegetale și fibre. Uleiul de măsline adaugă grăsimi mononesaturate sănătoase esențiale pentru echilibrul hormonal în Faza 3.'
WHERE id = 83; -- Hummus with Vegetable Sticks

UPDATE recipes SET 
  benefits_en = 'Walnuts are rich in omega-3 ALA, supporting brain health and reducing inflammation. Perfect Phase 3 snack for hormonal balance.',
  benefits_ro = 'Nucile sunt bogate în omega-3 ALA, susținând sănătatea creierului și reducând inflamația. Gustare perfectă pentru Faza 3 și echilibrul hormonal.'
WHERE id = 84; -- Walnuts

-- Lunch Phase 3
UPDATE recipes SET 
  benefits_en = 'Salmon provides omega-3 fats while avocado adds monounsaturated fats. This combination reduces inflammation and supports optimal hormone production.',
  benefits_ro = 'Somonul furnizează grăsimi omega-3, iar avocado adaugă grăsimi mononesaturate. Această combinație reduce inflamația și susține producția optimă de hormoni.'
WHERE id = 80; -- Salmon with Avocado and Vegetables

UPDATE recipes SET 
  benefits_en = 'Chicken provides lean protein while cashews add healthy fats and minerals. The combination supports muscle maintenance and hormone synthesis.',
  benefits_ro = 'Puiul oferă proteine slabe, iar caju-urile adaugă grăsimi sănătoase și minerale. Combinația susține menținerea musculară și sinteza hormonală.'
WHERE id = 81; -- Chicken with Cashews

UPDATE recipes SET 
  benefits_en = 'Tuna offers protein and omega-3s. Olive oil provides monounsaturated fats crucial for Phase 3 hormone balance and anti-inflammatory benefits.',
  benefits_ro = 'Tonul oferă proteine și omega-3. Uleiul de măsline furnizează grăsimi mononesaturate cruciale pentru echilibrul hormonal din Faza 3 și beneficii antiinflamatorii.'
WHERE id = 82; -- Tuna Salad with Olive Oil

UPDATE recipes SET 
  benefits_en = 'Beef provides complete protein, iron, and B vitamins. Healthy fats from cooking oil support hormone production and nutrient absorption.',
  benefits_ro = 'Vita furnizează proteine complete, fier și vitamine B. Grăsimile sănătoase din uleiul de gătit susțin producția de hormoni și absorbția nutrienților.'
WHERE id = 114; -- Beef Stir-Fry with Vegetables

-- Dinner Phase 3
UPDATE recipes SET 
  benefits_en = 'Salmon is rich in omega-3 EPA and DHA for brain health. Quinoa provides complete protein while healthy fats support hormone balance overnight.',
  benefits_ro = 'Somonul este bogat în omega-3 EPA și DHA pentru sănătatea creierului. Quinoa oferă proteine complete, iar grăsimile sănătoase susțin echilibrul hormonal pe timpul nopții.'
WHERE id = 85; -- Grilled Salmon with Quinoa

UPDATE recipes SET 
  benefits_en = 'Chicken provides lean protein while coconut oil adds MCT fats for metabolism. This combination supports muscle recovery and hormonal balance.',
  benefits_ro = 'Puiul oferă proteine slabe, iar uleiul de cocos adaugă grăsimi MCT pentru metabolism. Această combinație susține recuperarea musculară și echilibrul hormonal.'
WHERE id = 86; -- Chicken with Coconut Oil and Vegetables

UPDATE recipes SET 
  benefits_en = 'Lean beef with healthy cooking fats provides nutrients for hormone production. Vegetables add fiber and antioxidants for complete Phase 3 nutrition.',
  benefits_ro = 'Vita slabă cu grăsimi sănătoase de gătit furnizează nutrienți pentru producția de hormoni. Legumele adaugă fibre și antioxidanți pentru nutriție completă în Faza 3.'
WHERE id = 87; -- Beef with Olive Oil and Vegetables

UPDATE recipes SET 
  benefits_en = 'Nuts provide healthy fats, protein, and minerals. Combined with vegetables, this creates optimal Phase 3 hormonal support and metabolic balance.',
  benefits_ro = 'Nucile oferă grăsimi sănătoase, proteine și minerale. Combinate cu legume, creează suport hormonal optimal pentru Faza 3 și echilibru metabolic.'
WHERE id = 115; -- Mixed Nuts and Vegetables

COMMIT;

