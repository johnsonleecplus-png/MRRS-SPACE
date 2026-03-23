CREATE DATABASE IF NOT EXISTS website_collection;

USE website_collection;

CREATE TABLE IF NOT EXISTS websites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
