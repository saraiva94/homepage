-- Adiciona campos para imagens customizáveis do card
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS background_image_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_position TEXT DEFAULT '50% 50%',
  ADD COLUMN IF NOT EXISTS background_image_position TEXT DEFAULT '50% 68%';
