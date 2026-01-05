-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Tabela para Hard Skills
CREATE TABLE public.hard_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon_key TEXT NOT NULL,
  icon_color TEXT NOT NULL DEFAULT '#FFFFFF',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para Soft Skills
CREATE TABLE public.soft_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon_key TEXT NOT NULL,
  icon_color TEXT NOT NULL DEFAULT '#FFFFFF',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hard_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soft_skills ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para leitura
CREATE POLICY "Hard skills são públicas para leitura" 
ON public.hard_skills 
FOR SELECT 
USING (true);

CREATE POLICY "Soft skills são públicas para leitura" 
ON public.soft_skills 
FOR SELECT 
USING (true);

-- Políticas para inserção (admin)
CREATE POLICY "Permitir inserção de hard skills" 
ON public.hard_skills 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir inserção de soft skills" 
ON public.soft_skills 
FOR INSERT 
WITH CHECK (true);

-- Políticas para atualização (admin)
CREATE POLICY "Permitir atualização de hard skills" 
ON public.hard_skills 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir atualização de soft skills" 
ON public.soft_skills 
FOR UPDATE 
USING (true);

-- Políticas para exclusão (admin)
CREATE POLICY "Permitir exclusão de hard skills" 
ON public.hard_skills 
FOR DELETE 
USING (true);

CREATE POLICY "Permitir exclusão de soft skills" 
ON public.soft_skills 
FOR DELETE 
USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_hard_skills_updated_at
BEFORE UPDATE ON public.hard_skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_soft_skills_updated_at
BEFORE UPDATE ON public.soft_skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();