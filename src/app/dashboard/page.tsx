import { prisma } from "@/lib/prisma";
import SalesFunnel from "@/components/SalesFunnel";
import { Users, TrendingUp, Calendar } from "lucide-react";
import Link from 'next/link';
import { getTranslator } from "@/lib/i18n";

export default async function DashboardPage() {
  const t = getTranslator();
  const clientsCount = await prisma.client.count();
  const allPolicies = await prisma.policy.findMany();
  
  const totalPremium = allPolicies.reduce((acc: number, p: any) => acc + p.premiumAmount, 0);
  const mrr = Math.round(totalPremium / 12);

  const upcomingAppointments = await prisma.appointment.count({
    where: {
      date: {
        gte: new Date(),
        lte: new Date(Date.now() + 86400000 * 7)
      }
    }
  });

  const funnelStages = [
    { name: t("Opportunity identification"), value: 37, fill: "#e879f9", def: t("Potential clients or persons who we received a message from.") },
    { name: t("Initial meeting"), value: 20, fill: "#c084fc", def: t("Responded to their message and/or waiting for the initial meeting.") },
    { name: t("Needs analysis"), value: 13, fill: "#818cf8", def: t("Gathering specifics (visa type, age) to find the right product.") },
    { name: t("Price quote"), value: 8, fill: "#60a5fa", def: t("Sending the proposed policy term and costs for review.") },
    { name: t("Pre-closing"), value: 2, fill: "#34d399", def: t("Waiting to get their documents (purchased but pending physical documents).") }
  ];

  const recentClients = await prisma.client.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { policies: true }
  });
  
  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>{t("Overview Dashboard")}</h1>
      
      <div className="grid-cards">
        <div className="glass-panel kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-title">{t("Active Clients")}</div>
            <Users size={20} color="var(--brand-primary)" />
          </div>
          <div className="kpi-value">{clientsCount}</div>
        </div>

        <div className="glass-panel kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-title">{t("Monthly Rec. Revenue")}</div>
            <TrendingUp size={20} color="var(--status-success)" />
          </div>
          <div className="kpi-value">{mrr.toLocaleString()} Kč</div>
        </div>

        <div className="glass-panel kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-title">{t("Weekly Appointments")}</div>
            <Calendar size={20} color="var(--status-warning)" />
          </div>
          <div className="kpi-value">{upcomingAppointments}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", marginTop: "2rem" }}>
        
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t("Sales Pipeline")}</h2>
          <SalesFunnel data={funnelStages} />
          
          <div style={{ display: 'grid', gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', overflowX: "auto" }}>
            {funnelStages.map(stage => (
              <div key={stage.name} style={{ textAlign: 'center', fontSize: '0.875rem', padding: "0.75rem 0.5rem", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontWeight: 700, color: stage.fill, marginBottom: "0.25rem" }}>{stage.name}</div>
                <div style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>{stage.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: "0.75rem", lineHeight: 1.4 }}>{stage.def}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t("Recent Clients")}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {recentClients.map(client => (
              <div key={client.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{client.firstName} {client.lastName}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem" }}>
                    <span>{client.clientNumber}</span>
                    {client.policies.length > 0 && (
                      <span className="badge" style={{ backgroundColor: "rgba(37, 99, 235, 0.1)", color: "var(--brand-primary)", padding: "2px 6px", fontSize: "0.7rem", borderRadius: "4px" }}>
                        INS-{client.policies[0].id.substring(0, 8).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/dashboard/clients/${client.id}`} style={{ color: "var(--brand-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                  {t("View Profile →")}
                </Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link href="/dashboard/clients" style={{ color: "var(--brand-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
              {t("View all clients →")}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
