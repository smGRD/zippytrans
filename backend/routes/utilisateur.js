const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("zippy.db");

// Route GET : récupérer les infos d’un utilisateur via son numéro
router.get("/:telephone", auth, (req, res) => {
  const numero = req.params.telephone.trim();

  if (!numero) {
    return res.status(400).json({ message: "Numéro de téléphone requis" });
  }

  db.get(
    "SELECT id, nom, telephone, solde, coffre FROM utilisateurs WHERE telephone = ?",
    [numero],
    (err, row) => {
      if (err) {
        console.error("Erreur SQL:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      if (!row) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.json(row);
    }
  );
});

// Route POST : créer un nouvel utilisateur
router.post("/", auth, (req, res) => {
  const { nom, telephone, solde } = req.body;

  if (!nom || !telephone) {
    return res.status(400).json({ message: "Nom et téléphone requis" });
  }

  // Validation du format téléphone (exemple de regex adaptée aux formats ivoiriens)
  const regex = /^(01|05|07|27|25|03|04|06|08|09)\d{8}$/;
  if (!regex.test(telephone)) {
    return res.status(400).json({ message: "Numéro de téléphone invalide" });
  }

  db.get("SELECT id FROM utilisateurs WHERE telephone = ?", [telephone], (err, row) => {
    if (err) {
      console.error("Erreur SQL:", err);
      return res.status(500).json({ message: "Erreur SQL" });
    }
    if (row) {
      return res.status(409).json({ message: "Téléphone déjà enregistré" });
    }

    const initialSolde = parseFloat(solde) || 0;

    db.run(
      `INSERT INTO utilisateurs (nom, telephone, solde, coffre) VALUES (?, ?, ?, 0)`,
      [nom, telephone, initialSolde],
      function (err) {
        if (err) {
          console.error("Erreur SQL lors de l'insertion:", err);
          return res.status(500).json({ message: "Erreur SQL" });
        }

        res.status(201).json({
          message: "Utilisateur créé avec succès",
          utilisateur: {
            id: this.lastID,
            nom,
            telephone,
            solde: initialSolde,
            coffre: 0,
          },
        });
      }
    );
  });
});

module.exports = router;
