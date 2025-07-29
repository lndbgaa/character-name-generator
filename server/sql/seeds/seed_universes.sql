INSERT INTO universes (label, display_name, description) VALUES
('fantasy', 'Fantasy', 'Names inspired by fantasy literature and creatures.'),
('mythology', 'Mythology', 'Gods, heroes, and mythical beings.'),
('medieval', 'Medieval', 'Historical names from the medieval period.'),
('sci_fi', 'Science Fiction', 'Futuristic and science-fiction inspired names.')
ON DUPLICATE KEY UPDATE label = VALUES(label);