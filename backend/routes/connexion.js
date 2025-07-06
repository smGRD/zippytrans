// routes/connexion.js

const express = require("express");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();

const SECRET_KEY = "zippy_secret_key"; // à déplacer dans un fichier .env plus tard

// Connexion à la base SQLite
const db = new sqlite3.Database("./zippy.db", (err) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base de données :", err.message);
  } else {
    console.log("✅ Connexion à la base SQLite réussie (connexion.js)");
  }
});

// POST /api/connexion
router.post("/", (req, res) => {
  const { telephone, motdepasse } = req.body;

  // Vérifie que les champs sont bien fournis
  if (!telephone || !motdepasse) {
    console.warn("⚠️ Requête incomplète : téléphone ou mot de passe manquant.");
    return res.status(400).json({ message: "Téléphone et mot de passe requis." });
  }

  const sql = "SELECT * FROM utilisateurs WHERE telephone = ? AND motdepasse = ?";
  console.log("🛠️ Requête SQL en cours avec :", telephone, motdepasse); // AJOUTE CETTE LIGNE
  db.get(sql, [telephone, motdepasse], (err, utilisateur) => {
    if (err) {
      console.error("❌ Erreur SQL lors de la recherche de l'utilisateur :", err.message);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }

    if (!utilisateur) {
      console.warn("❌ Tentative de connexion avec identifiants invalides :", telephone);
      return res.status(401).json({ message: "Identifiants incorrects." });
    }

    // Création du token JWT
    const token = jwt.sign(
      { id: utilisateur.id, telephone: utilisateur.telephone },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    console.log(`✅ Connexion réussie pour ${telephone}`);
    res.status(200).json({
      message: "Connexion réussie",
      token,
    });
  });
});

module.exports = router;
