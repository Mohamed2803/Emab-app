import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Compte({ setTab }) {
  const [mode, setMode] = useState("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [role, setRole] = useState("parent");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleNouveauMotDePasse(e) {
    e.preventDefault();
    setErreur("");
    setSucces("");
    if (!nouveauMotDePasse) {
      setErreur("Merci de saisir un nouveau mot de passe.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nouveauMotDePasse });
      if (error) throw error;
      setSucces("Mot de passe changé avec succès ! Vous pouvez continuer.");
      setRecoveryMode(false);
    } catch (err) {
      setErreur(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleInscription(e) {
    e.preventDefault();
    setErreur("");
    setSucces("");
    if (!email || !motDePasse || !nom) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password: motDePasse });
      if (error) throw error;

      const userId = data.user?.id;
      if (userId) {
        const { error: profilError } = await supabase.from("profils").insert({
          id: userId,
          role,
          nom,
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
    if (!email || !motDePasse) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
      if (error) throw error;
      setSucces("Connexion réussie !");
setTab("accueil");
    } catch (err) {
      setErreur("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMotDePasseOublie() {
    setErreur("");
    setSucces("");
    if (!email) {
      setErreur("Entrez d'abord votre email ci-dessus, puis touchez ce lien.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSucces("Un email de réinitialisation a été envoyé.");
    } catch (err) {
      setErreur("Impossible d'envoyer l'email de réinitialisation.");
    } finally {
      setLoading(false);
    }
  }

  if (recoveryMode) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem" }}>
        <h2>Choisir un nouveau mot de passe</h2>
        <form onSubmit={handleNouveauMotDePasse}>
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: 8 }}
          />
          {erreur && <div style={{ color: "red", marginBottom: "1rem" }}>{erreur}</div>}
          {succes && <div style={{ color: "green", marginBottom: "1rem" }}>{succes}</div>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.9rem", borderRadius: 8, border: "none", background: "#1e2a4a", color: "#fff" }}>
            {loading ? "Veuillez patienter..." : "Valider le nouveau mot de passe"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setMode("connexion")}
          style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "none", background: mode === "connexion" ? "#1e2a4a" : "#eee", color: mode === "connexion" ? "#fff" : "#333" }}
        >
          Se connecter
        </button>
        <button
          onClick={() => setMode("inscription")}
          style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "none", background: mode === "inscription" ? "#1e2a4a" : "#eee", color: mode === "inscription" ? "#fff" : "#333" }}
        >
          Créer un compte
        </button>
      </div>

      <form onSubmit={mode === "connexion" ? handleConnexion : handleInscription}>
        {mode === "inscription" && (
          <>
            <label>Nom complet</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: 8 }} />

            <label>Je suis</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: 8 }}>
              <option value="parent">Parent</option>
              <option value="eleve">Élève</option>
            </select>
          </>
        )}

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemple@mail.com" style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: 8 }} />

        <label>Mot de passe</label>
        <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} style={{ width: "100%", padding: "0.75rem", marginBottom: "0.5rem", borderRadius: 8 }} />

        {mode === "connexion" && (
          <div style={{ marginBottom: "1rem" }}>
            <button type="button" onClick={handleMotDePasseOublie} style={{ background: "none", border: "none", color: "#1e2a4a", textDecoration: "underline", padding: 0 }}>
              Mot de passe oublié ?
            </button>
          </div>
        )}

        {erreur && <div style={{ color: "red", marginBottom: "1rem" }}>{erreur}</div>}
        {succes && <div style={{ color: "green", marginBottom: "1rem" }}>{succes}</div>}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.9rem", borderRadius: 8, border: "none", background: "#1e2a4a", color: "#fff" }}>
          {loading ? "Veuillez patienter..." : mode === "connexion" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>
    </div>
  );
}
