import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import SendMessageButton from "@/components/SendMessageButton";
import { getTranslator } from "@/lib/i18n";

export default async function ClientProfile({ params }: { params: { id: string } }) {
  const t = getTranslator();
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: { policies: true, opportunities: true, appointments: true }
  });

  if (!client) return notFound();

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/clients" style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500, display: "inline-block", padding: "0.5rem 0", transition: "color 0.2s" }} className="hover-brand-primary">
          &larr; {t("Back to Directory")}
        </Link>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginTop: "1rem" }}>
          <div style={{ width: 80, height: 80, background: "var(--brand-primary)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <User size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "2.5rem", margin: 0, lineHeight: 1.1 }}>{client.firstName} {client.lastName}</h1>
            <div style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontWeight: 500 }}>{t("Client #")}{client.clientNumber} &bull; Nationality: {client.nationality}</div>
          </div>
          <SendMessageButton clientName={client.firstName} />
        </div>
      </div>

      <div className="grid-cards">
        <div className="glass-panel">
          <h3 style={{ marginBottom: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.875rem", letterSpacing: "0.05em" }}>{t("Active Policies")}</h3>
          {client.policies.length === 0 ? <p style={{ color: "var(--text-muted)" }}>{t("No policies assigned.")}</p> : 
            client.policies.map((p: any) => (
              <div key={p.id} style={{ marginTop: "1rem", padding: "1.25rem", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--status-success)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>{p.providerId}</div>
                  <div className="badge badge-success">Active</div>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>Coverage: {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</div>
                <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.25rem", marginTop: "0.5rem" }}>{p.premiumAmount.toLocaleString()} Kč</div>
              </div>
            ))
          }
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.875rem", letterSpacing: "0.05em" }}>{t("Sales Pipeline")}</h3>
          {client.opportunities.length === 0 ? <p style={{ color: "var(--text-muted)" }}>{t("No active pipeline.")}</p> : 
            client.opportunities.map((o: any) => (
              <div key={o.id} style={{ marginTop: "1rem", padding: "1.25rem", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--brand-primary)" }}>
                <div style={{ fontWeight: 600, color: "var(--brand-primary)" }}>{o.stageName}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>{t("Potential Revenue")}</div>
                <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.25rem", marginTop: "0.25rem" }}>{o.potentialValue.toLocaleString()} Kč</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
