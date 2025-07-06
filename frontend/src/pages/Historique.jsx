import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Historique() {
  const [operations, setOperations] = useState([]);
  const telephone = "0102030405"; // À remplacer par valeur dynamique si besoin

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/historique/fusionne/${telephone}`);
        const donnees = res.data || [];

        const operationsFormatees = donnees.map((op) => ({
          id: op.type === "transfert" ? `T${op.id}` : `D${op.id}`,
          type: op.type === "transfert" ? "Transfert" : "Dépôt",
          expediteur: op.expediteur || op.telephone || "-",
          destinataire: op.destinataire || "-",
          montant: op.montant,
          commission: op.commission || 0,
          date: op.date
        }));

        setOperations(operationsFormatees);
      } catch (err) {
        console.error("❌ Erreur chargement historique fusionné", err);
      }
    };

    fetchData();
  }, []);

  const calculerTaux = (montant, commission) => {
    if (!montant || !commission) return "-";
    const taux = (commission / montant) * 100;
    return taux.toFixed(2) + " %";
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📜 Historique complet</h2>

      {operations.length === 0 ? (
        <p>Aucune opération trouvée.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Expéditeur</th>
              <th>Destinataire</th>
              <th>Montant</th>
              <th>Commission</th>
              <th>Taux</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => (
              <tr key={op.id}>
                <td>{op.id}</td>
                <td>{op.type}</td>
                <td>{op.expediteur}</td>
                <td>{op.destinataire}</td>
                <td>{op.montant} F</td>
                <td>{op.commission} F</td>
                <td>{op.type === "Transfert" ? calculerTaux(op.montant, op.commission) : "-"}</td>
                <td>{new Date(op.date).toLocaleString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
