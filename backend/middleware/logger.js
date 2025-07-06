function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📝 Corps de la requête :', req.body);
  }
  next();
}

module.exports = logger;
