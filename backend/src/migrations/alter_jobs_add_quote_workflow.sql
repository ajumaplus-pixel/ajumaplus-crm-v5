-- Add quote expiration and tier information to jobs table
ALTER TABLE jobs 
ADD COLUMN quote_expires_at TIMESTAMP NULL COMMENT 'When quotes expire',
ADD COLUMN quote_tier_selected VARCHAR(20) NULL COMMENT 'budget/standard/premium',
ADD COLUMN auto_generated_quotes BOOLEAN DEFAULT FALSE COMMENT 'Whether quotes were auto-generated';

-- Add quote tier and expiration to quotations table
ALTER TABLE quotations 
ADD COLUMN tier VARCHAR(20) NULL COMMENT 'budget/standard/premium',
ADD COLUMN suggested_isp_id VARCHAR(36) NULL COMMENT 'ISP suggested for this quote',
ADD COLUMN expires_at TIMESTAMP NULL COMMENT 'Quote expiration time',
ADD COLUMN is_auto_generated BOOLEAN DEFAULT FALSE COMMENT 'System-generated vs manual';