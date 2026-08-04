-- Create form_submissions table for tracking Google Forms submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_type ENUM('isp_registration', 'customer_registration', 'job_request') NOT NULL,
  email VARCHAR(255) NOT NULL,
  form_data JSON NOT NULL,
  webhook_received DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  account_created DATETIME,
  user_id CHAR(36),
  email_sent DATETIME,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_form_type (form_type),
  INDEX idx_status (status),
  INDEX idx_webhook_received (webhook_received)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;