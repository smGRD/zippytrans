const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("zippy.db");

router.post("/", auth, (req, res) => {
  const { telephone, montant } = req.body;
  const montantFloat = parseFloat(montant);

  if (!telephone || isNaN(montantFloat) || montantFloat <= 0) {
    return res.status(400).json({ message: "Téléphone ou montant invalide" });
  }

  db.get("SELECT id, solde FROM utilisateurs WHERE telephone = ?", [telephone], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ message: "Utilisateur introuvable" });
    }

    const nouveauSolde = user.solde + montantFloat;

    db.run(
      "UPDATE utilisateurs SET solde = ? WHERE id = ?",
      [nouveauSolde, user.id],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json({ message: "Dépôt effectué", nouveauSolde });
      }
    );
  });
});

module.exports = router;
