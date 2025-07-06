// Connexion.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Connexion() {
  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleConnexion = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/login", {
        telephone,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);

      setMessage("✅ Connexion réussie !");
      setTimeout(() => navigate("/"), 1000); // redirige vers accueil
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur de connexion.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>👤 Connexion</h2>
      <input
        type="text"
        placeholder="Numéro de téléphone"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
        style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
      />
      <button onClick={handleConnexion} style={{ padding: "0.5rem", width: "100%" }}>
        Se connecter
      </button>
      <p style={{ marginTop: "1rem" }}>{message}</p>
    </div>
  );
}
