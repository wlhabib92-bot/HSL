# Supabase — HSL Génie Civil

## Configuration réalisée

Le projet Supabase `hsl` (`jsxiwkkwxzlshzriukvu`) est actif et connecté au site statique. Le compte Auth `hsl.geniecivil@gmail.com` existe et a été ajouté à la liste privée des administrateurs.

Les migrations sont sous `supabase/migrations/`. Elles mettent en place :

- `public.site_content` : contenu JSON partagé et lisible par les visiteurs, modifiable uniquement par un compte HSL autorisé.
- `public.quote_requests` : demandes de devis ; insertion publique limitée au dépôt d’une nouvelle demande, lecture/modification/suppression réservées aux admins.
- `public.hsl_admins` : liste d’autorisations privée, non accessible directement depuis le navigateur.
- le helper interne `private.is_hsl_admin()` et une fonction RPC `public.is_hsl_admin()` qui indique uniquement si l’utilisateur appelant est administrateur.
- le bucket Storage `hsl-media` : images publiques en lecture, écriture réservée aux admins.
- les politiques RLS nécessaires sur les tables et les objets du bucket.

Le site front-end est connecté : Supabase Auth sert au login, le contenu se charge depuis la base, les modifications d’admin sont enregistrées dans la base, les photos importées depuis l’appareil sont téléversées vers Storage (fond d’accueil, cartes, organigramme, services et galerie), les cartes de galerie associent image/projet/localisation, et le formulaire ajoute la demande de devis avant d’ouvrir WhatsApp. Le menu « Nos prestations » filtre les catégories et affiche les éléments du service sélectionné.

## Configuration navigateur

Le fichier `supabase-client.js` contient l’URL du projet et la clé **Publishable** `sb_publishable_...`. C’est le type de clé prévu pour les sites web. Les droits effectifs sont restreints par les politiques RLS.

**Ne jamais utiliser ni placer la clé `secret` ou `service_role` dans le JavaScript public.** N’envoyer aucun mot de passe par chat.

## Tester localement

À la racine du projet, démarrer un serveur HTTP local (par exemple `python3 -m http.server 8000` ou Live Server dans VS Code), puis ouvrir `http://localhost:8000`. Ne pas tester en ouvrant le fichier `index.html` via `file://`.

Dans Supabase, ajouter l’URL de production du site à **Authentication → URL Configuration → Redirect URLs** si des liens de confirmation ou de récupération de mot de passe sont activés. Garder l’inscription publique désactivée si elle n’est pas nécessaire. Le contrôle de sécurité signale actuellement que la protection contre les mots de passe compromis est désactivée : l’activer dans **Authentication → Settings / Password Security** avant la mise en production. Référence : https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

## Déploiement et sécurité

Déployer l’ensemble du dossier, y compris les fichiers `supabase-client.js`, `supabase-content-loader.js`, `auth.js`, `admin.js`, et le dossier `supabase/migrations/`. Le site ne nécessite pas de serveur applicatif pour sa configuration actuelle.

Le statut des demandes peut être mis à jour dans le panneau admin. Les demandes ne sont pas publiquement lisibles. Ajouter un contrôle antispam ou une limitation de débit avant une campagne publique ; un formulaire accessible en ligne peut recevoir du spam même si la lecture des données est protégée.
