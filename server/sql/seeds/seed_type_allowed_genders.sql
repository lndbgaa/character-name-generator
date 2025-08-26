-- Elf → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'elf';

-- Human → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'human';

-- Dragon → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'dragon';

-- Orc → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'orc';

-- Fairy → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'fairy';

-- Angel → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'angel';

-- Vampire → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'vampire';

-- Demon → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'demon';

-- Wizard → male only
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label = 'male'
WHERE t.label = 'wizard';

-- Witch → female only
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label = 'female'
WHERE t.label = 'witch';

-- Siren → female only
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label = 'female'
WHERE t.label = 'siren';

-- Goblin → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'goblin';

-- Harpy → female only
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label = 'female'
WHERE t.label = 'harpy';

-- Werewolf → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'werewolf';

-- Pirate → male, female, neutral
INSERT INTO type_allowed_genders (type_id, gender_id)
SELECT t.id, g.id
FROM types t
JOIN genders g ON g.label IN ('male','female','neutral')
WHERE t.label = 'pirate';
