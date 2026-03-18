import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";

export default function Register() {
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
      await registerUser(username, password);
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { description?: string } } })?.response?.data?.description;
      setError(msg ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "2rem", width: "100%", maxWidth: 380, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h1 style={{ margin: "0 0 1.5rem", fontSize: 22, textAlign: "center" }}>Create Account</h1>
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
          <label style={labelStyle}>Password <span style={{ fontWeight: 400, color: "#888" }}>(min 8 characters)</span></label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: 14, color: "#555" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: "0.25rem", color: "#444" };
const inputStyle: React.CSSProperties = { display: "block", width: "100%", padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #ccc", fontSize: 15, marginBottom: "1rem", boxSizing: "border-box" };
const btnStyle: React.CSSProperties = { display: "block", width: "100%", padding: "0.6rem", borderRadius: 6, background: "#1a1a2e", color: "#fff", border: "none", fontSize: 15, cursor: "pointer", marginTop: "0.25rem" };
