// utils/validation.js

const regexNumero = /^(01|05|07|27|25|03|04|06|08|09)\d{8}$/;

function validerNumero(numero) {
  if (typeof numero !== "string") return false;
  return regexNumero.test(numero.trim());
}

function validerMontant(montant) {
  if (typeof montant !== "number") return false;
  if (montant <= 0 || !Number.isInteger(montant)) return false;
  return true;
}

module.exports = { validerNumero, validerMontant };
