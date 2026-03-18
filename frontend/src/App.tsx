import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ContainerList from "./pages/ContainerList";
import ContainerDetail from "./pages/ContainerDetail";
import Scanner from "./pages/Scanner";
import ScanRedirect from "./pages/ScanRedirect";

const nav: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  padding: "0.75rem 1.25rem",
  background: "#1a1a2e",
  color: "#fff",
  alignItems: "center",
};

export default function App() {
  return (
    <BrowserRouter>
      <nav style={nav}>
        <strong style={{ flex: 1 }}>
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            Barcode Storage DB
          </Link>
        </strong>
        <Link to="/scan" style={{ color: "#90caf9" }}>
          Scan QR
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<ContainerList />} />
        <Route path="/containers/:id" element={<ContainerDetail />} />
        <Route path="/scan" element={<Scanner />} />
        <Route path="/scan/:uuid" element={<ScanRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
