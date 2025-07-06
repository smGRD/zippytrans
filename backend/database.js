const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("zippytrans.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    telephone TEXT UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    solde INTEGER DEFAULT 0
  )`);
});

module.exports = db;
