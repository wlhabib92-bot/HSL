/* Charge le contenu partagé avant le rendu et complète les champs ajoutés par défaut. */
function mergeDefaults(defaults, remote) {
  if (Array.isArray(defaults) && Array.isArray(remote)) {
    return remote.map((value, i) => mergeDefaults(defaults[i], value));
  }
  if (defaults && remote && typeof defaults === 'object' && typeof remote === 'object' && !Array.isArray(defaults) && !Array.isArray(remote)) {
    const result = { ...defaults };
    for (const key of Object.keys(remote)) result[key] = key in defaults ? mergeDefaults(defaults[key], remote[key]) : remote[key];
    return result;
  }
  return remote === undefined ? defaults : remote;
}
(async function () {
  try {
    const { data, error } = await window.hslSupabase.from('site_content').select('content').eq('id', 1).maybeSingle();
    if (!error && data && data.content) window.HSL_CONTENT = mergeDefaults(window.HSL_CONTENT || {}, data.content);
    else if (error) console.warn('Contenu Supabase indisponible; contenu local utilisé.', error.message);
  } catch (error) {
    console.warn('Supabase indisponible; contenu local utilisé.', error);
  } finally {
    const script = document.createElement('script');
    script.src = 'script.js?v=20261030-orgchart-layout';
    document.body.appendChild(script);
  }
})();
