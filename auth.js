/* Authentification réelle via Supabase Auth; l’autorisation admin est contrôlée par RLS. */
(function () {
  const client = () => window.hslSupabase;
  const message = (error) => {
    const raw = String(error && error.message || 'Connexion impossible.');
    if (/invalid login credentials/i.test(raw)) return 'Adresse e-mail ou mot de passe incorrect.';
    if (/email not confirmed/i.test(raw)) return 'Confirmez votre adresse e-mail avant de vous connecter.';
    return raw;
  };

  window.HSLAuth = {
    async isLogged() {
      try {
        const sb = client();
        if (!sb) return false;
        const { data: { session }, error } = await sb.auth.getSession();
        if (error || !session) return false;
        const { data: isAdmin, error: adminError } = await sb.rpc('is_hsl_admin');
        if (adminError || !isAdmin) {
          await sb.auth.signOut();
          return false;
        }
        return true;
      } catch (_) { return false; }
    },
    async login(email, password) {
      const sb = client();
      if (!sb) return { ok: false, msg: 'La connexion Supabase n’est pas configurée.' };
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { ok: false, msg: message(error) };
      const { data: isAdmin, error: adminError } = await sb.rpc('is_hsl_admin');
      if (adminError || !isAdmin) {
        await sb.auth.signOut();
        return { ok: false, msg: 'Ce compte n’est pas autorisé à administrer le site HSL.' };
      }
      return { ok: true };
    },
    async logout() {
      const sb = client();
      if (sb) await sb.auth.signOut();
    },
    async currentUser() {
      const sb = client();
      if (!sb) return '';
      const { data: { user } } = await sb.auth.getUser();
      return user ? user.email || '' : '';
    },
    async changePassword(oldPassword, newPassword) {
      const sb = client();
      if (!sb) return { ok: false, msg: 'La connexion Supabase n’est pas configurée.' };
      const { data: { user }, error: userError } = await sb.auth.getUser();
      if (userError || !user || !user.email) return { ok: false, msg: 'Session expirée. Reconnectez-vous.' };
      const { error: checkError } = await sb.auth.signInWithPassword({ email: user.email, password: oldPassword });
      if (checkError) return { ok: false, msg: 'Mot de passe actuel incorrect.' };
      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) return { ok: false, msg: message(error) };
      return { ok: true };
    }
  };
})();
