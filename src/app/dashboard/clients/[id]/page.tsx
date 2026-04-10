import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { User, Phone, Mail, MapPin, FileText, Shield, Calendar, AlertTriangle } from "lucide-react";
import { getTranslator } from "@/lib/i18n";
import ClientActions from "./ClientActions";

export default async function ClientProfile({ params }: { params: { id: string } }) {
  const t = getTranslator();
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      policies: { include: { insuranceCompany: true } },
      opportunities: true,
      appointments: true,
      notes: { orderBy: { createdAt: "desc" } },
      middleman: true
    }
  });

  if (!client) return notFound();

  const now = new Date();
  const getDaysLeft = (endDate: Date) => Math.ceil((new Date(endDate).getTime() - now.getTime()) / 86400000);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/clients" style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
          ← {t("Back to Directory")}
        </Link>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", marginTop: "1rem", flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, background: "var(--brand-primary)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
            <User size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "2.5rem", margin: 0, lineHeight: 1.1 }}>{client.firstName} {client.lastName}</h1>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>{client.clientNumber}</span>
              <span style={{ fontWeight: 700, color: "var(--brand-primary)", background: "rgba(37,99,235,0.1)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.875rem" }}>
                {client.insuranceId}
              </span>
              {client.middleman && (
                <Link href={`/dashboard/middlemen/${client.middleman.id}`} style={{ fontSize: "0.8rem", background: "rgba(244,114,182,0.15)", color: "#f472b6", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, textDecoration: "none" }}>
                  via {client.middleman.fullName}
                </Link>
              )}
            </div>
          </div>
          {/* Client Actions (messaging, etc.) */}
          <ClientActions
            clientId={client.id}
            clientName={`${client.firstName} ${client.lastName}`}
            phone={client.phone || ""}
            whatsapp={client.whatsappNumber || client.phone || ""}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* Personal Info */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: "1.25rem", color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em" }}>{t("Personal Details")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[
              { icon: <MapPin size={16} />, label: t("Address"), value: client.address },
              { icon: <Phone size={16} />, label: t("Phone"), value: client.phone },
              { icon: <Phone size={16} />, label: t("WhatsApp"), value: client.whatsappNumber },
              { icon: <Mail size={16} />, label: t("Email"), value: client.email },
              { icon: <FileText size={16} />, label: t("Passport"), value: client.passportNumber },
              { icon: <FileText size={16} />, label: t("Residence Permit"), value: client.residencePermitNumber },
              { icon: <Shield size={16} />, label: t("Nationality"), value: client.nationality },
              { icon: <Calendar size={16} />, label: t("Visa Expiry"), value: client.visaExpiryDate ? new Date(client.visaExpiryDate).toLocaleDateString() : null },
            ].map(({ icon, label, value }) => value ? (
              <div key={label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ color: "var(--text-muted)", marginTop: "0.1rem", flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.1rem" }}>{label}</div>
                  <div style={{ fontWeight: 500 }}>{value}</div>
                </div>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Active Policies */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: "1.25rem", color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em" }}>{t("Active Policies")}</h3>
          {client.policies.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>{t("No policies assigned.")}</p>
          ) : (
            client.policies.map((p: any) => {
              const daysLeft = getDaysLeft(p.endDate);
              const isCritical = daysLeft <= 7 && daysLeft > 0;
              const isWarning = daysLeft <= 30 && daysLeft > 7;
              const isExpired = daysLeft <= 0;
              return (
                <div key={p.id} style={{ padding: "1.25rem", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", borderLeft: `4px solid ${isExpired ? "#ef4444" : isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "var(--status-success)"}`, marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>{p.providerId}</div>
                    {isExpired ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#ef4444", fontWeight: 700, fontSize: "0.8rem" }}><AlertTriangle size={14} /> {t("Expired")}</span>
                    ) : isCritical ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#ef4444", fontWeight: 700, fontSize: "0.8rem" }}><AlertTriangle size={14} /> {daysLeft}d left</span>
                    ) : isWarning ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#f59e0b", fontWeight: 700, fontSize: "0.8rem" }}><AlertTriangle size={14} /> {daysLeft}d left</span>
                    ) : (
                      <span className="badge badge-success">Active</span>
                    )}
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                    {new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.25rem", marginTop: "0.5rem" }}>{p.premiumAmount.toLocaleString()} Kč</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <div style={{ fontSize: "0.75rem", background: "var(--bg-secondary)", padding: "0.5rem", borderRadius: "6px", textAlign: "center" }}>
                      <div style={{ color: "var(--text-muted)" }}>{t("Company 50%")}</div>
                      <div style={{ fontWeight: 700 }}>{Math.round(p.companyShare || p.premiumAmount * 0.5).toLocaleString()} Kč</div>
                    </div>
                    <div style={{ fontSize: "0.75rem", background: "var(--bg-secondary)", padding: "0.5rem", borderRadius: "6px", textAlign: "center" }}>
                      <div style={{ color: "var(--text-muted)" }}>OXO 30%</div>
                      <div style={{ fontWeight: 700, color: "var(--status-success)" }}>{Math.round(p.oxoShare || p.premiumAmount * 0.3).toLocaleString()} Kč</div>
                    </div>
                    <div style={{ fontSize: "0.75rem", background: "var(--bg-secondary)", padding: "0.5rem", borderRadius: "6px", textAlign: "center" }}>
                      <div style={{ color: "var(--text-muted)" }}>{t("Middleman 20%")}</div>
                      <div style={{ fontWeight: 700, color: "#f472b6" }}>{Math.round(p.middlemanShare || 0).toLocaleString()} Kč</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Notes Section */}
        <div className="glass-panel" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ marginBottom: "1.25rem", color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em" }}>{t("Notes")}</h3>
          <ClientNotes clientId={client.id} initialNotes={client.notes} t={t} />
        </div>

      </div>
    </div>
  );
}

function ClientNotes({ clientId, initialNotes, t }: { clientId: string; initialNotes: any[]; t: any }) {
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        {initialNotes.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>{t("No notes yet. Add the first note below.")}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {initialNotes.map((note: any) => (
              <div key={note.id} style={{ background: "var(--bg-tertiary)", padding: "1rem 1.25rem", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--brand-primary)" }}>
                <div style={{ color: "var(--text-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{note.content}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddNoteForm clientId={clientId} />
    </div>
  );
}

import AddNoteForm from "./AddNoteForm";
