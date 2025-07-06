const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("zippy.db");

// Bloquer un montant (déplacer du solde vers le coffre)
router.post("/bloquer", auth, (req, res) => {
  const { telephone, montant } = req.body;
  const montantFloat = parseFloat(montant);

  if (!telephone || isNaN(montantFloat) || montantFloat <= 0) {
    return res.status(400).json({ message: "Données invalides" });
  }

  db.get("SELECT id, solde, coffre FROM utilisateurs WHERE telephone = ?", [telephone], (err, user) => {
    if (err || !user) return res.status(400).json({ message: "Utilisateur introuvable" });

    if (user.solde < montantFloat) {
      return res.status(400).json({ message: "Solde insuffisant pour bloquer" });
    }

    const nouveauSolde = user.solde - montantFloat;
    const nouveauCoffre = (user.coffre || 0) + montantFloat;

    db.run(
      "UPDATE utilisateurs SET solde = ?, coffre = ? WHERE id = ?",
      [nouveauSolde, nouveauCoffre, user.id],
      function (err) {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.json({ message: "Montant bloqué avec succès" });
      }
    );
  });
});

// Débloquer un montant (revenir du coffre vers le solde)
router.post("/debloquer", auth, (req, res) => {
  const { telephone, montant } = req.body;
  const montantFloat = parseFloat(montant);

  if (!telephone || isNaN(montantFloat) || montantFloat <= 0) {
    return res.status(400).json({ message: "Données invalides" });
  }

  db.get("SELECT id, solde, coffre FROM utilisateurs WHERE telephone = ?", [telephone], (err, user) => {
    if (err || !user) return res.status(400).json({ message: "Utilisateur introuvable" });

    if ((user.coffre || 0) < montantFloat) {
      return res.status(400).json({ message: "Montant bloqué insuffisant" });
    }

    const nouveauSolde = user.solde + montantFloat;
    const nouveauCoffre = user.coffre - montantFloat;

    db.run(
      "UPDATE utilisateurs SET solde = ?, coffre = ? WHERE id = ?",
      [nouveauSolde, nouveauCoffre, user.id],
      function (err) {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.json({ message: "Montant débloqué avec succès" });
      }
    );
  });
});

module.exports = router;
