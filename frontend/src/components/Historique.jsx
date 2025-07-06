import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Historique() {
  const [transactions, setTransactions] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [rechercheNom, setRechercheNom] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/historique", {
        headers: { "x-api-key": "zippy123" },
      })
      .then((res) => setTransactions(res.data))
      .catch((err) =>
        console.error("Erreur chargement historique", err)
      );
  }, []);

  const transactionsFiltrees = transactions.filter((item) => {
    const matchStatut = filtreStatut === "tous" || item.statut === filtreStatut;
    const matchNom =
      rechercheNom === "" ||
      item.expediteur?.toLowerCase().includes(rechercheNom.toLowerCase()) ||
      item.destinataire?.toLowerCase().includes(rechercheNom.toLowerCase());
    return matchStatut && matchNom;
  });

  return (
    <div>
      <h2>📜 Historique des transferts</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          🎯 Filtrer par statut :
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="tous">Tous</option>
            <option value="valide">Valide</option>
            <option value="echoue">Échoué</option>
            <option value="en_attente">En attente</option>
          </select>
        </label>

        <label style={{ marginLeft: "2rem" }}>
          🔍 Rechercher un nom :
          <input
            type="text"
            value={rechercheNom}
            onChange={(e) => setRechercheNom(e.target.value)}
            placeholder="Expéditeur ou destinataire"
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      {transactionsFiltrees.length === 0 ? (
        <p>Aucune transaction trouvée.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Expéditeur</th>
              <th>Destinataire</th>
              <th>Montant</th>
              <th>Commission</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactionsFiltrees.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.expediteur}</td>
                <td>{item.destinataire}</td>
                <td>{item.montant} F</td>
                <td>{item.commission || 0} F</td>
                <td>{item.statut}</td>
                <td>{new Date(item.date).toLocaleString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
