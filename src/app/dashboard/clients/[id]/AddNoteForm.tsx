"use client";
import { useState, useEffect } from "react";
import { PenLine, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import ruDict from "@/locales/ru.json";

export default function AddNoteForm({ clientId }: { clientId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [locale, setLocale] = useState("en");
  const t = (key: string) => {
    if (locale === "ru") return (ruDict as any)[key] || key;
    return key;
  };

  useEffect(() => {
    setLocale(document.cookie.split("; ").find(r => r.startsWith("NEXT_LOCALE="))?.split("=")[1] || "en");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${clientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error("Failed to save note");
      setContent("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ position: "relative" }}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={t("Add a note about this client...")}
          rows={3}
          style={{
            width: "100%", padding: "0.875rem 1rem", paddingRight: "3.5rem",
            background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none",
            resize: "vertical", fontFamily: "inherit", fontSize: "0.95rem", lineHeight: 1.5
          }}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          title={t("Save note")}
          style={{
            position: "absolute", right: "0.75rem", bottom: "0.75rem",
            background: content.trim() ? "var(--brand-primary)" : "var(--bg-tertiary)",
            color: content.trim() ? "white" : "var(--text-muted)",
            border: "none", borderRadius: "8px", width: "36px", height: "36px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: content.trim() ? "pointer" : "default", transition: "all 0.2s"
          }}
        >
          {loading ? "..." : <Send size={16} />}
        </button>
      </div>
      {error && <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</div>}
    </form>
  );
}
