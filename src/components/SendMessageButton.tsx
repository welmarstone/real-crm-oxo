"use client";
import { MessageSquare } from "lucide-react";

export default function SendMessageButton({ clientName }: { clientName: string }) {
  return (
    <button 
      style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", border: "1px solid var(--border-color)", cursor: "pointer", borderRadius: "100px", background: "var(--bg-secondary)", color: "var(--brand-primary)", fontWeight: 600, transition: "transform 0.1s" }} 
      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      onClick={() => alert(`Connection to Twilio required.\n\nSimulated SMS Sent to ${clientName}:\n"Hello ${clientName}, this is a reminder that your Insurance is due for a renewal! Contact us soon for more details. \t OXO Pojisteni"`)}
    >
      <MessageSquare size={18} /> Send SMS
    </button>
  );
}
