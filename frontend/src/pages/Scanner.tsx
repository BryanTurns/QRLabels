import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { scanContainer } from "../api";

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isIOS) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          setScanning(true);
          try {
            const barcode_uuid = extractUuid(decodedText);
            const container = await scanContainer(barcode_uuid);
            scanner.stop().catch(() => {});
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

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [navigate]);

  if (isIOS) {
    return (
      <div style={{ maxWidth: 480, margin: "3rem auto", padding: "0 1.5rem", textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>Scan QR Code</h2>
        <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
          <p style={{ fontSize: 48, margin: "0 0 0.5rem" }}>📷</p>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Use your iPhone Camera app</p>
          <p style={{ color: "#555", fontSize: 14, lineHeight: 1.5 }}>
            Open the built-in <strong>Camera</strong> app and point it at a container QR code.
            It will show a notification — tap it to open the container.
          </p>
        </div>
      </div>
    );
  }

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
