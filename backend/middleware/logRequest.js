const logRequest = (req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    console.log("🔸 Données reçues :", req.body);
  }
  next();
};

module.exports = logRequest;
