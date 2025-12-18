-- Permitir operações de gerenciamento de vídeos no portfolio
CREATE POLICY "Permitir inserção de vídeos"
ON public.portfolio_videos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de vídeos"
ON public.portfolio_videos
FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de vídeos"
ON public.portfolio_videos
FOR DELETE
USING (true);