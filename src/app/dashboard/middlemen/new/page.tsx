import { getTranslator } from "@/lib/i18n";
import { Handshake } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NewMiddlemanPage() {
  const t = getTranslator();

  async function createMiddleman(formData: FormData) {
    "use server";
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const notes = formData.get("notes") as string;

    await prisma.middleman.create({ data: { fullName, phone, email, notes } });
    revalidatePath("/dashboard/middlemen");
    redirect("/dashboard/middlemen");
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
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/middlemen" style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
          ← {t("Back to Middlemen")}
        </Link>
        <h1 style={{ fontSize: "2rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Handshake size={32} color="var(--brand-primary)" /> {t("Register Middleman")}
        </h1>
      </div>

      <div className="glass-panel">
        <form action={createMiddleman} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={labelStyle}>{t("Full Name")} *</label>
            <input name="fullName" required placeholder={t("Full name of the promoter...")} style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("Phone Number")}</label>
              <input name="phone" type="tel" placeholder="+420..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("Email Address")}</label>
              <input name="email" type="email" placeholder="email@example.com" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t("Notes")}</label>
            <textarea name="notes" rows={3} placeholder={t("Any additional details...")} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ padding: "1rem", background: "rgba(99,102,241,0.08)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--brand-primary)" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              {t("Commission Structure")}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {t("All middlemen earn")} <strong>20%</strong> {t("of each policy premium they bring.")}
              <br />
              {t("Example: 15,000 Kč policy")} → <strong>3,000 Kč</strong> {t("commission")}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" style={{ background: "var(--status-success)", color: "white", padding: "0.875rem 2rem", borderRadius: "100px", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "1rem" }}>
              {t("Register")} →
            </button>
            <Link href="/dashboard/middlemen" style={{ display: "flex", alignItems: "center", padding: "0.875rem 1.5rem", borderRadius: "100px", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600 }}>
              {t("Cancel")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
