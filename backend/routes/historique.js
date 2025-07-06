const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("zippy.db");

router.get("/", auth, (req, res) => {
  const query = `
    SELECT 
      t.id, 
      u1.nom AS expediteur, 
      u2.nom AS destinataire, 
      t.montant, 
      t.commission,
      t.statut, 
      t.date
    FROM transferts t
    JOIN utilisateurs u1 ON t.id_expediteur = u1.id
    JOIN utilisateurs u2 ON t.id_destinataire = u2.id
    ORDER BY t.date DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("❌ Erreur récupération historique :", err);
      return res.status(500).json({ error: "Erreur serveur lors de la récupération de l'historique." });
    }

    res.json(rows);
  });
});

module.exports = router;
