const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("zippy.db");

// Commission progressive
function calculerCommission(montant) {
  let taux = 0.01;
  if (montant >= 1000000) taux = 0.0025;
  else if (montant >= 200000) taux = 0.005;
  else if (montant >= 50000) taux = 0.0075;
  return {
    taux,
    commission: Math.ceil(montant * taux),
  };
}

router.post("/", auth, (req, res) => {
  let { expediteur, destinataire, montant } = req.body;
  const montantFloat = parseFloat(montant);

  if (!expediteur || !destinataire || isNaN(montantFloat) || montantFloat <= 0) {
    return res.status(400).json({ message: "Données invalides" });
  }

  expediteur = expediteur.trim();
  destinataire = destinataire.trim();

  const { taux, commission } = calculerCommission(montantFloat);
  const montantNet = montantFloat - commission;

  db.get("SELECT id, solde FROM utilisateurs WHERE TRIM(telephone) = ?", [expediteur], (err, userExp) => {
    if (err || !userExp) {
      return res.status(400).json({ message: "Expéditeur introuvable" });
    }

    if (userExp.solde < montantFloat) {
      return res.status(400).json({ message: "Solde insuffisant" });
    }

    db.get("SELECT id, solde FROM utilisateurs WHERE TRIM(telephone) = ?", [destinataire], (err2, userDest) => {
      if (err2 || !userDest) {
        return res.status(400).json({ message: "Destinataire introuvable" });
      }

      const soldeExpediteur = userExp.solde - montantFloat;
      const soldeDestinataire = userDest.solde + montantNet;

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        db.run("UPDATE utilisateurs SET solde = ? WHERE id = ?", [soldeExpediteur, userExp.id]);
        db.run("UPDATE utilisateurs SET solde = ? WHERE id = ?", [soldeDestinataire, userDest.id]);

        db.get("SELECT id, solde FROM utilisateurs WHERE telephone = '9999999999'", (errSys, systeme) => {
          if (errSys || !systeme) {
            db.run("ROLLBACK");
            return res.status(500).json({ message: "Erreur utilisateur SYSTEME" });
          }

          const newSoldeSys = systeme.solde + commission;
          db.run("UPDATE utilisateurs SET solde = ? WHERE id = ?", [newSoldeSys, systeme.id]);

          db.run(
            `INSERT INTO transferts (id_expediteur, id_destinataire, montant, commission, statut) 
             VALUES (?, ?, ?, ?, 'valide')`,
            [userExp.id, userDest.id, montantFloat, commission],
            (errSave) => {
              if (errSave) {
                db.run("ROLLBACK");
                return res.status(500).json({ message: "Erreur enregistrement transfert" });
              }

              db.run("COMMIT");
              res.json({ message: "Transfert réussi", commission, taux });
            }
          );
        });
      });
    });
  });
});

module.exports = router;
