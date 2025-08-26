INSERT INTO universes (label, display_name, description) 
VALUES
('fantasy', 'Fantasy', 'Names inspired by fantasy literature and creatures.'),
('sci_fi', 'Science Fiction', 'Futuristic and science-fiction inspired names.')
ON DUPLICATE KEY UPDATE 
  display_name = VALUES(display_name),
  description = VALUES(description);