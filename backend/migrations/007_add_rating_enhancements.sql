-- Add enhanced rating fields to ratings table
ALTER TABLE ratings 
ADD COLUMN quality DECIMAL(3,2) DEFAULT NULL COMMENT 'Quality of work rating (1-5)',
ADD COLUMN timeliness DECIMAL(3,2) DEFAULT NULL COMMENT 'Timeliness rating (1-5)',
ADD COLUMN professionalism DECIMAL(3,2) DEFAULT NULL COMMENT 'Professionalism rating (1-5)',
ADD COLUMN communication DECIMAL(3,2) DEFAULT NULL COMMENT 'Communication rating (1-5)',
ADD COLUMN overall DECIMAL(3,2) DEFAULT NULL COMMENT 'Overall rating (1-5)',
ADD COLUMN reported BOOLEAN DEFAULT FALSE COMMENT 'Whether rating was reported',
ADD COLUMN report_reason TEXT DEFAULT NULL COMMENT 'Reason for report',
ADD COLUMN reported_by CHAR(36) DEFAULT NULL COMMENT 'User ID who reported',
ADD COLUMN reported_at DATETIME DEFAULT NULL COMMENT 'When rating was reported',
ADD COLUMN isp_response TEXT DEFAULT NULL COMMENT 'ISP response to rating',
ADD COLUMN responded_at DATETIME DEFAULT NULL COMMENT 'When ISP responded',
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing ratings to use overall as rating if exists
UPDATE ratings SET overall = rating WHERE overall IS NULL AND rating IS NOT NULL;

-- Add indexes for performance
CREATE INDEX idx_ratings_isp_id ON ratings(isp_id);
CREATE INDEX idx_ratings_customer_id ON ratings(customer_id);
CREATE INDEX idx_ratings_reported ON ratings(reported);
CREATE INDEX idx_ratings_created_at ON ratings(created_at);