# HSL Génie Civil — site vitrine

Site responsive en français, palette bleu nuit et or, avec accueil, organigramme, présentation, services, réalisations, demande de devis et contact.

## Supabase connecté

Le site utilise le projet Supabase `hsl` (`jsxiwkkwxzlshzriukvu`) :

- Le contenu commun du site est lu depuis `public.site_content` ; l’admin le sauvegarde directement dans la base.
- L’accès à `admin.html` est géré par Supabase Auth. Le compte `hsl.geniecivil@gmail.com` est autorisé comme administrateur.
- Les photos sélectionnées depuis l’administration sont téléversées dans le bucket Storage `hsl-media`.
- Le formulaire de devis insère les coordonnées et le descriptif dans `public.quote_requests`, puis ouvre WhatsApp pour confirmer l’envoi à HSL.
- La lecture du contenu et l’accès aux demandes sont contrôlés par les règles RLS ; les demandes et la liste d’administrateurs ne sont pas accessibles publiquement.

L’URL et la **clé publiable** sont dans `supabase-client.js`. Cette clé est faite pour le navigateur et les droits restent contrôlés par RLS. Ne jamais mettre une clé Supabase `secret` ou `service_role` dans un fichier public.

Les migrations SQL sont conservées sous `supabase/migrations/`.

## Lancer le site

Ne pas ouvrir directement les pages en `file://`. Lancer un serveur local à la racine du dossier, par exemple :

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`. On peut aussi utiliser Live Server dans VS Code. Le serveur local doit être autorisé dans les URL de redirection Supabase si des liens de confirmation ou de récupération de mot de passe sont activés.

## Connexion à l’administration

Ouvrir `login.html` ou utiliser le cadenas du site. Se connecter avec l’adresse et le mot de passe du compte créé dans Supabase Auth. L’inscription publique n’est pas nécessaire : les comptes d’administration sont créés dans le Dashboard Supabase puis ajoutés à `public.hsl_admins` par un propriétaire autorisé.

Le formulaire dans « Sécurité » permet de changer le mot de passe Supabase Auth. La liste des demandes de devis apparaît dans le panneau d’administration ; leur statut peut être mis à jour.

## Modifier et publier le contenu

Ouvrir `admin.html`, modifier les champs et laisser la sauvegarde se terminer (le statut confirme « Enregistré sur Supabase »). Les changements sont partagés avec les visiteurs dès qu’ils rechargent le site. Le bouton « Télécharger une sauvegarde » exporte le JSON du contenu ; ce fichier n’est pas nécessaire à la publication normale.

Les photos sélectionnées depuis l’appareil dans l’admin passent par Supabase Storage : fond d’accueil, photos des trois cartes « À propos », portraits des huit membres, fond Services, cartes des quatre prestations et réalisations. Les noms et fonctions des huit membres sont modifiables ; les éléments affichés dans « Nos prestations » sont aussi modifiables pour chaque catégorie. Les cartes de galerie associent directement l’image, le nom du projet et sa localisation. Les images et références doivent être vérifiées par HSL avant publication.

## Demandes de devis

Le formulaire enregistre la demande dans Supabase, puis prépare le texte WhatsApp. Le visiteur doit encore appuyer sur Envoyer dans WhatsApp. Les demandes restent privées et ne sont visibles que par les administrateurs autorisés.

Avant une publication large, prévoir une protection antispam/rate-limit adaptée, vérifier les URL d’authentification de production, faire un test mobile et activer une stratégie de sauvegarde Supabase. Dans Supabase Auth, activer aussi la protection contre les mots de passe compromis (actuellement désactivée selon le contrôle de sécurité).

## Coordonnées de l’entreprise

- HSL Génie Civil
- WhatsApp : +221 77 876 20 82 et +221 77 261 43 71
- E-mail : hsl.geniecivil@gmail.com
- Zone : Cambéréne / Dakar, Sénégal
- Slogan : « Bâtir aujourd’hui pour demain »
