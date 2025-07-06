const express = require("express");
const router = express.Router();
const { utilisateurs } = require("../data/db");

router.get("/:numero", (req, res) => {
  const numero = req.params.numero.trim();
  const user = utilisateurs.find(u => u.telephone === numero);

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  res.json({ solde: user.solde });
});

module.exports = router;
