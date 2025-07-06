import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Depot() {
  const [telephone, setTelephone] = useState("");
  const [montant, setMontant] = useState("");
  const [message, setMessage] = useState("");
  const [solde, setSolde] = useState(0);
  const [coffre, setCoffre] = useState(0);

  // Charger solde et coffre après validation numéro
  useEffect(() => {
    const fetchUser = async () => {
      if (telephone.length < 10) return; // Pas de requête si numéro incomplet

      try {
        const res = await axios.get(
          `http://localhost:3000/api/utilisateur/${telephone}`,
          { headers: { "x-api-key": "zippy123" } }
        );
        setSolde(res.data.solde);
        setCoffre(res.data.coffre || 0);
      } catch (err) {
        console.error("Erreur de récupération utilisateur :", err.message);
        setSolde(0);
        setCoffre(0);
      }
    };

    fetchUser();
  }, [telephone]);

  const handleDepot = async () => {
    const montantFloat = parseFloat(montant);
    if (!telephone || isNaN(montantFloat) || montantFloat <= 0) {
      setMessage("❌ Téléphone ou montant invalide");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/depot",
        { telephone, montant: montantFloat },
        { headers: { "x-api-key": "zippy123" } }
      );
      setMessage("✅ " + res.data.message);
      setSolde(res.data.nouveauSolde);
      setMontant("");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>💰 Faire un Dépôt</h2>

      <label>Numéro de téléphone : </label>
      <input
        type="text"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
      />
      <br />

      <label>Montant : </label>
      <input
        type="number"
        min="1"
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
      />
      <br />

      <button onClick={handleDepot}>Déposer</button>

      <p style={{ marginTop: "1rem" }}>{message}</p>

      <p>
        <strong>Solde disponible :</strong> {solde} F
      </p>
      <p>
        <strong>Montant bloqué (coffre) :</strong> {coffre} F
      </p>
    </div>
  );
}
