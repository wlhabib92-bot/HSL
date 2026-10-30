-- Retire les anciennes données du bandeau sombre qui n’est plus rendu par le site.
-- Les éléments propres à chaque carte de service restent inchangés.
WITH obsolete AS (
  SELECT id, content
  FROM public.site_content
  WHERE id = 1
    AND (
      COALESCE((content->'services') ? 'elements', false)
      OR COALESCE((content->'services') ? 'elementsTitle', false)
      OR COALESCE((content->'services') ? 'elementsSub', false)
    )
  LIMIT 1
)
UPDATE public.site_content AS current
SET content = jsonb_set(
      obsolete.content,
      '{services}',
      (obsolete.content->'services') - ARRAY['elements','elementsTitle','elementsSub']
    ),
    updated_at = now()
FROM obsolete
WHERE current.id = obsolete.id;
