INSERT INTO genders (label, display_name) VALUES 
('male', 'Male'),
('female', 'Female'),
('neutral', 'Neutral')
ON DUPLICATE KEY UPDATE label = VALUES(label);