import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getContainers, createContainer, deleteContainer, Container } from "../api";

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  padding: "1rem 1.25rem",
  marginBottom: "0.75rem",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

export default function ContainerList() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const load = () => getContainers().then(setContainers);
  useEffect(() => { load(); }, []);

  const filtered = containers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const c = await createContainer(newName.trim());
      setNewName("");
      navigate(`/containers/${c.id}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (!confirm("Delete this container and all its items/photos?")) return;
    await deleteContainer(id);
    load();
  };

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1rem" }}>
      <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New container name…"
          style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }}
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          style={{ padding: "0.5rem 1rem", borderRadius: 6, background: "#1a1a2e", color: "#fff", border: "none", cursor: "pointer", fontSize: 15 }}
        >
          {creating ? "Creating…" : "New Container"}
        </button>
      </form>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search containers…"
        style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #ccc", fontSize: 15, marginBottom: "1rem" }}
      />

      {filtered.length === 0 && (
        <p style={{ color: "#888", textAlign: "center" }}>No containers yet. Create one above.</p>
      )}

      {filtered.map((c) => (
        <Link key={c.id} to={`/containers/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div style={card}>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 16 }}>{c.name}</span>
            <span style={{ color: "#888", fontSize: 13 }}>
              {new Date(c.created_at).toLocaleDateString()}
            </span>
            <button
              onClick={(e) => handleDelete(e, c.id)}
              style={{ background: "#fee2e2", border: "none", borderRadius: 4, padding: "0.25rem 0.6rem", cursor: "pointer", color: "#b91c1c" }}
            >
              Delete
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}
