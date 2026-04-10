import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Handshake, Plus, TrendingUp, Users } from "lucide-react";
import { getTranslator } from "@/lib/i18n";

export default async function MiddlemenPage() {
  const t = getTranslator();
  
  const middlemen = await prisma.middleman.findMany({
    include: {
      clients: { include: { policies: true } },
      policies: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Handshake size={32} color="var(--brand-primary)" /> {t("Middlemen")}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>{t("Track referral partners and their commissions")}</p>
        </div>
        <Link
          href="/dashboard/middlemen/new"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--brand-primary)", color: "white", padding: "0.75rem 1.5rem", borderRadius: "100px", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}
        >
          <Plus size={18} /> {t("Register Middleman")}
        </Link>
      </div>

      <div className="glass-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Name")}</th>
                <th>{t("Contact")}</th>
                <th>{t("Clients Referred")}</th>
                <th>{t("Total Revenue Brought")}</th>
                <th>{t("Commissions Earned")}</th>
                <th>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {middlemen.map((m) => {
                const totalRevenue = m.clients.reduce((acc, c) => 
                  acc + c.policies.reduce((a, p) => a + p.premiumAmount, 0), 0);
                const totalCommission = m.policies.reduce((acc, p) => acc + (p.middlemanShare || p.premiumAmount * 0.2), 0);
                
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.fullName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        {t("Since")} {new Date(m.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.875rem" }}>{m.phone || "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.email || ""}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Users size={14} color="var(--brand-primary)" />
                        {m.clients.length}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--status-success)" }}>
                        {Math.round(totalRevenue).toLocaleString()} Kč
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#f472b6" }}>
                        {Math.round(totalCommission).toLocaleString()} Kč
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>20% {t("of policies")}</div>
                    </td>
                    <td>
                      <Link href={`/dashboard/middlemen/${m.id}`} style={{ color: "var(--brand-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                        {t("View →")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {middlemen.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                    {t("No middlemen registered yet.")}
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
