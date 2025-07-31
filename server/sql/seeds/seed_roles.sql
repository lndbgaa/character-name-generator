INSERT INTO roles (id, label, display_name) VALUES
(1, 'admin', 'Administrator'),
(2, 'user', 'User')
ON DUPLICATE KEY UPDATE 
  display_name = VALUES(display_name);