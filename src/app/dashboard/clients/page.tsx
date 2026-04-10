import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, AlertTriangle, Upload } from "lucide-react";
import { getTranslator } from "@/lib/i18n";

function getDaysUntilExpiry(endDate: Date): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
}

export default async function ClientsPage({ searchParams }: { searchParams: { q?: string } }) {
  const t = getTranslator();
  const query = searchParams.q || "";

  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { clientNumber: { contains: query } },
        { insuranceId: { contains: query } }
      ]
    },
    orderBy: { createdAt: "desc" },
    include: { policies: true, middleman: true }
  });

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", gap: "1rem" }}>
        <h1 style={{ fontSize: "2rem" }}>{t("Clients Pipeline")}</h1>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <form action="/dashboard/clients" method="GET" style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "0.25rem 0.75rem", gap: "0.5rem" }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text" name="q" defaultValue={query}
              placeholder={t("Search by name, Insurance ID...")}
              style={{ border: "none", background: "transparent", outline: "none", color: "var(--text-primary)", minWidth: "220px" }}
            />
          </form>
          <Link href="/dashboard/clients/import" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600 }}>
            <Upload size={16} /> {t("Import Excel")}
          </Link>
          <Link href="/dashboard/clients/new" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem", background: "var(--brand-primary)", color: "white", borderRadius: "var(--radius-md)", textDecoration: "none", fontWeight: 700 }}>
            + {t("Add Client")}
          </Link>
        </div>
      </div>

      <div className="glass-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Client ID")}</th>
                <th>{t("Insurance ID")}</th>
                <th>{t("Name")}</th>
                <th>{t("Insurance Period")}</th>
                <th>{t("Active Policies")}</th>
                <th>{t("Status")}</th>
                <th>{t("Middleman")}</th>
                <th>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const latestPolicy = client.policies.sort((a, b) =>
                  new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
                const daysLeft = latestPolicy ? getDaysUntilExpiry(latestPolicy.endDate) : null;
                const isExpiringSoon = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;
                const isCritical = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
                const isExpired = daysLeft !== null && daysLeft <= 0;

                return (
                  <tr key={client.id}>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontFamily: "monospace" }}>
                      {client.clientNumber}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--brand-primary)", fontSize: "0.875rem" }}>
                        {client.insuranceId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{client.firstName} {client.lastName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{client.nationality}</div>
                    </td>
                    <td style={{ fontSize: "0.875rem" }}>
                      {latestPolicy ? (
                        <div>
                          <div>{new Date(latestPolicy.startDate).toLocaleDateString()}</div>
                          <div style={{ color: isExpired ? "#ef4444" : isCritical ? "#ef4444" : isExpiringSoon ? "#f59e0b" : "var(--text-muted)" }}>
                            → {new Date(latestPolicy.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      ) : "—"}
                    </td>
                    <td>
                      {client.policies.length > 0 ? (
                        <span className="badge badge-success">{client.policies.length} {t("active")}</span>
                      ) : (
                        <span className="badge badge-warning">{t("None")}</span>
                      )}
                    </td>
                    <td>
                      {isExpired ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#ef4444", fontWeight: 700, fontSize: "0.8rem" }}>
                          <AlertTriangle size={14} /> {t("Expired")}
                        </span>
                      ) : isCritical ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#ef4444", fontWeight: 700, fontSize: "0.8rem" }}>
                          <AlertTriangle size={14} /> {daysLeft}d {t("left")}
                        </span>
                      ) : isExpiringSoon ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#f59e0b", fontWeight: 700, fontSize: "0.8rem" }}>
                          <AlertTriangle size={14} /> {daysLeft}d {t("left")}
                        </span>
                      ) : (
                        <span style={{ color: "var(--status-success)", fontSize: "0.8rem", fontWeight: 600 }}>✓ {t("Active")}</span>
                      )}
                    </td>
                    <td>
                      {client.middleman ? (
                        <Link href={`/dashboard/middlemen/${client.middleman.id}`} style={{ fontSize: "0.8rem", color: "#f472b6", fontWeight: 600, textDecoration: "none" }}>
                          {client.middleman.fullName}
                        </Link>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/dashboard/clients/${client.id}`} style={{ color: "var(--brand-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                        {t("View →")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    {query ? t("No clients found matching your search.") : t("No clients yet. Add your first client.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
