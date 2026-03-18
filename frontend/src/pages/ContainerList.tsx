import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getContainers,
  createContainer,
  deleteContainer,
  searchAll,
  Container,
  ItemSearchResult,
} from "../api";

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

interface DisplayState {
  containers: Container[];
  items: ItemSearchResult[];
  isSearch: boolean;
}

export default function ContainerList() {
  const allContainersRef = useRef<Container[]>([]);
  const [displayed, setDisplayed] = useState<DisplayState>({ containers: [], items: [], isSearch: false });
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getContainers().then((cs) => {
      allContainersRef.current = cs;
      setDisplayed({ containers: cs, items: [], isSearch: false });
    });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setDisplayed({ containers: allContainersRef.current, items: [], isSearch: false });
      return;
    }
    const t = setTimeout(() => {
      searchAll(search.trim()).then((results) =>
        setDisplayed({ ...results, isSearch: true })
      );
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

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
    const cs = await getContainers();
    allContainersRef.current = cs;
    setDisplayed({ containers: cs, items: [], isSearch: false });
    setSearch("");
  };

  const { containers, items, isSearch } = displayed;

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
        placeholder="Search containers and items…"
        style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #ccc", fontSize: 15, marginBottom: "1rem" }}
      />

      {/* Containers */}
      {isSearch && <h3 style={{ margin: "0 0 0.5rem", fontSize: 13, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Containers</h3>}
      {containers.length === 0 && !isSearch && (
        <p style={{ color: "#888", textAlign: "center" }}>No containers yet. Create one above.</p>
      )}
      {containers.length === 0 && isSearch && (
        <p style={{ color: "#888", fontSize: 14, marginBottom: "0.5rem" }}>No matching containers.</p>
      )}
      {containers.map((c) => (
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

      {/* Item results */}
      {isSearch && (
        <>
          <h3 style={{ margin: "1.25rem 0 0.5rem", fontSize: 13, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Items</h3>
          {items.length === 0 && (
            <p style={{ color: "#888", fontSize: 14 }}>No matching items.</p>
          )}
          {items.map((item) => (
            <Link key={item.id} to={`/containers/${item.container_id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={card}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{item.name}</span>
                  <span style={{ color: "#888", fontSize: 13, marginLeft: "0.5rem" }}>×{item.quantity}</span>
                </div>
                <span style={{ color: "#555", fontSize: 13 }}>in {item.container_name}</span>
              </div>
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
