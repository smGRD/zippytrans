// server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "ton_secret_key";

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(process.env.DATABASE_URL || "./data/zippy.db");

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

if (!fs.existsSync(dbPath)) {
  const newDb = new sqlite3.Database(dbPath);
  newDb.serialize(() => {
    newDb.run(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telephone TEXT UNIQUE NOT NULL,
        solde INTEGER DEFAULT 0,
        coffre INTEGER DEFAULT 0
      );
    `);
    newDb.run(`
      CREATE TABLE IF NOT EXISTS transferts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_expediteur INTEGER,
        id_destinataire INTEGER,
        montant INTEGER,
        commission INTEGER,
        date TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    newDb.run(`
      CREATE TABLE IF NOT EXISTS depots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telephone TEXT,
        montant INTEGER,
        date TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    newDb.run(`INSERT OR IGNORE INTO utilisateurs (telephone, solde) VALUES ('0102030405', 0);`);
  });
  newDb.close();
}

const db = new sqlite3.Database(dbPath);

// Routes déjà présentes (login, utilisateur, dépôt, transfert, coffre) — inchangées

// ✅ Route fusionnée : transferts + dépôts
app.get("/api/historique/fusionne/:telephone", (req, res) => {
  const { telephone } = req.params;

  db.get("SELECT id FROM utilisateurs WHERE telephone = ?", [telephone], (err, user) => {
    if (err) {
      console.error("❌ Erreur SELECT utilisateur :", err);
      return res.status(500).json({ error: "Erreur base" });
    }
    if (!user) {
      console.error("❌ Utilisateur non trouvé :", telephone);
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const userId = user.id;

    db.all(
      `SELECT t.id, u1.telephone AS expediteur, u2.telephone AS destinataire, t.montant, t.commission, t.date, 'transfert' AS type
       FROM transferts t
       JOIN utilisateurs u1 ON t.id_expediteur = u1.id
       JOIN utilisateurs u2 ON t.id_destinataire = u2.id
       WHERE t.id_expediteur = ? OR t.id_destinataire = ?
       ORDER BY t.date DESC`,
      [userId, userId],
      (err1, transferts) => {
        if (err1) {
          console.error("❌ Erreur SELECT transferts :", err1);
          return res.status(500).json({ error: "Erreur historique transferts" });
        }

        db.all(
          `SELECT 
             id, 
             telephone AS expediteur,
             '-' AS destinataire,
             montant,
             0 AS commission,
             date,
             'Dépôt' AS type
           FROM depots
           WHERE telephone = ?
           ORDER BY date DESC`,
          [telephone],
          (err2, depots) => {
            if (err2) {
              console.error("❌ Erreur SELECT depots :", err2);
              return res.status(500).json({ error: "Erreur historique dépôts" });
            }

            const fusion = [...transferts, ...depots].sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            );
            console.log("✅ Résultat fusionné :", fusion);
            res.json(fusion);
          }
        );
      }
    );
  });
});

// ✅ Route unique pour historique des dépôts
app.get("/api/historique/depots/:telephone", (req, res) => {
  const { telephone } = req.params;

  db.all(
    `SELECT id, montant, date FROM depots WHERE telephone = ? ORDER BY date DESC`,
    [telephone],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Erreur historique dépôts" });
      res.json(rows);
    }
  );
});

// ✅ Historique des transferts
app.get("/api/historique/transferts/:telephone", (req, res) => {
  const { telephone } = req.params;

  db.get("SELECT id FROM utilisateurs WHERE telephone = ?", [telephone], (err, user) => {
    if (err || !user) return res.status(404).json({ error: "Utilisateur introuvable" });

    db.all(
      `SELECT 
        t.id, u1.telephone AS expediteur, u2.telephone AS destinataire, 
        t.montant, t.commission, t.date
       FROM transferts t
       JOIN utilisateurs u1 ON t.id_expediteur = u1.id
       JOIN utilisateurs u2 ON t.id_destinataire = u2.id
       WHERE t.id_expediteur = ? OR t.id_destinataire = ?
       ORDER BY t.date DESC`,
      [user.id, user.id],
      (err2, rows) => {
        if (err2) return res.status(500).json({ error: "Erreur historique" });
        res.json(rows);
      }
    );
  });
});

app.post("/api/transfert", (req, res) => {
  const { expediteur, destinataire, montant } = req.body;

  if (!expediteur || !destinataire || !montant || montant <= 0) {
    return res.status(400).json({ error: "Données invalides" });
  }

  // Fonction de calcul de commission progressive (identique au frontend)
  const calculerCommission = (montant) => {
    let taux = 0.01;
    if (montant >= 1_000_000) taux = 0.0025;
    else if (montant >= 200_000) taux = 0.005;
    else if (montant >= 50_000) taux = 0.0075;
    const commission = Math.ceil(montant * taux);
    return { taux, commission };
  };

  const { taux, commission } = calculerCommission(montant);
  const montantTotal = montant + commission;

  db.serialize(() => {
    // Trouver les utilisateurs expéditeur et destinataire
    db.get("SELECT * FROM utilisateurs WHERE telephone = ?", [expediteur], (err, userExp) => {
      if (err || !userExp) return res.status(404).json({ error: "Expéditeur introuvable" });

      if (userExp.solde < montantTotal) {
        return res.status(400).json({ error: "Solde insuffisant" });
      }

      db.get("SELECT * FROM utilisateurs WHERE telephone = ?", [destinataire], (err2, userDest) => {
        if (err2 || !userDest) return res.status(404).json({ error: "Destinataire introuvable" });

        // Débiter expéditeur
        const nouveauSoldeExp = userExp.solde - montantTotal;
        // Créditer destinataire du montant net (montant sans commission)
        const nouveauSoldeDest = userDest.solde + montant;

        // Mettre à jour les soldes
        db.run("UPDATE utilisateurs SET solde = ? WHERE id = ?", [nouveauSoldeExp, userExp.id]);
        db.run("UPDATE utilisateurs SET solde = ? WHERE id = ?", [nouveauSoldeDest, userDest.id]);

        // Enregistrer le transfert avec commission
        db.run(
          `INSERT INTO transferts (id_expediteur, id_destinataire, montant, commission) VALUES (?, ?, ?, ?)`,
          [userExp.id, userDest.id, montant, commission],
          function (errInsert) {
            if (errInsert) return res.status(500).json({ error: "Erreur enregistrement transfert" });

            res.json({
              message: "Transfert effectué",
              commission,
              taux,
              montant,
              idTransfert: this.lastID,
            });
          }
        );
      });
    });
  });
});

// ✅ Récupérer les infos d’un utilisateur
app.get("/api/utilisateur/:telephone", (req, res) => {
  const { telephone } = req.params;

  db.get("SELECT * FROM utilisateurs WHERE telephone = ?", [telephone], (err, row) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (!row) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json({
      telephone: row.telephone,
      solde: row.solde || 0,
      coffre: row.coffre || 0
    });
  });
});

// ✅ Déposer de l’argent
app.post("/api/depot", (req, res) => {
  const { telephone, montant } = req.body;

  if (!telephone || isNaN(montant) || montant <= 0) {
    return res.status(400).json({ error: "Paramètres invalides" });
  }

  db.run("UPDATE utilisateurs SET solde = solde + ? WHERE telephone = ?", [montant, telephone], function (err) {
    if (err) return res.status(500).json({ error: "Erreur mise à jour solde" });

    db.run(
      "INSERT INTO depots (telephone, montant) VALUES (?, ?)",
      [telephone, montant],
      function (err2) {
        if (err2) return res.status(500).json({ error: "Erreur enregistrement dépôt" });

        res.json({ success: true, depotId: this.lastID });
      }
    );
  });
});

// ✅ Route de test pour Render
app.get("/api/ping", (req, res) => {
  res.send("pong");
});

app.get("/", (req, res) => {
  res.send("🎉 Bienvenue sur l'API ZippyTrans !");
});

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
