import { prisma } from "@/lib/prisma";
import SalesFunnel from "@/components/SalesFunnel";
import { Users, TrendingUp, Calendar, Handshake, UserCheck, BarChart3, DollarSign, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { getTranslator } from "@/lib/i18n";

export default async function DashboardPage() {
  const t = getTranslator();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
  const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
  const thirtyDaysAgo = new Date(Date.now() - 86400000 * 30);
  const oneYearAgo = new Date(Date.now() - 86400000 * 365);

  // Client counts
  const clientsCount = await prisma.client.count();
  const clientsLastMonth = await prisma.client.count({
    where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
  });
  const clientsLastYear = await prisma.client.count({
    where: { createdAt: { gte: startOfLastYear, lte: endOfLastYear } }
  });
  // Estimate: monthly avg × 12
  const clientsThisYear = await prisma.client.count({ where: { createdAt: { gte: startOfYear } } });
  const monthsElapsed = now.getMonth() + 1;
  const estimatedYearlyClients = Math.round((clientsThisYear / monthsElapsed) * 12);

  // Revenue
  const allPolicies = await prisma.policy.findMany();
  const totalPremium = allPolicies.reduce((acc: number, p: any) => acc + p.premiumAmount, 0);
  const totalOxoRevenue = allPolicies.reduce((acc: number, p: any) => acc + (p.oxoShare || p.premiumAmount * 0.3), 0);
  const totalMiddlemanCommissions = allPolicies.reduce((acc: number, p: any) => acc + (p.middlemanShare || 0), 0);
  const mrr = Math.round(totalOxoRevenue / 12);

  // Appointments
  const upcomingAppointments = await prisma.appointment.count({
    where: { date: { gte: now, lte: new Date(Date.now() + 86400000 * 7) } }
  });
  const appointmentsLastMonth = await prisma.appointment.count({
    where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
  });
  const appointmentsLastYear = await prisma.appointment.count({
    where: { createdAt: { gte: startOfLastYear, lte: endOfLastYear } }
  });
  const appointmentsThisYear = await prisma.appointment.count({ where: { createdAt: { gte: startOfYear } } });
  const estimatedYearlyAppointments = Math.round((appointmentsThisYear / monthsElapsed) * 12);

  // Middlemen
  const middlemenCount = await prisma.middleman.count();

  // Expiring policies (within 30 days)
  const expiringPolicies = await prisma.policy.count({
    where: { endDate: { gte: now, lte: new Date(Date.now() + 86400000 * 30) } }
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
    include: { policies: true, middleman: true }
  });

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>{t("Overview Dashboard")}</h1>

      {/* Primary KPIs */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-panel kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-title">{t("Active Clients")}</div>
            <Users size={20} color="var(--brand-primary)" />
          </div>
          <div className="kpi-value">{clientsCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {clientsLastMonth} {t("last month")} &bull; {clientsLastYear} {t("last year")}
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-title">{t("Estimated Yearly Clients")}</div>
            <BarChart3 size={20} color="var(--brand-primary)" />
          </div>
          <div className="kpi-value">{estimatedYearlyClients}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {t("Based on")} {monthsElapsed} {t("months of data")}
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-title">{t("Monthly Revenue (OXO)")}</div>
            <TrendingUp size={20} color="var(--status-success)" />
          </div>
          <div className="kpi-value">{mrr.toLocaleString()} Kč</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {Math.round(totalOxoRevenue).toLocaleString()} Kč {t("total (OXO 30%)")}
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-title">{t("Weekly Appointments")}</div>
            <Calendar size={20} color="var(--status-warning)" />
          </div>
          <div className="kpi-value">{upcomingAppointments}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {appointmentsLastMonth} {t("last month")} &bull; est. {estimatedYearlyAppointments}/yr
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-title">{t("Middlemen Commissions")}</div>
            <Handshake size={20} color="#f472b6" />
          </div>
          <div className="kpi-value">{Math.round(totalMiddlemanCommissions).toLocaleString()} Kč</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {middlemenCount} {t("active middlemen")}
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-title">{t("Expiring Policies")}</div>
            <AlertTriangle size={20} color="var(--status-warning)" />
          </div>
          <div className="kpi-value" style={{ color: expiringPolicies > 0 ? 'var(--status-warning)' : 'var(--text-primary)' }}>
            {expiringPolicies}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {t("Renewing within 30 days")}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
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
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {client.firstName} {client.lastName}
                    {client.middleman && (
                      <span style={{ fontSize: '0.7rem', background: 'rgba(244,114,182,0.15)', color: '#f472b6', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        via {client.middleman.fullName}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem" }}>
                    <span>{client.clientNumber}</span>
                    <span style={{ background: "rgba(37,99,235,0.1)", color: "var(--brand-primary)", padding: "2px 6px", fontSize: "0.7rem", borderRadius: "4px", fontWeight: 700 }}>
                      {client.insuranceId}
                    </span>
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
