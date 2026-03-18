import { getBarcodeUrl } from "../api";
import AuthImg from "./AuthImg";

interface Props {
  containerId: number;
}

export default function BarcodeDisplay({ containerId }: Props) {
  const src = getBarcodeUrl(containerId);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    // For print we need the blob URL which AuthImg has already cached
    const canvas = document.querySelector<HTMLImageElement>("#qr-img");
    const imgSrc = canvas?.src ?? "";
    win.document.write(`
      <html><body style="text-align:center;padding:2rem">
        <img src="${imgSrc}" style="width:300px;height:300px" />
        <script>window.onload=()=>{window.print();window.close();}<\/script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1rem", background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <AuthImg
        id="qr-img"
        src={src}
        alt="QR Code"
        style={{ width: 140, height: 140, imageRendering: "pixelated" }}
        fallback={<div style={{ width: 140, height: 140, background: "#f0f0f0", borderRadius: 4 }} />}
      />
      <div>
        <p style={{ margin: "0 0 0.5rem", color: "#444", fontSize: 14 }}>
          Scan this code to open this container on any device.
        </p>
        <button
          onClick={handlePrint}
          style={{ padding: "0.4rem 0.9rem", borderRadius: 6, background: "#1a1a2e", color: "#fff", border: "none", cursor: "pointer", fontSize: 14 }}
        >
          Print QR Code
        </button>
      </div>
    </div>
  );
}
