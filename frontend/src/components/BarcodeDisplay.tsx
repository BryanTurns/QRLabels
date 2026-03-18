import { getBarcodeUrl } from "../api";

interface Props {
  containerId: number;
}

export default function BarcodeDisplay({ containerId }: Props) {
  const url = getBarcodeUrl(containerId);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><body style="text-align:center;padding:2rem">
        <img src="${url}" style="width:300px;height:300px" />
        <script>window.onload=()=>{window.print();window.close();}<\/script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1rem", background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <img
        src={url}
        alt="QR Code"
        style={{ width: 140, height: 140, imageRendering: "pixelated" }}
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
