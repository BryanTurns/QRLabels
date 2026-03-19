import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, AuthGuard, useAuth } from "./AuthContext";
import ContainerList from "./pages/ContainerList";
import ContainerDetail from "./pages/ContainerDetail";
import Scanner from "./pages/Scanner";
import ScanRedirect from "./pages/ScanRedirect";
import Login from "./pages/Login";
import Register from "./pages/Register";

const nav: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  padding: "0.75rem 1.25rem",
  background: "#1a1a2e",
  color: "#fff",
  alignItems: "center",
};

function Nav() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav style={nav}>
      <strong style={{ flex: 1 }}>
        <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
          Barcode Storage DB
        </Link>
      </strong>
      <Link to="/scan" style={{ color: "#90caf9" }}>Scan QR</Link>
      <span style={{ color: "#aaa", fontSize: 13 }}>{username}</span>
      <button
        onClick={handleLogout}
        style={{ background: "transparent", border: "1px solid #555", color: "#ccc", borderRadius: 5, padding: "0.25rem 0.6rem", cursor: "pointer", fontSize: 13 }}
      >
        Sign out
      </button>
    </nav>
  );
}

function ProtectedApp() {
  return (
    <AuthGuard>
      <Nav />
      <Routes>
        <Route path="/" element={<ContainerList />} />
        <Route path="/containers/:id" element={<ContainerDetail />} />
        <Route path="/scan" element={<Scanner />} />
        <Route path="/scan/:uuid" element={<ScanRedirect />} />
      </Routes>
    </AuthGuard>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
