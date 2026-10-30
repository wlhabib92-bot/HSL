/* Clé publiable destinée au navigateur; les autorisations sont appliquées par RLS. */
(function () {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    throw new Error('Le SDK Supabase n’a pas été chargé.');
  }
  window.hslSupabase = window.supabase.createClient(
    'https://jsxiwkkwxzlshzriukvu.supabase.co',
    'sb_publishable_yJVH3CmlCBejr69bAdhrfg_WLrEqjV3',
    { global: { fetch: (url, init = {}) => fetch(url, { ...init, cache: 'no-store' }) }, auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
})();
