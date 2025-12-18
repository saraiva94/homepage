-- Tabela de administradores
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Inserir admin padrão (senha hashada com pgcrypto)
INSERT INTO public.admin_users (username, password_hash)
VALUES ('Swamiy', crypt('Saraivada2025', gen_salt('bf')));

-- Função para verificar login admin
CREATE OR REPLACE FUNCTION public.verify_admin_login(p_username TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE username = p_username
    AND password_hash = crypt(p_password, password_hash)
  );
END;
$$;

-- Tabela de vídeos do portfolio
CREATE TABLE public.portfolio_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_type TEXT NOT NULL CHECK (portfolio_type IN ('editor', 'dev')),
  video_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para portfolio_videos (público para leitura)
ALTER TABLE public.portfolio_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos são públicos para leitura"
ON public.portfolio_videos
FOR SELECT
TO public
USING (true);

-- Criar bucket de storage para vídeos
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-videos', 'portfolio-videos', true);

-- Política de storage para upload (apenas via função)
CREATE POLICY "Vídeos públicos para leitura"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'portfolio-videos');