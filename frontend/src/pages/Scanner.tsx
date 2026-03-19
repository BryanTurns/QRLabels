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

function IOSScanner() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setError("");
    try {
      const scanner = new Html5Qrcode("qr-reader-ios");
      const decoded = await scanner.scanFile(file, false);
      const barcode_uuid = extractUuid(decoded);
      const container = await scanContainer(barcode_uuid);
      navigate(`/containers/${container.id}`);
    } catch {
      setError("No QR code found. Make sure the code fills the frame and try again.");
      setScanning(false);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{ maxWidth: 480, margin: "3rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      <h2 style={{ marginBottom: "1rem" }}>Scan QR Code</h2>
      <div id="qr-reader-ios" style={{ display: "none" }} />
      {error && (
        <p style={{ color: "#b91c1c", background: "#fee2e2", padding: "0.5rem 1rem", borderRadius: 6, marginBottom: "1rem" }}>
          {error}
        </p>
      )}
      {scanning && <p>Looking up container…</p>}
      {!scanning && (
        <label style={{ cursor: "pointer" }}>
          <span style={{ display: "inline-block", padding: "0.75rem 1.5rem", borderRadius: 8, background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 600 }}>
            Point Camera at QR Code
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handlePhoto}
          />
        </label>
      )}
    </div>
  );
}

export default function Scanner() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
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

  if (isIOS) return <IOSScanner />;

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
