import { useEffect } from "react";
import AuthImg from "./AuthImg";

interface Props {
  src: string;
  onClose: () => void;
}

export default function Lightbox({ src, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "zoom-out",
      }}
    >
      <AuthImg
        src={src}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 6, objectFit: "contain", cursor: "default" }}
        alt="full size"
      />
    </div>
  );
}
