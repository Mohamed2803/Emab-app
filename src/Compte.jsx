import React, { useState } from "react";
import { supabase } from "./supabaseClient";

// Transforme un numéro de téléphone en fausse adresse email interne,
// pour pouvoir utiliser le système de connexion de Supabase
// sans avoir besoin d'envoyer de SMS.
function toEmailIdentifiant(valeur) {
  const v = valeur.trim();
  if (v.includes("@")) return v; // c'est déjà un email
  const chiffres = v.replace(/\D/g, ""); // garde seulement les chiffres
  return `tel${chiffres}@emab-app.local`;
}

export default function Compte() {
  const [mode, setMode] = useState("connexion"); // "connexion" ou "inscription"
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [role, setRole] = useState("parent");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  async function handleInscription(e) {
    e.preventDefault();
    setErreur("");
    setSucces("");
    if (!identifiant || !motDePasse || !nom) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const email = toEmailIdentifiant(identifiant);
      const { data, error } = await supabase.auth.signUp({
        email,
        password: motDePasse,
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (userId) {
        const { error: profilError } = await supabase.from("profils").insert({
          id: userId,
          role,
          nom,
          telephone: identifiant.includes("@") ? null : identifiant,
        });
        if (profilError) throw profilError;
      }

      setSucces("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setMode("connexion");
      setMotDePasse("");
    } catch (err) {
      setErreur(err.message || "Une erreur est survenue lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnexion(e) {
    e.preventDefault();
    setErreur("");
    setSucces("");
    if (!identifiant || !motDePasse) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const email = toEmailIdentifiant(identifiant);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: motDePasse,
      });
      if (error) throw error;
      setSucces("Connexion réussie !");
    } catch (err) {
      setErreur("Identifiant ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setMode("connexion")}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: 8,
            border: "none",
            background: mode === "connexion" ? "#1e2a4a" : "#eee",
            color: mode === "connexion" ? "#fff" : "#333",
          }}
        >
          Se connecter
        </button>
        <button
          onClick={() => setMode("inscription")}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: 8,
            border: "none",
            background: mode === "inscription" ? "#1e2a4a" : "#eee",
            color: mode === "inscription" ? "#fff" : "#333",
          }}
        >
          Créer un compte
        </button>
      </div>

      <form onSubmit={mode === "connexion" ? handleConnexion : handleInscription}>
        {mode === "inscription" && (
          <>
            <label>Nom complet</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: 8 }}
            />

            <label>Je suis</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: 8 }}
            >
              <option value="parent">Parent</option>
              <option value="eleve">Élève</option>
            </select>
          </>
        )}

        <label>Email ou numéro de téléphone</label>
        <input
          type="text"
          value={identifiant}
          onChange={(e) => setIdentifiant(e.target.value)}
          placeholder="exemple@mail.com ou 6XX XX XX XX"
          style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: 8 }}
        />

        <label>Mot de passe</label>
        <input
  type="password"
  value={motDePasse}
  onChange={(e) => setMotDePasse(e.target.value)}
  style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem" }}
/>

{erreur && <div style={{ color: "red", marginBottom: "1rem" }}>{erreur}</div>}
{succes && <div style={{ color: "green", marginBottom: "1rem" }}>{succes}</div>}

<button
  type="submit"
  disabled={loading}
  style={{ width: "100%", padding: "0.9rem", background: "#1e2a4a", color: "#fff", border: "none" }}
>
  {loading ? "Veuillez patienter..." : mode === "connexion" ? "Se connecter" : "Créer mon compte"}
</button>
</form>
</div>
);
}
