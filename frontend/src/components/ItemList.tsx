import { useRef, useState } from "react";
import { Item, ItemPhoto, addItem, updateItem, deleteItem, uploadItemPhoto, deleteItemPhoto, getPhotoUrl } from "../api";
import AuthImg from "./AuthImg";
import Lightbox from "./Lightbox";

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
  const [expandedPhotos, setExpandedPhotos] = useState<Set<number>>(new Set());

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

  const togglePhotos = (id: number) =>
    setExpandedPhotos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0",
  };

  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "0.75rem 1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      {items.length === 0 && (
        <p style={{ color: "#888", margin: "0 0 0.75rem" }}>No items yet.</p>
      )}
      {items.map((item) => (
        <div key={item.id}>
          {editId === item.id ? (
            <div style={rowStyle}>
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
            <div style={rowStyle}>
              <div style={{
                width: 40, height: 40, borderRadius: 5, flexShrink: 0,
                background: "#e5e7eb", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.photos[0]
                  ? <AuthImg src={getPhotoUrl(item.photos[0].filename)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 18 }}>🏷️</span>
                }
              </div>
              <span style={{ flex: 1, fontWeight: 500 }}>{item.name}</span>
              <span style={{ color: "#555", fontSize: 14 }}>×{item.quantity}</span>
              <button
                onClick={() => togglePhotos(item.id)}
                style={{ ...btnSmallSecondary, color: item.photos.length > 0 ? "#1a1a2e" : "#888" }}
                title="Toggle photos"
              >
                📷{item.photos.length > 0 && ` ${item.photos.length}`}
              </button>
              <button onClick={() => startEdit(item)} style={btnSmallSecondary}>Edit</button>
              <button onClick={() => handleDelete(item.id)} style={btnSmallDanger}>✕</button>
            </div>
          )}

          {expandedPhotos.has(item.id) && (
            <ItemPhotoSection
              item={item}
              onChanged={onChanged}
            />
          )}
        </div>
      ))}

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

function ItemPhotoSection({ item, onChanged }: { item: Item; onChanged: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadItemPhoto(item.id, file);
    if (fileRef.current) fileRef.current.value = "";
    onChanged();
  };

  const handleDelete = async (photo: ItemPhoto) => {
    await deleteItemPhoto(photo.id);
    onChanged();
  };

  return (
    <div style={{ padding: "0.5rem 0 0.75rem 0.25rem", borderBottom: "1px solid #f0f0f0" }}>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: item.photos.length ? "0.5rem" : 0 }}>
        {item.photos.map((photo) => (
          <div key={photo.id} style={{ position: "relative" }}>
            <AuthImg
              src={getPhotoUrl(photo.filename)}
              alt="item photo"
              onClick={() => setLightboxSrc(getPhotoUrl(photo.filename))}
              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 5, display: "block", cursor: "zoom-in" }}
            />
            <button
              onClick={() => handleDelete(photo)}
              style={{
                position: "absolute", top: 2, right: 2,
                background: "rgba(0,0,0,0.6)", color: "#fff",
                border: "none", borderRadius: "50%", width: 18, height: 18,
                cursor: "pointer", fontSize: 11, lineHeight: "18px", textAlign: "center",
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <label style={{ cursor: "pointer" }}>
        <span style={{ ...btnSmallSecondary, display: "inline-block" }}>Upload photo</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleUpload}
        />
      </label>
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
