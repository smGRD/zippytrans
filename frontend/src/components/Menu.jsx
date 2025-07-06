// 📁 frontend/src/components/Menu.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Menu.css"; // Tu peux créer Menu.css si tu veux un style séparé

export default function Menu() {
  return (
    <nav style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
      <Link to="/">🏠 Accueil</Link>
      <Link to="/depot">💰 Dépôt</Link>
      <Link to="/transfert">📤 Transfert</Link>
      <Link to="/historique">🧾 Historique</Link>
    </nav>
  );
}
