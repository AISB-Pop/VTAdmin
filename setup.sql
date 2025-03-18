USE feur_admin_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id ENUM('admin', 'superadmin', 'user') NOT NULL,
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_amount DECIMAL(10,2),
  status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100),
  ip_address VARCHAR(45),
  success BOOLEAN,
  attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default superadmin user
INSERT INTO users (username, email, password_hash, role_id, status)
VALUES (
  'Super Admin',
  'superadmin@feuroosevelt.edu.ph',
  '$2b$10$8jfkjfkjfkjfkjfkjfkjfK8XkjfkjfkjfkjfkjfkjfkjfkjfkjfkjX',
  'superadmin',
  'active'
); 