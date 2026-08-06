# Lycée EMAB — Espace parents

Application web pour la recherche de résultats scolaires et le dépôt de
fiches d'inscription en ligne, avec un espace admin sécurisé pour le
personnel.

## 1. Installer les dépendances

```bash
npm install
```

## 2. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Une fois le projet créé, ouvrir **SQL Editor** → coller le contenu de
   `supabase/schema.sql` → **Run**
3. Aller dans **Project Settings > API** et récupérer :
   - `Project URL`
   - `anon public` key

## 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir `.env` avec l'URL et la clé récupérées à l'étape 2.

## 4. Créer un compte pour le personnel (secrétariat / admin)

Dans Supabase → **Authentication > Users > Add user** :
- Renseigner un email (ex. `secretariat@emab.gn`) et un mot de passe
- Décocher "Auto confirm user" n'est pas nécessaire : cochez-la pour que
  le compte soit utilisable immédiatement

C'est ce compte qui permettra de se connecter à l'**Espace école** dans
l'application (recherche de résultats → onglet "Espace école").

Vous pouvez créer un compte par membre du personnel autorisé.

## 5. Tester en local

```bash
npm run dev
```

Ouvrir l'URL affichée (en général `http://localhost:5173`).

## 6. Déployer sur Vercel

```bash
npm install -g vercel
vercel
```

Lors du déploiement, Vercel demandera les variables d'environnement :
renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (les mêmes que
dans `.env`).

Pour la mise en production définitive :

```bash
vercel --prod
```

## 7. Brancher votre nom de domaine

Dans le tableau de bord Vercel du projet → **Settings > Domains** →
ajouter votre domaine (ex. `emab-guinee.com`).

Vercel affichera un enregistrement DNS à créer chez votre registrar :
- Domaine racine (`emab-guinee.com`) → enregistrement `A` vers `76.76.21.21`
- Sous-domaine (`www.emab-guinee.com`) → enregistrement `CNAME` vers
  `cname.vercel-dns.com`

Le certificat HTTPS est généré automatiquement par Vercel une fois le DNS
propagé (quelques minutes à quelques heures).

## Comment ajouter les résultats scolaires

Une fois connecté à l'Espace école (onglet "Résultats"), ajouter chaque
élève via le formulaire : matricule, nom, prénom, classe, moyenne,
décision. Le résultat est immédiatement consultable par les parents via
la recherche.

## Sécurité — à savoir

- La recherche de résultats et le dépôt de fiches sont **publics** (accès
  sans compte), comme prévu pour les parents.
- La lecture des dossiers d'inscription et la modification des résultats
  sont **réservées aux comptes que vous créez manuellement** dans
  Supabase Authentication — il n'y a pas d'inscription publique possible.
- Pensez à retirer l'utilisateur de test si vous en créez un pour les
  essais.
