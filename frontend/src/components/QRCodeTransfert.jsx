import React, { useState } from "react";
import QRCode from "qrcode.react";

export default function QRCodeTransfert() {
  const [data, setData] = useState("");
  const [qrValue, setQrValue] = useState("");

  const handleGenerate = () => {
    if (!data) {
      alert("Entrez les infos à coder");
      return;
    }
    setQrValue(data);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📱 Générer un QR Code pour transfert</h2>
      <textarea
        placeholder="Exemple: expediteur|destinataire|montant"
        rows={3}
        style={{ width: "100%" }}
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
      <br />
      <button onClick={handleGenerate}>Générer QR Code</button>

      {qrValue && (
        <div style={{ marginTop: "1rem" }}>
          <QRCode value={qrValue} size={256} />
          <p>Valeur codée: {qrValue}</p>
        </div>
      )}
    </div>
  );
}




