ALTER TABLE isps 
ADD COLUMN current_location JSON COMMENT 'Current GPS location for live tracking';

ALTER TABLE isps 
ADD COLUMN last_location_update TIMESTAMP NULL COMMENT 'Last time location was updated';