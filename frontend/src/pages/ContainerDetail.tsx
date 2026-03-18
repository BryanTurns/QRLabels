import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getContainer, updateContainer, deleteContainer, Container } from "../api";
import ItemList from "../components/ItemList";
import PhotoGallery from "../components/PhotoGallery";
import BarcodeDisplay from "../components/BarcodeDisplay";

export default function ContainerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [container, setContainer] = useState<Container | null>(null);
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const containerId = Number(id);

  const load = () =>
    getContainer(containerId).then((c) => {
      setContainer(c);
      setEditName(c.name);
    });

  useEffect(() => { load(); }, [containerId]);

  if (!container) return <p style={{ padding: "2rem", textAlign: "center" }}>Loading…</p>;

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateContainer(containerId, editName.trim());
      setEditing(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this container and all its items/photos?")) return;
    await deleteContainer(containerId);
    navigate("/");
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <Link to="/" style={{ color: "#0066cc", fontSize: 14 }}>← All containers</Link>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1rem 0" }}>
        {editing ? (
          <>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={{ flex: 1, fontSize: 22, fontWeight: 700, padding: "0.25rem 0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
              autoFocus
            />
            <button onClick={handleSaveName} disabled={saving} style={btnPrimary}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(false)} style={btnSecondary}>Cancel</button>
          </>
        ) : (
          <>
            <h1 style={{ flex: 1, margin: 0, fontSize: 24 }}>{container.name}</h1>
            <button onClick={() => setEditing(true)} style={btnSecondary}>Rename</button>
            <button onClick={handleDelete} style={btnDanger}>Delete</button>
          </>
        )}
      </div>

      <BarcodeDisplay containerId={containerId} />

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: 18, marginBottom: "0.75rem" }}>Items</h2>
        <ItemList
          containerId={containerId}
          items={container.items ?? []}
          onChanged={load}
        />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: 18, marginBottom: "0.75rem" }}>Photos</h2>
        <PhotoGallery
          containerId={containerId}
          photos={container.photos ?? []}
          onChanged={load}
        />
      </section>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: "0.4rem 0.9rem", borderRadius: 6, background: "#1a1a2e",
  color: "#fff", border: "none", cursor: "pointer", fontSize: 14,
};
const btnSecondary: React.CSSProperties = {
  padding: "0.4rem 0.9rem", borderRadius: 6, background: "#e5e7eb",
  color: "#222", border: "none", cursor: "pointer", fontSize: 14,
};
const btnDanger: React.CSSProperties = {
  padding: "0.4rem 0.9rem", borderRadius: 6, background: "#fee2e2",
  color: "#b91c1c", border: "none", cursor: "pointer", fontSize: 14,
};
