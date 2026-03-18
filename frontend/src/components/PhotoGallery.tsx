import { useRef, useState } from "react";
import { Photo, uploadPhoto, deletePhoto, getPhotoUrl } from "../api";
import Lightbox from "./Lightbox";

interface Props {
  containerId: number;
  photos: Photo[];
  onChanged: () => void;
}

export default function PhotoGallery({ containerId, photos, onChanged }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadPhoto(containerId, file);
    if (fileRef.current) fileRef.current.value = "";
    onChanged();
  };

  const handleDelete = async (id: number) => {
    await deletePhoto(id);
    onChanged();
  };

  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "0.75rem 1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: photos.length ? "0.75rem" : 0 }}>
        {photos.map((photo) => (
          <div key={photo.id} style={{ position: "relative" }}>
            <img
              src={getPhotoUrl(photo.filename)}
              alt="container photo"
              onClick={() => setLightboxSrc(getPhotoUrl(photo.filename))}
              style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 6, display: "block", cursor: "zoom-in" }}
            />
            <button
              onClick={() => handleDelete(photo.id)}
              style={{
                position: "absolute", top: 3, right: 3,
                background: "rgba(0,0,0,0.6)", color: "#fff",
                border: "none", borderRadius: "50%", width: 22, height: 22,
                cursor: "pointer", fontSize: 13, lineHeight: "22px", textAlign: "center",
              }}
              title="Delete photo"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <label style={{ display: "inline-block", cursor: "pointer" }}>
        <span style={{ padding: "0.4rem 0.9rem", borderRadius: 6, background: "#e5e7eb", color: "#222", fontSize: 14, userSelect: "none" }}>
          Upload Photo
        </span>
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
