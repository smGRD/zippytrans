// Fichier : init.js
const mongoose = require("mongoose");
const Utilisateur = require("./models/utilisateurModel");

mongoose.connect("mongodb://127.0.0.1:27017/zippytrans", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const creerUtilisateurs = async () => {
  try {
    await Utilisateur.deleteMany(); // Supprime tous les anciens utilisateurs

    await Utilisateur.create([
      {
        nom: "Alpha",
        numero: "0102030405",
        solde: 100000,
      },
      {
        nom: "Beta",
        numero: "0707070707",
        solde: 50000,
      },
    ]);

    console.log("✅ Utilisateurs créés !");
    process.exit();
  } catch (error) {
    console.error("Erreur :", error);
    process.exit(1);
  }
};

creerUtilisateurs();
