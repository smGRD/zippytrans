const validatePhoneNumber = (req, res, next) => {
  const regexNumero = /^(01|05|07|27|25|03|04|06|08|09)\d{8}$/;
  const { expediteur, destinataire, telephone } = req.body;

  const numeros = [expediteur, destinataire, telephone].filter(Boolean);

  for (const numero of numeros) {
    if (!regexNumero.test(numero.trim())) {
      return res.status(400).json({ message: "Numéro invalide : " + numero });
    }
  }

  next();
};

module.exports = validatePhoneNumber;
