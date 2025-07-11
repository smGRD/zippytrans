import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

const QRCodeScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(onScanSuccess, (error) => {
      console.warn("Erreur scan :", error);
    });

    return () => {
      scanner.clear();
    };
  }, [onScanSuccess]);

  return <div id="reader" />;
};

export default QRCodeScanner;
