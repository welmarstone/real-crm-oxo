import { getTranslator } from "@/lib/i18n";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NewInsuranceCompanyPage() {
  const t = getTranslator();

  async function createCompany(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string) || 0;
    const durationMonths = parseInt(formData.get("durationMonths") as string) || 12;
    const additionalDiscount = parseFloat(formData.get("additionalDiscount") as string) || 0;
    const notes = formData.get("notes") as string;

    await prisma.insuranceCompany.create({
      data: { name, basePrice, durationMonths, additionalDiscount, notes }
    });

    revalidatePath("/dashboard/insurance-companies");
    redirect("/dashboard/insurance-companies");
  }

  const inputStyle = {
    width: "100%", padding: "0.75rem", background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
    color: "var(--text-primary)", outline: "none"
  };
  const labelStyle = {
    display: "block", fontSize: "0.875rem", fontWeight: 600 as const,
    marginBottom: "0.5rem", color: "var(--text-secondary)"
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/insurance-companies" style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
          ← {t("Back to Insurance Companies")}
        </Link>
        <h1 style={{ fontSize: "2rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Building2 size={32} color="var(--brand-primary)" /> {t("Add Insurance Company")}
        </h1>
      </div>

      <div className="glass-panel">
        <form action={createCompany} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={labelStyle}>{t("Company Name")} *</label>
            <input name="name" required placeholder="e.g. Slavia, AXA, PVZP..." style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("Base Price (Kč)")}</label>
              <input type="number" name="basePrice" min="0" step="100" defaultValue="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("Coverage Duration (months)")}</label>
              <select name="durationMonths" style={inputStyle}>
                <option value="1">1 {t("month")}</option>
                <option value="3">3 {t("months")}</option>
                <option value="6">6 {t("months")}</option>
                <option value="12" selected>12 {t("months")} (1 {t("year")})</option>
                <option value="24">24 {t("months")} (2 {t("years")})</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t("Additional Discount from Company (%)")}</label>
            <input type="number" name="additionalDiscount" min="0" max="100" step="0.5" defaultValue="0" placeholder="e.g. 5 = 5% discount" style={inputStyle} />
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              {t("Extra discount rate offered by the company on top of standard pricing")}
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t("Notes / Contract Details")}</label>
            <textarea name="notes" rows={4} placeholder={t("Coverage details, special terms, contact info...")} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" style={{ background: "var(--status-success)", color: "white", padding: "0.875rem 2rem", borderRadius: "100px", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "1rem" }}>
              {t("Save Company")} →
            </button>
            <Link href="/dashboard/insurance-companies" style={{ display: "flex", alignItems: "center", padding: "0.875rem 1.5rem", borderRadius: "100px", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600 }}>
              {t("Cancel")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
