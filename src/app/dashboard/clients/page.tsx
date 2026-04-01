import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search } from "lucide-react";
import { getTranslator } from "@/lib/i18n";

export default async function ClientsPage({ searchParams }: { searchParams: { q?: string } }) {
  const t = getTranslator();
  const query = searchParams.q || "";
  
  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { clientNumber: { contains: query } }
      ]
    },
    orderBy: { createdAt: "desc" },
    include: { policies: true }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem" }}>{t("Clients Directory")}</h1>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <form action="/dashboard/clients" method="GET" style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "0.25rem 0.75rem", gap: "0.5rem" }}>
            <Search size={16} color="var(--text-muted)" />
            <input type="text" name="q" defaultValue={query} placeholder={t("Search clients...")} style={{ border: "none", background: "transparent", outline: "none", color: "var(--text-primary)" }} />
          </form>
          <Link href="/dashboard/clients/new" className="badge badge-info hover-brand-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", border: "none", cursor: "pointer", textDecoration: "none" }}>
            {t("+ Add Client")}
          </Link>
        </div>
      </div>

      <div className="glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("Client #")}</th>
              <th>{t("Name")}</th>
              <th>{t("Service Start")}</th>
              <th>{t("Active Policies")}</th>
              <th>{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  <div>{client.clientNumber}</div>
                  {client.policies.length > 0 && (
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-primary)", marginTop: "0.25rem" }}>
                      INS-{client.policies[0].id.substring(0, 8).toUpperCase()}
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{client.firstName} {client.lastName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{client.nationality}</div>
                </td>
                <td>{new Date(client.serviceStartDate).toLocaleDateString()}</td>
                <td>
                  {client.policies.length > 0 ? (
                    <span className="badge badge-success">{client.policies.length} {t("Active Policies")}</span>
                  ) : (
                    <span className="badge badge-warning">None</span>
                  )}
                </td>
                <td>
                  <Link href={`/dashboard/clients/${client.id}`} style={{ color: "var(--brand-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                    {t("View →")}
                  </Link>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                  {t("No clients found.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
