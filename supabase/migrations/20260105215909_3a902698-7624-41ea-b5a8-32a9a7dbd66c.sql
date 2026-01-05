-- Create storage bucket for resume files
INSERT INTO storage.buckets (id, name, public)
VALUES ('resume', 'resume', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for resume bucket
CREATE POLICY "Resume files are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resume');

CREATE POLICY "Anyone can upload resume files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'resume');

CREATE POLICY "Anyone can update resume files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'resume');

CREATE POLICY "Anyone can delete resume files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'resume');

-- Create table to store resume URL
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Site settings are publicly readable"
ON public.site_settings
FOR SELECT
USING (true);

-- Admin policies
CREATE POLICY "Allow insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update site settings"
ON public.site_settings
FOR UPDATE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.site_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;