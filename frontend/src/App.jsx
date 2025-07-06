import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import Accueil from "./pages/Accueil";
import Transfert from "./components/Transfert";
import Depot from "./pages/Depot";
import Historique from "./pages/Historique";
import Coffre from "./components/Coffre";
import QRCodePage from "./pages/QRCodePage";
import Connexion from "./pages/Connexion";

export default function App() {
  const navStyle = {
    display: "flex",
    gap: "1rem",
    padding: "0.5rem 0",
    borderBottom: "1px solid #ccc",
    marginBottom: "1rem",
  };

  const activeLinkStyle = {
    fontWeight: "bold",
    textDecoration: "underline",
  };

  return (
    <Router>
      <div style={{ maxWidth: 800, margin: "auto", padding: "1rem" }}>
        <header>
          <h1>ZippyTrans</h1>
          <nav style={navStyle}>
            <NavLink to="/" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} end>
              Accueil
            </NavLink>
            <NavLink to="/depot" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
              Dépôt
            </NavLink>
            <NavLink to="/transfert" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
              Transfert
            </NavLink>
            <NavLink to="/historique" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
              Historique
            </NavLink>
            <NavLink to="/coffre" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
              Coffre
            </NavLink>
            <NavLink to="/qr" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
              QR Code
            </NavLink>
            <NavLink to="/connexion" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
              Connexion
            </NavLink>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/depot" element={<Depot />} />
          <Route path="/transfert" element={<Transfert />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/coffre" element={<Coffre />} />
          <Route path="/qr" element={<QRCodePage />} />
          <Route path="/connexion" element={<Connexion />} />
        </Routes>
      </div>
    </Router>
  );
}
