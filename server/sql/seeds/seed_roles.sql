INSERT INTO roles (id, label, display_name) 
VALUES
(1, 'admin', 'Administrator'),
(2, 'user', 'User'),
(3, 'moderator', 'Moderator')
ON DUPLICATE KEY UPDATE 
  display_name = VALUES(display_name);