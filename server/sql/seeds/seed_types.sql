INSERT INTO types (universe_id, label, display_name, description) VALUES 
(1, 'elf', 'Elf', 'Silent guardians of ancient groves, moving gracefully between light and shadow.'),
(1, 'human', 'Human', 'Mortal souls forged by will, shaped by both hope and despair, bearers of unpredictable fates.'),
(1, 'dragon', 'Dragon', 'Beings of fire and ash, wings that blaze trails through the ages.'),
(1, 'orc', 'Orc', 'Fierce warriors with unyielding spirits, born from the wild chaos of the battlefield.'),
(1, 'fairy', 'Fairy', 'Sparkling spirits of mischief, masters of fleeting games and enchantments.'),
(1, 'angel', 'Angel', 'Luminous sentinels of the skies, their wings bearing the dreams and faith of the righteous.'),
(1, 'vampire', 'Vampire', 'Elegant shadows cloaked in night, lips delivering a sweet, eternal poison.'),
(1, 'demon', 'Demon', 'Embodiment of chaos, seductive and destructive, whisperer of forbidden temptations.'),
(1, 'wizard', 'Wizard', 'Architects of arcane, weavers of realities and masters of magical breath.'),
(1, 'witch', 'Witch', 'Sisters of the moon, weaving shadows and spells scented with ancient lore.'),
(1, 'siren', 'Siren', 'Voices of foam and mystery, luring lost souls toward singing abysses.'),
(1, 'goblin', 'Goblin',  'Cunning and nimble tricksters thriving in shadows and forgotten places.'),
(1, 'harpy', 'Harpy', 'Winged hunters of the storm, their cries echo like thunder across desolate skies.'),
(1, 'werewolf', 'Werewolf', 'Wild spirits caught between two natures, their howls tear through the lunar night.'),
(1, 'pirate', 'Pirate', 'Free sailors breaking the chains of kingdoms, masters of waves and legends.')
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  description = VALUES(description);