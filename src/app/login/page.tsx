"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@crm-oxo.cz");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@crm-oxo.cz" && password === "password1234") {
      document.cookie = "crm-auth=authenticated; path=/; max-age=86400";
      router.push("/dashboard");
    } else {
      setError("Invalid credentials.");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop') no-repeat center center/cover" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(10px)" }}></div>
      
      <div className="glass-panel" style={{ position: "relative", zIndex: 10, maxWidth: "400px", width: "100%", padding: "3rem 2rem", background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 48, height: 48, background: "var(--brand-primary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", margin: "0 auto 1rem" }}>
            <ShieldAlert size={24} />
          </div>
          <h1 style={{ fontSize: "1.5rem", color: "white" }}>CRM OXO</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.5rem" }}>Secure Admin Portal</p>
        </div>

        {error && <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "1.5rem", fontSize: "0.875rem", textAlign: "center" }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", outline: "none" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Master Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", outline: "none" }}
            />
          </div>
          
          <button type="submit" style={{ background: "var(--brand-primary)", color: "white", padding: "1rem", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = "0.9"} onMouseOut={e => e.currentTarget.style.opacity = "1"}>
            Authenticate Securely
          </button>
        </form>
      </div>
    </div>
  );
}
