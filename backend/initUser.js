const bcrypt = require("bcrypt");
const db = require("./database"); // on récupère l'instance qui a déjà créé la table

const telephone = "0102030405";
const motDePasse = "123"; // mot de passe en clair pour tester
const nom = "Samir";

bcrypt.hash(motDePasse, 10, (err, hash) => {
  if (err) {
    console.error("Erreur lors du hash :", err);
    return;
  }

  db.run(
    `INSERT OR IGNORE INTO utilisateurs (nom, telephone, mot_de_passe) VALUES (?, ?, ?)`,
    [nom, telephone, hash],
    function (err) {
      if (err) {
        console.error("Erreur d'insertion :", err.message);
      } else if (this.changes === 0) {
        console.log("ℹ️ Utilisateur existant, aucune insertion faite.");
      } else {
        console.log("✅ Utilisateur de test ajouté !");
      }
      db.close();
    }
  );
});
