-- Migration V6: Add background_image_config field
ALTER TABLE professional_profiles 
ADD COLUMN IF NOT EXISTS background_image_config TEXT; 