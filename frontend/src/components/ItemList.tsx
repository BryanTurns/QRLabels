import { useState } from "react";
import { Item, addItem, updateItem, deleteItem } from "../api";

interface Props {
  containerId: number;
  items: Item[];
  onChanged: () => void;
}

export default function ItemList({ containerId, items, onChanged }: Props) {
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState(1);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addItem(containerId, newName.trim(), newQty);
    setNewName("");
    setNewQty(1);
    onChanged();
  };

  const startEdit = (item: Item) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditQty(item.quantity);
  };

  const handleSave = async (id: number) => {
    await updateItem(id, { name: editName.trim(), quantity: editQty });
    setEditId(null);
    onChanged();
  };

  const handleDelete = async (id: number) => {
    await deleteItem(id);
    onChanged();
  };

  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0",
  };

  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "0.75rem 1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      {items.length === 0 && (
        <p style={{ color: "#888", margin: "0 0 0.75rem" }}>No items yet.</p>
      )}
      {items.map((item) =>
        editId === item.id ? (
          <div key={item.id} style={rowStyle}>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={inputStyle}
              autoFocus
            />
            <input
              type="number"
              min={1}
              value={editQty}
              onChange={(e) => setEditQty(Number(e.target.value))}
              style={{ ...inputStyle, width: 70 }}
            />
            <button onClick={() => handleSave(item.id)} style={btnSmallPrimary}>Save</button>
            <button onClick={() => setEditId(null)} style={btnSmallSecondary}>Cancel</button>
          </div>
        ) : (
          <div key={item.id} style={rowStyle}>
            <span style={{ flex: 1, fontWeight: 500 }}>{item.name}</span>
            <span style={{ color: "#555", fontSize: 14 }}>×{item.quantity}</span>
            <button onClick={() => startEdit(item)} style={btnSmallSecondary}>Edit</button>
            <button onClick={() => handleDelete(item.id)} style={btnSmallDanger}>✕</button>
          </div>
        )
      )}

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Item name…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          type="number"
          min={1}
          value={newQty}
          onChange={(e) => setNewQty(Number(e.target.value))}
          style={{ ...inputStyle, width: 70 }}
        />
        <button type="submit" disabled={!newName.trim()} style={btnSmallPrimary}>Add</button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.35rem 0.6rem", borderRadius: 5, border: "1px solid #ccc", fontSize: 14,
};
const btnSmallPrimary: React.CSSProperties = {
  padding: "0.3rem 0.7rem", borderRadius: 5, background: "#1a1a2e",
  color: "#fff", border: "none", cursor: "pointer", fontSize: 13,
};
const btnSmallSecondary: React.CSSProperties = {
  padding: "0.3rem 0.7rem", borderRadius: 5, background: "#e5e7eb",
  color: "#222", border: "none", cursor: "pointer", fontSize: 13,
};
const btnSmallDanger: React.CSSProperties = {
  padding: "0.3rem 0.6rem", borderRadius: 5, background: "#fee2e2",
  color: "#b91c1c", border: "none", cursor: "pointer", fontSize: 13,
};
