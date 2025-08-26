INSERT INTO genders (id, label, display_name) 
VALUES 
(1,'male', 'Male'),
(2, 'female', 'Female'),
(3, 'neutral', 'Neutral')
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name);
  