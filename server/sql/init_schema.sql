CREATE TABLE universes (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NULL
);

CREATE TABLE types (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  icon_url VARCHAR(255) NULL,
  universe_id INT NOT NULL,
  FOREIGN KEY (universe_id) REFERENCES universes(id) ON DELETE RESTRICT,
  INDEX idx_types_universe_id (universe_id)
);

CREATE TABLE genders (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) NOT NULL UNIQUE, 
  display_name VARCHAR(100) NOT NULL
);

CREATE TABLE names (
  id CHAR(36) NOT NULL PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  type_id INT NOT NULL,
  gender_id INT NOT NULL,
  length ENUM("short", "medium", "long") NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE RESTRICT,
  FOREIGN KEY (gender_id) REFERENCES genders(id) ON DELETE RESTRICT,
  CONSTRAINT uniq_names_name_type UNIQUE (name, type_id),
  INDEX idx_names_type (type_id),
  INDEX idx_names_type_gender (type_id, gender_id)
);

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  role_id INT NOT NULL DEFAULT 2,
  email VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255) NULL,
  status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  suspended_at TIMESTAMP NULL DEFAULT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_users_status (status)
);

CREATE TABLE refresh_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(21) NOT NULL UNIQUE,
  status ENUM('active', 'revoked', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  CHECK (expires_at > created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_status (status),
  INDEX idx_refresh_user_status (user_id, status)
);

CREATE TABLE password_reset_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  status ENUM('active', 'used', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  CHECK (expires_at > created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_status (status),
  INDEX idx_reset_user_status (user_id, status)
);

CREATE TABLE favorites (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name_id CHAR(36) NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (name_id) REFERENCES names(id) ON DELETE CASCADE,
  CONSTRAINT uniq_favorites_user_name UNIQUE (user_id, name_id),
  INDEX idx_favorites_user_id (user_id)
);

