import React, { useState } from "react";

export default function Transfert() {
  const [expediteur, setExpediteur] = useState("0707070707");
  const [destinataire, setDestinataire] = useState("0102030405");
  const [montantEnvoye, setMontantEnvoye] = useState("");
  const [montantRecu, setMontantRecu] = useState("");
  const [info, setInfo] = useState(null);

  const calculerCommission = (montant) => {
    let taux = 0.01;
    if (montant >= 1_000_000) taux = 0.0025;
    else if (montant >= 200_000) taux = 0.005;
    else if (montant >= 50_000) taux = 0.0075;
    const commission = Math.ceil(montant * taux);
    return { taux, commission };
  };

  // Quand on modifie le montant envoyé, on calcule le montant reçu
  const handleMontantEnvoyeChange = (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // chiffres uniquement
    setMontantEnvoye(value);

    const montantNum = Number(value);
    if (montantNum === 0) {
      setMontantRecu("");
      setInfo(null);
      return;
    }

    const { taux, commission } = calculerCommission(montantNum);
    const montantNet = montantNum - commission;

    setMontantRecu(montantNet);
    setInfo({ taux, commission, montantNet, montant: montantNum });
  };

  // Quand on modifie le montant reçu, on calcule le montant envoyé
  const handleMontantRecuChange = (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    setMontantRecu(value);

    const montantRecuNum = Number(value);
    if (montantRecuNum === 0) {
      setMontantEnvoye("");
      setInfo(null);
      return;
    }

    // Pour trouver le montant envoyé, on cherche le montant envoyé qui, après commission, donne montantRecuNum
    // Cette fonction inverse la commission progressive (approximation)
    // On essaie avec une boucle simple pour trouver le montantEnvoye
    let montantEnvoyeCalc = montantRecuNum;
    let essais = 0;
    while (essais < 10) {
      const { commission } = calculerCommission(montantEnvoyeCalc);
      const montantNetCalc = montantEnvoyeCalc - commission;
      if (montantNetCalc === montantRecuNum) break;
      // Ajuster montantEnvoyeCalc
      montantEnvoyeCalc += montantRecuNum - montantNetCalc;
      essais++;
    }
    montantEnvoyeCalc = Math.ceil(montantEnvoyeCalc);

    const { taux, commission } = calculerCommission(montantEnvoyeCalc);
    setMontantEnvoye(montantEnvoyeCalc);
    setInfo({ taux, commission, montantNet: montantRecuNum, montant: montantEnvoyeCalc });
  };

  const handleTransfert = async () => {
    const montantFloat = Number(montantEnvoye);
    if (!expediteur || !destinataire || isNaN(montantFloat) || montantFloat <= 0) {
      alert("❌ Téléphone ou montant invalide");
      return;
    }

    const token = localStorage.getItem("token"); // 🔐 récupère le token
    if (!token) {
      alert("❌ Veuillez vous connecter.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/transfert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Authentification par token
        },
        body: JSON.stringify({
          expediteur: expediteur.trim(),
          destinataire: destinataire.trim(),
          montant: montantFloat,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur transfert");
      alert(`✅ Transfert effectué\n💰 Commission : ${data.commission} F (${(data.taux * 100).toFixed(2)}%)`);
      setMontantEnvoye("");
      setMontantRecu("");
      setInfo(null);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📤 Faire un Transfert</h2>

      <label>📱 Expéditeur :</label><br />
      <input type="text" value={expediteur} onChange={(e) => setExpediteur(e.target.value)} /><br /><br />

      <label>📱 Destinataire :</label><br />
      <input type="text" value={destinataire} onChange={(e) => setDestinataire(e.target.value)} /><br /><br />

      <label>💵 Montant à envoyer :</label><br />
      <input type="text" value={montantEnvoye} onChange={handleMontantEnvoyeChange} /><br /><br />

      <label>💵 Montant à recevoir (après commission) :</label><br />
      <input type="text" value={montantRecu} onChange={handleMontantRecuChange} /><br /><br />

      <button onClick={handleTransfert} disabled={!montantEnvoye}>🚀 Envoyer</button>

      {info && (
        <div style={{ marginTop: "1rem", background: "#f0f0f0", padding: "1rem", borderRadius: "10px" }}>
          <h4>🧮 Calcul commission :</h4>
          <p>Montant saisi : {info.montant} F</p>
          <p>Commission prélevée : {info.commission} F</p>
          <p>Taux appliqué : {(info.taux * 100).toFixed(2)} %</p>
          <p>Montant reçu par le destinataire : {info.montantNet} F</p>
        </div>
      )}
    </div>
  );
}
