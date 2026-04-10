import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Handshake, User, DollarSign } from "lucide-react";
import { getTranslator } from "@/lib/i18n";

export default async function MiddlemanProfilePage({ params }: { params: { id: string } }) {
  const t = getTranslator();
  
  const middleman = await prisma.middleman.findUnique({
    where: { id: params.id },
    include: {
      clients: {
        include: { policies: true }
      },
      policies: {
        include: { client: true }
      }
    }
  });

  if (!middleman) return notFound();

  const totalRevenue = middleman.clients.reduce((acc, c) =>
    acc + c.policies.reduce((a, p) => a + p.premiumAmount, 0), 0);
  const totalCommission = middleman.policies.reduce((acc, p) =>
    acc + (p.middlemanShare || p.premiumAmount * 0.2), 0);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/middlemen" style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
          ← {t("Back to Middlemen")}
        </Link>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginTop: "1rem" }}>
          <div style={{ width: 80, height: 80, background: "#f472b6", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <Handshake size={40} />
          </div>
          <div>
            <h1 style={{ fontSize: "2.5rem", margin: 0 }}>{middleman.fullName}</h1>
            <div style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              {middleman.phone && <span>{middleman.phone}</span>}
              {middleman.email && <span> &bull; {middleman.email}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-cards" style={{ marginBottom: "2rem" }}>
        <div className="glass-panel kpi-card">
          <div className="kpi-title">{t("Clients Referred")}</div>
          <div className="kpi-value">{middleman.clients.length}</div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-title">{t("Total Revenue Brought")}</div>
          <div className="kpi-value">{Math.round(totalRevenue).toLocaleString()} Kč</div>
        </div>
        <div className="glass-panel kpi-card" style={{ borderLeft: "4px solid #f472b6" }}>
          <div className="kpi-title">{t("Total Commission (20%)")}</div>
          <div className="kpi-value" style={{ color: "#f472b6" }}>{Math.round(totalCommission).toLocaleString()} Kč</div>
        </div>
      </div>

      {/* Client List */}
      <div className="glass-panel">
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>{t("Referred Clients")}</h2>
        {middleman.clients.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>{t("No clients referred yet.")}</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("Client")}</th>
                  <th>{t("Insurance ID")}</th>
                  <th>{t("Policy Value")}</th>
                  <th>{t("Commission (20%)")}</th>
                  <th>{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {middleman.clients.map(client => {
                  const policyTotal = client.policies.reduce((a, p) => a + p.premiumAmount, 0);
                  const commission = policyTotal * 0.2;
                  return (
                    <tr key={client.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{client.firstName} {client.lastName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{client.clientNumber}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--brand-primary)", fontSize: "0.875rem" }}>{client.insuranceId}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{policyTotal.toLocaleString()} Kč</td>
                      <td style={{ fontWeight: 700, color: "#f472b6" }}>{Math.round(commission).toLocaleString()} Kč</td>
                      <td>
                        <Link href={`/dashboard/clients/${client.id}`} style={{ color: "var(--brand-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                          {t("View →")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {middleman.notes && (
        <div className="glass-panel" style={{ marginTop: "1.5rem" }}>
          <h3 style={{ marginBottom: "0.75rem", fontSize: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Notes")}</h3>
          <p style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>{middleman.notes}</p>
        </div>
      )}
    </div>
  );
}
