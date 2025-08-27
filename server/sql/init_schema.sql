CREATE TABLE universes (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deactivated_at TIMESTAMP NULL,
  archived_at TIMESTAMP NULL,
  INDEX idx_universes_status_display (status, display_name)
);

CREATE TABLE types (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  color_theme JSON NOT NULL,
  icon_url VARCHAR(255) NOT NULL,
  card_image_url VARCHAR(255) NOT NULL,
  background_image_url VARCHAR(255) NOT NULL,
  universe_id INT NOT NULL,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deactivated_at TIMESTAMP NULL,
  archived_at TIMESTAMP NULL,
  FOREIGN KEY (universe_id) REFERENCES universes(id) ON DELETE RESTRICT,
  INDEX idx_types_universe_status (universe_id, status)
);

CREATE TABLE genders (
  id INT NOT NULL PRIMARY KEY,
  label VARCHAR(50) NOT NULL UNIQUE, 
  display_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE type_allowed_genders (
  type_id INT NOT NULL,
  gender_id INT NOT NULL,
  PRIMARY KEY (type_id, gender_id),
  FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE CASCADE,
  FOREIGN KEY (gender_id) REFERENCES genders(id) ON DELETE CASCADE
);

CREATE TABLE names (
  id CHAR(36) NOT NULL PRIMARY KEY,
  value VARCHAR(100) NOT NULL,
  type_id INT NOT NULL,
  gender_id INT NOT NULL,
  length ENUM("short", "medium", "long") NOT NULL,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deactivated_at TIMESTAMP NULL DEFAULT NULL,
  archived_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE RESTRICT,
  FOREIGN KEY (gender_id) REFERENCES genders(id) ON DELETE RESTRICT,
  CONSTRAINT uniq_names_type_value UNIQUE (type_id, value),
  INDEX idx_names_value (value),
  INDEX idx_names_type_status_value (type_id, status, value),
  INDEX idx_names_gender_status_value (gender_id, status, value),
  INDEX idx_names_type_gender_status (type_id, gender_id, status)
);

CREATE TABLE roles (
  id INT NOT NULL PRIMARY KEY,
  label VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  role_id INT NOT NULL DEFAULT 2,
  email VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255) NULL,
  status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  is_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  suspended_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_users_first_name (first_name),
  INDEX idx_users_last_name (last_name),
  INDEX idx_users_role_status_created (role_id, status, created_at),
  INDEX idx_users_status_created (status, created_at)
);

CREATE TABLE email_verification_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(32) NOT NULL UNIQUE,
  status ENUM('active', 'used', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  CHECK (expires_at > created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_email_token_expires (token, expires_at),
  INDEX idx_email_user_status (user_id, status)
);

CREATE TABLE refresh_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(21) NOT NULL UNIQUE,
  status ENUM('active', 'revoked', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  CHECK (expires_at > created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_status_expires (status, expires_at),
  INDEX idx_refresh_user_status (user_id, status)
);

CREATE TABLE password_reset_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(32) NOT NULL UNIQUE,
  status ENUM('active', 'used', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  CHECK (expires_at > created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_status_expires (status, expires_at),
  INDEX idx_reset_user_status (user_id, status)
);

CREATE TABLE favorites (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name_id CHAR(36) NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (name_id) REFERENCES names(id) ON DELETE CASCADE,
  CONSTRAINT uniq_favorites_user_name UNIQUE (user_id, name_id)
);

