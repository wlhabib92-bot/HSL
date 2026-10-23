# HSL Génie Civil — site vitrine

Site vitrine responsive en français, palette deux couleurs : bleu nuit + or (celles du logo), avec :
- Accueil avec organigramme intégré, présentation, services, réalisations, devis et contact
- Logo HSL fourni
- Bouton WhatsApp au numéro `+221 77 876 20 82`
- Formulaire de devis qui prépare un message WhatsApp
- Page `admin.html` de démonstration locale

## Ouvrir le site
Ouvrir `index.html` dans un navigateur. Pour tester correctement en local, utiliser un petit serveur local (par exemple l’extension Live Server de VS Code).

## Important avant publication
Cette livraison est un prototype front-end statique. Le formulaire de devis ouvre WhatsApp : il n’enregistre pas les demandes dans une base de données. `admin.html` est une démonstration locale uniquement : les réalisations y sont stockées dans le navigateur courant et ne sont pas publiées pour les visiteurs. **Ne pas présenter cette page comme un back-office sécurisé.**

Pour la version de production, recommandation :
1. Déployer un site statique sur Cloudflare Pages (ou un hébergeur équivalent).
2. Acheter et connecter un domaine après vérification de disponibilité.
3. Ajouter Supabase pour la base de données, l’authentification administrateur et le stockage des photos.
4. Configurer des règles RLS strictes : seuls les administrateurs authentifiés peuvent créer/modifier/supprimer des réalisations et consulter les demandes.
5. Ajouter une protection antispam, des sauvegardes et un test mobile avant publication.

## Références et contenu
Le document fourni décrit une organisation de chantier, du personnel technique, du gros œuvre/maçonnerie/enduits, des menuiseries, revêtements, lots électriques/CVC/VMC, plomberie-sanitaire et étanchéité. Le site présente ces domaines de façon prudente. Les références de chantier ne sont pas inventées : remplacer les emplacements prévus par des photos et descriptions confirmées par HSL.

## Coordonnées utilisées
- Entreprise : HSL Génie Civil
- Téléphone / WhatsApp : +221 77 876 20 82
- Email : hsl.geniecivil@gmail.com
- Zone : Dakar, Sénégal
- Slogan : Bâtir aujourd’hui pour demain

## Modifier le contenu depuis l’administration
- Ouvrir `admin.html` : les sections du site ont des champs modifiables. Les noms, fonctions et photos des membres de l’organigramme intégré à l’accueil se règlent depuis la section « Organigramme » ; les icônes servent de remplacement tant qu’aucune photo n’est choisie.
- Les autres sections ont leurs champs modifiables, leurs éléments ajoutables / supprimables et une case « Afficher cette section » lorsqu’elle est applicable.
- Les modifications sont enregistrées dans le navigateur et visibles sur le site ouvert depuis le même appareil.
- Pour publier à tous les visiteurs : bouton « Télécharger content.js », puis remplacer `content.js` sur l’hébergement.

## Connexion à l’administration
- Le bouton cadenas dans l’en-tête ouvre `login.html`.
- Les identifiants initiaux de démonstration ne sont pas publiés dans ce guide. Configurez des identifiants propres à votre installation.
- Cette protection est côté navigateur (démonstration) et ne sécurise pas réellement le contenu. Ne publiez pas l’espace d’administration comme s’il était protégé ; avant toute utilisation publique, prévoir une vraie authentification serveur (ex. Supabase Auth).
