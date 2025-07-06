import React, { useEffect, useState } from "react";

const HistoriqueTransferts = () => {
  const [transferts, setTransferts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/historique")
      .then((res) => res.json())
      .then((data) => setTransferts(data))
      .catch((err) => {
        console.error(err);
        alert("❌ Erreur lors du chargement de l'historique.");
      });
  }, []);

  return (
    <div>
      <h2>📄 Historique des Transferts</h2>
      {transferts.length === 0 ? (
        <p>Aucun transfert enregistré.</p>
      ) : (
        <ul>
          {transferts.map((t) => (
            <li key={t.id}>
              <strong>{t.expediteur}</strong> → <strong>{t.destinataire}</strong> : {t.montant} CFA
              ({t.statut}) le {t.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoriqueTransferts;
