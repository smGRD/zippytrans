// 📁 backend/middleware/auth.js
module.exports = function (req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const validKey = "zippy123"; // 🔐 Clé API secrète

  if (!apiKey || apiKey !== validKey) {
    return res.status(403).json({ message: "Accès refusé. Clé API invalide." });
  }

  next(); // ✅ Autorisé
};

