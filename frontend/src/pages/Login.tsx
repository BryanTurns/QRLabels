import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { loginUser } from "../api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      login(data.token, data.username);
      navigate("/", { replace: true });
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "2rem", width: "100%", maxWidth: 380, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h1 style={{ margin: "0 0 1.5rem", fontSize: 22, textAlign: "center" }}>Barcode Storage DB</h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <p style={{ color: "#b91c1c", background: "#fee2e2", padding: "0.5rem 0.75rem", borderRadius: 6, marginBottom: "1rem", fontSize: 14 }}>
              {error}
            </p>
          )}
          <label style={labelStyle}>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            style={inputStyle}
          />
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: 14, color: "#555" }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: "0.25rem", color: "#444" };
const inputStyle: React.CSSProperties = { display: "block", width: "100%", padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #ccc", fontSize: 15, marginBottom: "1rem", boxSizing: "border-box" };
const btnStyle: React.CSSProperties = { display: "block", width: "100%", padding: "0.6rem", borderRadius: 6, background: "#1a1a2e", color: "#fff", border: "none", fontSize: 15, cursor: "pointer", marginTop: "0.25rem" };
