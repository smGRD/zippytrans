import React, { useState } from "react";
import axios from "axios";

export default function Depot() {
  const [telephone, setTelephone] = useState("");
  const [montant, setMontant] = useState("");
  const [message, setMessage] = useState("");

  const effectuerDepot = async () => {
    const numero = telephone.trim();
    const montantFloat = parseFloat(montant);

    // Validation simple avant requête
    if (!numero || !/^\d{8,10}$/.test(numero)) {
      setMessage("❌ Numéro de téléphone invalide (8 à 10 chiffres requis)");
      return;
    }
    if (isNaN(montantFloat) || montantFloat <= 0) {
      setMessage("❌ Montant invalide");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/api/depot",
        { telephone: numero, montant: montantFloat },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(`✅ ${res.data.message} | 💰 Nouveau solde : ${res.data.nouveauSolde} F`);
      setMontant("");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Erreur lors du dépôt"));
    }
  };

  return (
    <div className="container" style={{ padding: "1rem", maxWidth: 400, margin: "auto" }}>
      <h2>💰 Faire un Dépôt</h2>

      <label>📱 Numéro de téléphone :</label><br />
      <input
        type="text"
        placeholder="Numéro de téléphone"
        value={telephone}
        maxLength={10}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, ""); // uniquement chiffres
          setTelephone(val);
        }}
        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
      /><br /><br />

      <label>💵 Montant :</label><br />
      <input
        type="number"
        placeholder="Montant"
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
      /><br /><br />

      <button
        onClick={effectuerDepot}
        style={{
          padding: "0.7rem",
          fontSize: "1rem",
          width: "100%",
          cursor: "pointer",
        }}
      >
        Déposer
      </button>

      {message && (
        <p
          style={{
            marginTop: "1rem",
            background: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
            color: message.startsWith("✅") ? "#155724" : "#721c24",
            padding: "1rem",
            borderRadius: "10px",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
