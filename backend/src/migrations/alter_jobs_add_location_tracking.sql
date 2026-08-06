ALTER TABLE jobs 
ADD COLUMN current_lat DECIMAL(10, 8) COMMENT 'Current latitude for job tracking',
ADD COLUMN current_lng DECIMAL(11, 8) COMMENT 'Current longitude for job tracking',
ADD COLUMN eta_minutes INT COMMENT 'Estimated time of arrival in minutes';