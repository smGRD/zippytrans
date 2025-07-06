import React, { useState, useEffect } from "react";
import axios from "axios";

const Coffre = () => {
  const [telephone, setTelephone] = useState("0102030405");
  const [montantBloque, setMontantBloque] = useState(0);
  const [solde, setSolde] = useState(0);
  const [montantAction, setMontantAction] = useState("");

  const fetchCoffre = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/utilisateur/" + telephone, {
        headers: { "x-api-key": "zippy123" },
      });
      setSolde(res.data.solde);
      setMontantBloque(res.data.coffre || 0);
    } catch (err) {
      console.error("Erreur chargement utilisateur :", err);
    }
  };

  useEffect(() => {
    fetchCoffre();
  }, []);

  const handleBloquer = async () => {
    try {
      await axios.post("http://localhost:3000/api/coffre/bloquer", {
        telephone,
        montant: parseFloat(montantAction),
      }, {
        headers: { "x-api-key": "zippy123" },
      });
      fetchCoffre();
      alert("✅ Montant bloqué !");
    } catch (err) {
      alert("❌ Erreur blocage : " + err.response?.data?.message || err.message);
    }
  };

  const handleDebloquer = async () => {
    try {
      await axios.post("http://localhost:3000/api/coffre/debloquer", {
        telephone,
        montant: parseFloat(montantAction),
      }, {
        headers: { "x-api-key": "zippy123" },
      });
      fetchCoffre();
      alert("✅ Montant débloqué !");
    } catch (err) {
      alert("❌ Erreur déblocage : " + err.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🔒 Mon Coffre</h2>
      <label>Numéro de téléphone : </label>
      <input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
      <br />

      <p>💰 Solde disponible : <strong>{solde.toLocaleString()} F</strong></p>
      <p>📦 Montant bloqué (coffre) : <strong>{montantBloque.toLocaleString()} F</strong></p>

      <label>Montant à bloquer / débloquer : </label>
      <input
        type="number"
        value={montantAction}
        onChange={(e) => setMontantAction(e.target.value)}
      />
      <br />

      <button onClick={handleBloquer}>🔒 Bloquer</button>
      <button onClick={handleDebloquer}>🔓 Débloquer</button>
    </div>
  );
};

export default Coffre;
