module.exports = function validateTelephone(req, res, next) {
  const regexNumero = /^(01|05|07|27|25|03|04|06|08|09)\d{8}$/;

  if (req.body.telephone && !regexNumero.test(req.body.telephone)) {
    return res.status(400).json({ message: "Numéro de téléphone invalide" });
  }

  next();
};
