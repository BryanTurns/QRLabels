import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { scanContainer } from "../api";

/**
 * Handles direct URL opens from a phone camera scan.
 * URL pattern: /scan/:uuid
 * Looks up the container and redirects to its detail page.
 */
export default function ScanRedirect() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uuid) return;
    scanContainer(uuid)
      .then((c) => navigate(`/containers/${c.id}`, { replace: true }))
      .catch(() => setError(`No container found for this QR code.`));
  }, [uuid, navigate]);

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "3rem auto", padding: "0 1rem", textAlign: "center" }}>
        <p style={{ color: "#b91c1c", background: "#fee2e2", padding: "1rem", borderRadius: 8 }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <p style={{ textAlign: "center", padding: "3rem", color: "#888" }}>Loading container…</p>
  );
}
