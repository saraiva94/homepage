-- Política restritiva para admin_users (ninguém acessa diretamente)
CREATE POLICY "Ninguém acessa admin_users diretamente"
ON public.admin_users
FOR ALL
TO public
USING (false);

-- Política de upload para storage (via RPC)
CREATE POLICY "Upload de vídeos permitido"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'portfolio-videos');

-- Política de delete para storage
CREATE POLICY "Delete de vídeos permitido"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'portfolio-videos');