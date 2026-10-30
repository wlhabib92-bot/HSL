/* Charge le contenu partagé avant le rendu et le resynchronise entre appareils. */
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
  let loadedUpdatedAt = null;
  try {
    const { data, error } = await window.hslSupabase.from('site_content').select('content,updated_at').eq('id', 1).maybeSingle();
    if (!error && data && data.content) {
      window.HSL_CONTENT = mergeDefaults(window.HSL_CONTENT || {}, data.content);
      loadedUpdatedAt = data.updated_at || null;
    } else if (error) console.warn('Contenu Supabase indisponible; contenu local utilisé.', error.message);
  } catch (error) {
    console.warn('Supabase indisponible; contenu local utilisé.', error);
  } finally {
    const script = document.createElement('script');
    script.src = 'script.js?v=20261030-gallery-title';
    document.body.appendChild(script);
  }

  let checking = false;
  async function checkForRemoteChanges() {
    if (checking || document.visibilityState === 'hidden') return;
    checking = true;
    try {
      const { data, error } = await window.hslSupabase.from('site_content').select('updated_at').eq('id', 1).maybeSingle();
      if (!error && data?.updated_at && (!loadedUpdatedAt || data.updated_at !== loadedUpdatedAt)) location.reload();
    } catch (error) {
      console.warn('Vérification des mises à jour Supabase impossible.', error);
    } finally {
      checking = false;
    }
  }
  window.setInterval(checkForRemoteChanges, 15000);
  window.addEventListener('focus', checkForRemoteChanges);
  document.addEventListener('visibilitychange', checkForRemoteChanges);
})();
