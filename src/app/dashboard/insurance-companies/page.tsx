import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, Plus, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import { getTranslator } from "@/lib/i18n";
import { revalidatePath } from "next/cache";

export default async function InsuranceCompaniesPage() {
  const t = getTranslator();
  const companies = await prisma.insuranceCompany.findMany({ orderBy: { name: "asc" } });

  async function toggleActive(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const current = formData.get("isActive") === "true";
    await prisma.insuranceCompany.update({ where: { id }, data: { isActive: !current } });
    revalidatePath("/dashboard/insurance-companies");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Building2 size={32} color="var(--brand-primary)" /> {t("Insurance Companies")}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>{t("Manage your insurance provider contracts and pricing")}</p>
        </div>
        <Link
          href="/dashboard/insurance-companies/new"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--brand-primary)", color: "white", padding: "0.75rem 1.5rem", borderRadius: "100px", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}
        >
          <Plus size={18} /> {t("Add Company")}
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.5rem" }}>
        {companies.map(company => (
          <div key={company.id} className="glass-panel" style={{ position: "relative", opacity: company.isActive ? 1 : 0.6 }}>
            {!company.isActive && (
              <span style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>
                {t("Inactive")}
              </span>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 48, height: 48, background: "var(--brand-primary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.1rem" }}>
                  {company.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>{company.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{company.durationMonths} {t("months coverage")}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div style={{ background: "var(--bg-tertiary)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{t("Base Price")}</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{company.basePrice.toLocaleString()} Kč</div>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{t("Extra Discount")}</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--status-success)" }}>{company.additionalDiscount}%</div>
              </div>
            </div>

            {company.notes && (
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", background: "var(--bg-tertiary)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem" }}>
                {company.notes}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link
                href={`/dashboard/insurance-companies/${company.id}/edit`}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.625rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", textDecoration: "none", fontWeight: 600, fontSize: "0.875rem" }}
              >
                <Edit2 size={16} /> {t("Edit")}
              </Link>
              <form action={toggleActive}>
                <input type="hidden" name="id" value={company.id} />
                <input type="hidden" name="isActive" value={String(company.isActive)} />
                <button type="submit" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: company.isActive ? "var(--status-success)" : "var(--text-muted)", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
                  {company.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {company.isActive ? t("Active") : t("Inactive")}
                </button>
              </form>
            </div>
          </div>
        ))}

        {companies.length === 0 && (
          <div className="glass-panel" style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
            <Building2 size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{t("No insurance companies yet")}</div>
            <Link href="/dashboard/insurance-companies/new" style={{ color: "var(--brand-primary)", fontWeight: 600 }}>{t("Add your first company →")}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
