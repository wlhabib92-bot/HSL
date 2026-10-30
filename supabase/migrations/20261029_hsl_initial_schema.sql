-- Initial schema for HSL Génie Civil website; additive only.
create table public.site_content (
  id smallint primary key default 1 check (id = 1),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.hsl_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;
create or replace function private.is_hsl_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.hsl_admins a where a.user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_hsl_admin() from public;
revoke all on function private.is_hsl_admin() from anon;
grant execute on function private.is_hsl_admin() to authenticated;

alter table public.site_content enable row level security;
alter table public.hsl_admins enable row level security;
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
create policy "site content is public to read" on public.site_content
  for select to anon, authenticated using (true);
create policy "only HSL admins can insert site content" on public.site_content
  for insert to authenticated with check ((select private.is_hsl_admin()));
create policy "only HSL admins can update site content" on public.site_content
  for update to authenticated using ((select private.is_hsl_admin())) with check ((select private.is_hsl_admin()));
-- No client role is granted access to hsl_admins; the security-definer helper checks membership.

insert into public.site_content (id, content) values (1, '{"hero":{"eyebrow":"Entreprise de BTP à Dakar, Sénégal","title1":"Bâtir aujourd’hui.","title2":"Pour demain.","lead":"HSL Génie Civil accompagne vos projets de construction avec une organisation rigoureuse, des équipes techniques et une attention portée à la qualité d’exécution.","cta1":"Demander un devis","cta2":"Découvrir nos références"},"about":{"tag":"Qui sommes-nous ?","title1":"La rigueur technique","title2":"au service de vos projets.","p1":"HSL Génie Civil intervient dans le domaine de la construction et de l’exécution des travaux, dans le respect des prescriptions du projet. Son approche s’appuie sur une organisation pluridisciplinaire, la mobilisation de personnel technique et le suivi des procédés d’exécution.","p2":"La planification des tâches, la coordination des équipes et le suivi des approvisionnements contribuent à une conduite structurée des travaux, dans le respect des prescriptions du projet.","link":"Découvrir notre approche","principles":[{"icon":"plan","title":"Organisation","text":"Coordination des intervenants, préparation et suivi des activités de chantier."},{"icon":"square","title":"Qualité d’exécution","text":"Attention portée aux matériaux, aux méthodes de travail et aux prescriptions du projet."},{"icon":"clock","title":"Maîtrise des délais","text":"Planification des ouvrages élémentaires et suivi de l’avancement des travaux."}]},"orgChart":{"tag":"Notre organisation","title":"Une équipe structurée au service de vos projets.","intro":"Une direction engagée et des compétences complémentaires pour accompagner chaque étape de vos travaux.","members":[{"name":"Nom à renseigner","role":"Président du Conseil d’Administration (PCA)","icon":"shield","photo":""},{"name":"Nom à renseigner","role":"Directeur Général","icon":"helmet","photo":""},{"name":"Nom à renseigner","role":"Assistante de direction","icon":"plan","photo":""},{"name":"Nom à renseigner","role":"Comptable","icon":"plan","photo":""},{"name":"Nom à renseigner","role":"Ingénieur","icon":"square","photo":""},{"name":"Nom à renseigner","role":"Directeur Administratif et Financier (DAF)","icon":"beam","photo":""},{"name":"Nom à renseigner","role":"Ingénieur","icon":"column","photo":""},{"name":"Nom à renseigner","role":"Juriste","icon":"shield","photo":""}]},"services":{"tag":"Nos compétences","title1":"Des solutions pour","title2":"vos travaux.","intro":"Une organisation adaptée aux besoins du projet et aux différents corps d’état intervenant sur le chantier.","cards":[{"icon":"brick","title":"Gros œuvre & maçonnerie","text":"Travaux de gros œuvre, maçonnerie et enduits, suivant les plans et les prescriptions du projet."},{"icon":"roller","title":"Finitions & revêtements","text":"Coordination des travaux de revêtement, carrelage, peinture et menuiseries selon le périmètre convenu."},{"icon":"bolt","title":"Lots techniques","text":"Organisation et coordination des interventions en électricité, plomberie, climatisation et ventilation, selon le projet."},{"icon":"crane","title":"Organisation de chantier","text":"Préparation des équipes, suivi des approvisionnements, coordination et suivi du planning d’exécution."}],"elementsTitle":"Les éléments d’un ouvrage en béton armé","elementsSub":"Les quatre notions de base de toute structure.","elements":[{"icon":"column","title":"Poteau","text":"Élément vertical qui transmet les charges de la structure jusqu’aux fondations."},{"icon":"beam","title":"Poutre","text":"Élément horizontal qui reprend les charges des planchers et les reporte sur les poteaux."},{"icon":"slab","title":"Dalle","text":"Plancher en béton qui forme le sol de chaque niveau du bâtiment."},{"icon":"concrete","title":"Béton armé","text":"Béton renforcé par des barres d’acier pour résister aux efforts de traction."}],"note":"Les prestations effectivement proposées et leur périmètre sont à confirmer avec HSL Génie Civil avant publication définitive."},"refs":{"tag":"Nos références","title1":"Le travail parle","title2":"de lui-même.","intro":"Les références seront présentées avec des informations vérifiées : nature du projet, localisation et prestations réalisées.","noticeTitle":"Votre galerie de réalisations","noticeText":"Les photos de chantier et références doivent être ajoutées ici après validation. Aucune référence de projet n’a été inventée dans cette première version.","items":[]},"quote":{"tag":"Parlons de votre projet","title1":"Un projet à construire ?","title2":"Commençons ici.","text":"Décrivez votre besoin. Les informations seront préparées dans un message WhatsApp afin que vous puissiez les envoyer directement à HSL Génie Civil.","benefits":["Une prise de contact simple","Les informations essentielles du projet","Un échange direct avec l’entreprise"],"types":["Construction neuve","Gros œuvre / maçonnerie","Rénovation","Finitions","Lots techniques","Autre demande"]},"contact":{"tag":"Contact","title1":"Parlons","title2":"construction.","text":"Pour une demande d’information, un projet ou une demande de devis, contactez HSL Génie Civil.","phoneDisplay":"+221 77 876 20 82","whatsapp":"221778762082","whatsappAdditional":"221772614371","email":"hsl.geniecivil@gmail.com","zone":"Cambéréne / Dakar, Sénégal"},"closing":{"label":"HSL Génie Civil","title1":"Bâtir aujourd’hui","title2":"pour demain.","button":"Parlons de votre projet"},"hidden":{}}'::jsonb);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  phone text not null check (char_length(trim(phone)) between 6 and 40),
  project text not null check (char_length(trim(project)) between 2 and 120),
  location text not null check (char_length(trim(location)) between 2 and 200),
  details text not null check (char_length(trim(details)) between 2 and 5000),
  status text not null default 'new' check (status in ('new','in_progress','closed'))
);
alter table public.quote_requests enable row level security;
grant insert on public.quote_requests to anon, authenticated;
grant select, update, delete on public.quote_requests to authenticated;
create policy "visitors can submit a new quote request" on public.quote_requests
  for insert to anon, authenticated with check (status = 'new');
create policy "only HSL admins can read quote requests" on public.quote_requests
  for select to authenticated using ((select private.is_hsl_admin()));
create policy "only HSL admins can update quote requests" on public.quote_requests
  for update to authenticated using ((select private.is_hsl_admin())) with check ((select private.is_hsl_admin()));
create policy "only HSL admins can delete quote requests" on public.quote_requests
  for delete to authenticated using ((select private.is_hsl_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hsl-media', 'hsl-media', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "HSL media images are public to read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'hsl-media');
create policy "only HSL admins can upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'hsl-media' and (select private.is_hsl_admin()));
create policy "only HSL admins can update media" on storage.objects
  for update to authenticated using (bucket_id = 'hsl-media' and (select private.is_hsl_admin()))
  with check (bucket_id = 'hsl-media' and (select private.is_hsl_admin()));
create policy "only HSL admins can delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'hsl-media' and (select private.is_hsl_admin()));
