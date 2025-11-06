-- =============================================================================
-- INSTRUCȚIUNI: Mergi pe https://hayliepomroy.com/blogs/recipes
-- Caută fiecare rețetă din listă, copiază URL-ul pozei și actualizează aici
-- =============================================================================

-- Exemplu de actualizare (ÎNLOCUIEȘTE cu URL real de pe site):
-- UPDATE recipes SET image_url = 'https://hayliepomroy.com/cdn/shop/articles/...' WHERE name_ro = 'NUME_RETETA';

-- LISTA REȚETE DIN CARTE care TREBUIE să aibă poze de pe hayliepomroy.com:
-- (verifică pe site dacă există)

-- ETAPA 1 - BREAKFAST
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'MANGO CONGELAT DAT PRIN BLENDER';
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'FRUCTE și OVAZ DATE PRIN BLENDER';
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'TERCI DE OVAZ';
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'FRIGANELE CU CAPSUNE';

-- ETAPA 1 - LUNCH
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'SALATA DE TON, MAR VERDE $1 SPANAC';
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'TARTINA DE CURCAN';
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'CURCAN INVELIT IN LIPIE DE GRAU GERMINAT';

-- ETAPA 1 - DINNER
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'SUPA DE PUI CU ORZ';
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'CHILI CU CURCAN';
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'PUI CU BROCCOLI';
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'FILE MIGNON CU OREZ BRUN';

-- ETAPA 2 - LUNCH
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'OMLETA SPANIOLA DE ALBUSURI DE OU';
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'HALIBUT CU SPARANGHEL';

-- ETAPA 3 - DINNER
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'CURRY DE PUI CU NUCA DE COCOS';
-- UPDATE recipes SET image_url = 'URL_DE_PE_SITE' WHERE name_ro = 'SOMON COPT CU CARTOFI DULCI';

-- =============================================================================
-- DUPĂ CE AI COMPLETAT URL-URILE, RULEAZĂ:
-- psql -d nutriplan -f update-images-from-haylie.sql
-- =============================================================================

-- Lista completă pentru verificare:
SELECT id, name_ro, name_en, image_url FROM recipes ORDER BY phase, meal_type, name_ro;
