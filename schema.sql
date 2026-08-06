-- ============================================================
-- Schéma EMAB — à exécuter dans Supabase > SQL Editor
-- ============================================================

-- Table des résultats scolaires
create table if not exists results (
  matricule   text primary key,
  nom         text not null,
  prenom      text not null,
  classe      text not null,
  moyenne     numeric,
  decision    text,
  annee       text
);

-- Table des dossiers d'inscription
create table if not exists inscriptions (
  id                bigint generated always as identity primary key,
  dossier           text unique,
  statut            text default 'À traiter',
  soumis_le         timestamptz default now(),
  nom_eleve         text,
  prenom_eleve      text,
  date_naissance    date,
  sexe              text,
  classe_demandee   text,
  nom_tuteur        text,
  telephone         text,
  adresse           text
);

-- ============================================================
-- Sécurité (RLS) : les parents peuvent lire les résultats et
-- créer des dossiers d'inscription. Seul un membre du personnel
-- connecté (Supabase Auth) peut modifier les résultats ou gérer
-- les dossiers.
-- ============================================================

alter table results enable row level security;
alter table inscriptions enable row level security;

-- Lecture publique des résultats (recherche par les parents)
create policy "Lecture publique des résultats"
  on results for select
  using (true);

-- Écriture des résultats réservée au personnel connecté
create policy "Le personnel gère les résultats"
  on results for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Les parents peuvent créer un dossier d'inscription
create policy "Dépôt public d'une fiche d'inscription"
  on inscriptions for insert
  with check (true);

-- Seul le personnel connecté peut consulter/modifier les dossiers
create policy "Le personnel consulte les dossiers"
  on inscriptions for select
  using (auth.role() = 'authenticated');

create policy "Le personnel met à jour les dossiers"
  on inscriptions for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Compte du personnel : créez-le depuis Authentication > Users
-- dans le tableau de bord Supabase (email + mot de passe).
-- Aucune inscription publique n'est activée — seuls les comptes
-- que vous créez manuellement peuvent se connecter à l'Espace école.
-- ============================================================
