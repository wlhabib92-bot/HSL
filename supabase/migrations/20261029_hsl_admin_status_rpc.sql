-- Safe client-side status check: reveals only whether the current caller is an HSL admin.
create or replace function public.is_hsl_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_hsl_admin();
$$;
revoke all on function public.is_hsl_admin() from public;
revoke all on function public.is_hsl_admin() from anon;
grant execute on function public.is_hsl_admin() to authenticated;
