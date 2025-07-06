const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  nom: String,
  telephone: String,
  solde: Number
});

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;
