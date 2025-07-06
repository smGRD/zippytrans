import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrReader } from "react-qr-reader";
import axios from "axios";

export default function QRCodePage() {
  const [telephone, setTelephone] = useState("0707070707"); // à sécuriser avec auth plus tard
  const [scannedPhone, setScannedPhone] = useState("");
  const [montantEnvoye, setMontantEnvoye] = useState("");
  const [montantRecu, setMontantRecu] = useState("");
  const [message, setMessage] = useState("");
  const [onceScanDone, setOnceScanDone] = useState(false);
  const [historique, setHistorique] = useState([]);
  const [totalTransferts, setTotalTransferts] = useState(0); // pour commission progressive

  // Fonction commission progressive (exemple simple)
  // 1er transfert: 0%, ensuite 1%, puis dégressif selon montant (adapté)
  function calculerCommission(montant, nbTransferts) {
    if (nbTransferts === 0) return 0;
    if (montant < 10000) return montant * 0.01;
    if (montant < 50000) return montant * 0.0075;
    return montant * 0.005;
  }

  function calculerMontantRecu(montant, nbTransferts) {
    const commission = calculerCommission(montant, nbTransferts);
    return montant - commission;
  }

  function calculerMontantEnvoye(montantRecu, nbTransferts) {
    // Approximation pour inverse de la fonction
    // montantEnvoye = montantRecu + commission(montantEnvoye)
    // Pour simplifier, on itère un peu
    let envoye = montantRecu;
    for (let i = 0; i < 5; i++) {
      const com = calculerCommission(envoye, nbTransferts);
      envoye = montantRecu + com;
    }
    return envoye;
  }

  // Charger historique au montage
  useEffect(() => {
    async function fetchHistorique() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:3000/api/historique/${telephone}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHistorique(res.data);
        setTotalTransferts(res.data.length);
      } catch (err) {
        console.error("Erreur chargement historique:", err);
      }
    }
    fetchHistorique();
  }, [telephone]);

  // Mise à jour du montant reçu quand montantEnvoye change
  useEffect(() => {
    if (!montantEnvoye) {
      setMontantRecu("");
      return;
    }
    const montantNum = parseFloat(montantEnvoye);
    if (isNaN(montantNum) || montantNum <= 0) {
      setMontantRecu("");
      return;
    }
    const recu = calculerMontantRecu(montantNum, totalTransferts);
    setMontantRecu(recu.toFixed(2));
  }, [montantEnvoye, totalTransferts]);

  // Mise à jour du montant envoyé quand montantRecu change
  useEffect(() => {
    if (!montantRecu) {
      setMontantEnvoye("");
      return;
    }
    const montantNum = parseFloat(montantRecu);
    if (isNaN(montantNum) || montantNum <= 0) {
      setMontantEnvoye("");
      return;
    }
    const envoye = calculerMontantEnvoye(montantNum, totalTransferts);
    setMontantEnvoye(envoye.toFixed(2));
  }, [montantRecu, totalTransferts]);

  const handleScan = (data) => {
    if (data && !onceScanDone) {
      setScannedPhone(data);
      setMessage("QR scanné : " + data);
      setOnceScanDone(true); // stop scan automatique après 1 lecture
    }
  };

  const handleError = (err) => {
    console.error(err);
    setMessage("❌ Erreur lecture QR");
  };

  const handleEnvoyer = async () => {
    if (!scannedPhone) {
      setMessage("❌ Veuillez scanner un QR code valide.");
      return;
    }
    if (!montantEnvoye || isNaN(parseFloat(montantEnvoye)) || parseFloat(montantEnvoye) <= 0) {
      setMessage("❌ Montant invalide.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/transfert",
        {
          expediteur: telephone,
          destinataire: scannedPhone,
          montant: parseFloat(montantEnvoye),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("✅ Transfert effectué !");
      setScannedPhone("");
      setMontantEnvoye("");
      setMontantRecu("");
      setOnceScanDone(false);
      // Rafraîchir historique
      const res = await axios.get(
        `http://localhost:3000/api/historique/${telephone}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHistorique(res.data);
      setTotalTransferts(res.data.length);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors du transfert.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h2>📱 Mon QR Code</h2>
      <div style={{ textAlign: "center" }}>
        <QRCodeCanvas value={telephone} size={180} />
        <p><strong>Numéro :</strong> {telephone}</p>
      </div>

      <hr />

      <h2>📷 Scanner un QR</h2>
      {!onceScanDone && (
        <QrReader
          onResult={(result, error) => {
            if (!!result) handleScan(result?.text);
            if (!!error) handleError(error);
          }}
          style={{ width: "100%" }}
          constraints={{ facingMode: "environment" }}
        />
      )}

      {onceScanDone && (
        <p>✅ QR Code scanné : <strong>{scannedPhone}</strong></p>
      )}

      <input
        type="number"
        placeholder="Montant à envoyer"
        value={montantEnvoye}
        onChange={(e) => setMontantEnvoye(e.target.value)}
        style={{ marginTop: "1rem", padding: "0.5rem", width: "100%", fontSize: "1rem" }}
        disabled={!onceScanDone}
      />
      <input
        type="number"
        placeholder="Montant à recevoir"
        value={montantRecu}
        onChange={(e) => setMontantRecu(e.target.value)}
        style={{ marginTop: "0.5rem", padding: "0.5rem", width: "100%", fontSize: "1rem" }}
        disabled={!onceScanDone}
      />

      <button
        onClick={handleEnvoyer}
        disabled={!onceScanDone || !montantEnvoye || parseFloat(montantEnvoye) <= 0}
        style={{
          marginTop: "1rem",
          width: "100%",
          padding: "0.75rem",
          fontSize: "1.1rem",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "4px",
        }}
      >
        📤 Envoyer
      </button>

      <p style={{ marginTop: "1rem", minHeight: "1.5em", color: message.startsWith("✅") ? "green" : "red" }}>
        {message}
      </p>

      <hr />

      <h2>🧾 Historique des transferts</h2>
      {historique.length === 0 ? (
        <p>Aucun transfert effectué.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ccc" }}>
              <th style={{ textAlign: "left", padding: "0.25rem" }}>Date</th>
              <th style={{ textAlign: "left", padding: "0.25rem" }}>Destinataire</th>
              <th style={{ textAlign: "right", padding: "0.25rem" }}>Montant</th>
              <th style={{ textAlign: "right", padding: "0.25rem" }}>Commission</th>
              <th style={{ textAlign: "right", padding: "0.25rem" }}>Reçu</th>
            </tr>
          </thead>
          <tbody>
            {historique.map(({ id, date, telephone_destinataire, montant, commission, montant_net }) => (
              <tr key={id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.25rem" }}>{new Date(date).toLocaleString()}</td>
                <td style={{ padding: "0.25rem" }}>{telephone_destinataire}</td>
                <td style={{ padding: "0.25rem", textAlign: "right" }}>{montant.toFixed(2)} F</td>
                <td style={{ padding: "0.25rem", textAlign: "right" }}>{commission.toFixed(2)} F</td>
                <td style={{ padding: "0.25rem", textAlign: "right" }}>{montant_net.toFixed(2)} F</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
