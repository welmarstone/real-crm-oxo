"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Phone, X, Send } from "lucide-react";
import ruDict from "@/locales/ru.json";

interface ClientActionsProps {
  clientId: string;
  clientName: string;
  phone: string;
  whatsapp: string;
}

export default function ClientActions({ clientId, clientName, phone, whatsapp }: ClientActionsProps) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<"sms" | "whatsapp">("whatsapp");

  const [locale, setLocale] = useState("en");
  const t = (key: string) => {
    if (locale === "ru") return (ruDict as any)[key] || key;
    return key;
  };

  useEffect(() => {
    setLocale(document.cookie.split("; ").find(r => r.startsWith("NEXT_LOCALE="))?.split("=")[1] || "en");
  }, []);

  const [message, setMessage] = useState("");
  useEffect(() => {
    // Only set message after locale loads
    setMessage(`${t("Hello")} ${clientName},\n\n${t("We are reaching out from OXO Insurance regarding your policy.")}\n\n${t("Best regards,\nOXO Team")}`);
  }, [clientName, locale]);

  const sendMessage = () => {
    const encodedMessage = encodeURIComponent(message);
    const number = channel === "whatsapp" ? whatsapp : phone;
    const cleanNumber = number.replace(/\D/g, "");

    if (channel === "whatsapp") {
      window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, "_blank");
    } else {
      window.location.href = `sms:${number}?body=${encodedMessage}`;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: "var(--brand-primary)", color: "white",
          padding: "0.75rem 1.25rem", borderRadius: "100px",
          border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem"
        }}
      >
        <MessageSquare size={18} /> {t("Send Message")}
      </button>

      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
          }}
        >
          <div style={{
            background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)",
            padding: "2rem", width: "100%", maxWidth: "520px",
            border: "1px solid var(--border-color)", boxShadow: "0 24px 48px rgba(0,0,0,0.4)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <MessageSquare size={22} color="var(--brand-primary)" /> {t("Send Message to")} {clientName}
              </h2>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={22} />
              </button>
            </div>

            {/* Channel Selector */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <button
                onClick={() => setChannel("whatsapp")}
                style={{
                  flex: 1, padding: "0.625rem", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer",
                  background: channel === "whatsapp" ? "#25D366" : "var(--bg-tertiary)",
                  color: channel === "whatsapp" ? "white" : "var(--text-secondary)",
                  border: channel === "whatsapp" ? "none" : "1px solid var(--border-color)",
                  transition: "all 0.2s"
                }}
              >
                💬 WhatsApp
              </button>
              <button
                onClick={() => setChannel("sms")}
                style={{
                  flex: 1, padding: "0.625rem", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer",
                  background: channel === "sms" ? "var(--brand-primary)" : "var(--bg-tertiary)",
                  color: channel === "sms" ? "white" : "var(--text-secondary)",
                  border: channel === "sms" ? "none" : "1px solid var(--border-color)",
                  transition: "all 0.2s"
                }}
              >
                <Phone size={14} style={{ marginRight: "0.35rem" }} /> SMS
              </button>
            </div>

            {/* Phone Number Display */}
            <div style={{ marginBottom: "1rem", padding: "0.625rem 0.875rem", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--text-muted)" }}>{t("Sending to:")} </span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                {channel === "whatsapp" ? (whatsapp || t("No WhatsApp number on file")) : (phone || t("No phone number on file"))}
              </span>
            </div>

            {/* Message Composer */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                {t("Message")}
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                style={{
                  width: "100%", padding: "0.875rem", background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)", outline: "none", resize: "vertical",
                  fontFamily: "inherit", fontSize: "0.9rem", lineHeight: 1.6
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  padding: "0.875rem", borderRadius: "100px", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem",
                  background: channel === "whatsapp" ? "#25D366" : "var(--brand-primary)", color: "white"
                }}
              >
                <Send size={18} />
                {channel === "whatsapp" ? t("Open in WhatsApp") : t("Open in SMS")}
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: "0.875rem 1.5rem", borderRadius: "100px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600 }}
              >
                {t("Cancel")}
              </button>
            </div>

            <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
              {channel === "whatsapp" ? t("This will open your device's WhatsApp app to send the message.") : t("This will open your device's SMS app to send the message.")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
