-- Keep the SECURITY DEFINER helper outside Supabase's exposed public API schema.
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

-- Rebuild the policies to use the private helper.
drop policy if exists "only HSL admins can insert site content" on public.site_content;
drop policy if exists "only HSL admins can update site content" on public.site_content;
create policy "only HSL admins can insert site content" on public.site_content
  for insert to authenticated with check ((select private.is_hsl_admin()));
create policy "only HSL admins can update site content" on public.site_content
  for update to authenticated using ((select private.is_hsl_admin())) with check ((select private.is_hsl_admin()));

drop policy if exists "only HSL admins can read quote requests" on public.quote_requests;
drop policy if exists "only HSL admins can update quote requests" on public.quote_requests;
drop policy if exists "only HSL admins can delete quote requests" on public.quote_requests;
create policy "only HSL admins can read quote requests" on public.quote_requests
  for select to authenticated using ((select private.is_hsl_admin()));
create policy "only HSL admins can update quote requests" on public.quote_requests
  for update to authenticated using ((select private.is_hsl_admin())) with check ((select private.is_hsl_admin()));
create policy "only HSL admins can delete quote requests" on public.quote_requests
  for delete to authenticated using ((select private.is_hsl_admin()));

drop policy if exists "only HSL admins can upload media" on storage.objects;
drop policy if exists "only HSL admins can update media" on storage.objects;
drop policy if exists "only HSL admins can delete media" on storage.objects;
create policy "only HSL admins can upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'hsl-media' and (select private.is_hsl_admin()));
create policy "only HSL admins can update media" on storage.objects
  for update to authenticated using (bucket_id = 'hsl-media' and (select private.is_hsl_admin()))
  with check (bucket_id = 'hsl-media' and (select private.is_hsl_admin()));
create policy "only HSL admins can delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'hsl-media' and (select private.is_hsl_admin()));

-- hsl_admins deliberately has no client grants; this explicit policy adds defense in depth.
create policy "admin allowlist is not directly accessible" on public.hsl_admins
  for all to anon, authenticated using (false) with check (false);

drop function if exists public.is_hsl_admin();
