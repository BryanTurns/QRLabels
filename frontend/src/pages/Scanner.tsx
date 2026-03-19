import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { scanContainer } from "../api";

function extractUuid(decoded: string): string {
  // QR codes encode a full URL like http://host/scan/<uuid>
  // Fall back to treating the whole string as a UUID for older codes
  try {
    const url = new URL(decoded);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1];
  } catch {
    return decoded;
  }
}

export default function Scanner() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!window.isSecureContext) {
      setError("Camera requires a secure connection. Access the app via https:// or http://localhost.");
      return;
    }

    let stopped = false;
    const scanner = new Html5Qrcode("qr-reader");

    const stop = () => {
      if (stopped) return;
      stopped = true;
      try {
        scanner.stop().catch(() => {});
      } catch {
        // library throws synchronously when not in a running state
      }
    };

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (stopped) return;
          setScanning(true);
          try {
            const barcode_uuid = extractUuid(decodedText);
            const container = await scanContainer(barcode_uuid);
            stop();
            navigate(`/containers/${container.id}`);
          } catch {
            setError(`No container found for that QR code.`);
            setScanning(false);
          }
        },
        () => {}
      )
      .catch((err) => {
        setError(`Camera error: ${String(err)}`);
      });

    return stop;
  }, [navigate]);

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: "0 1rem", textAlign: "center" }}>
      <h2 style={{ marginBottom: "1rem" }}>Scan QR Code</h2>
      {error && (
        <p style={{ color: "#b91c1c", background: "#fee2e2", padding: "0.5rem 1rem", borderRadius: 6 }}>
          {error}
        </p>
      )}
      {scanning && <p>Looking up container…</p>}
      <div id="qr-reader" style={{ width: "100%" }} />
      <p style={{ color: "#888", marginTop: "1rem", fontSize: 13 }}>
        Point your camera at a container QR code.
      </p>
    </div>
  );
}
