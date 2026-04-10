import { getTranslator } from "@/lib/i18n";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function generateInsuranceId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INS-${year}-${rand}`;
}

function generateClientNumber() {
  return `CZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default async function NewClientPage() {
  const t = getTranslator();

  const [companies, middlemen] = await Promise.all([
    prisma.insuranceCompany.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.middleman.findMany({ orderBy: { fullName: "asc" } })
  ]);

  async function createClient(formData: FormData) {
    "use server";
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const whatsappNumber = formData.get("whatsappNumber") as string;
    const email = formData.get("email") as string;
    const passportNumber = formData.get("passportNumber") as string;
    const residencePermitNumber = formData.get("residencePermitNumber") as string;
    const nationality = formData.get("nationality") as string;
    const visaExpiryDateStr = formData.get("visaExpiryDate") as string;
    const visaExpiryDate = visaExpiryDateStr ? new Date(visaExpiryDateStr) : undefined;
    const dob = formData.get("dob") ? new Date(formData.get("dob") as string) : undefined;
    const source = formData.get("source") as string;
    const middlemanId = (formData.get("middlemanId") as string) || undefined;
    const providerId = formData.get("providerId") as string;
    const insuranceCompanyId = (formData.get("insuranceCompanyId") as string) || undefined;
    const durationMonths = parseInt(formData.get("durationMonths") as string) || 12;
    const premiumAmount = parseFloat(formData.get("premiumAmount") as string) || 0;
    const startDate = new Date(formData.get("startDate") as string || Date.now());
    const endDate = new Date(formData.get("endDate") as string || Date.now() + 86400000 * 365);
    const customInsuranceId = (formData.get("insuranceId") as string)?.trim();

    // Commission split: 50% provider, 30% OXO, 20% middleman
    const companyShare = premiumAmount * 0.5;
    const oxoShare = premiumAmount * 0.3;
    const middlemanShare = middlemanId ? premiumAmount * 0.2 : 0;

    const client = await prisma.client.create({
      data: {
        clientNumber: generateClientNumber(),
        insuranceId: customInsuranceId || generateInsuranceId(),
        firstName,
        lastName,
        address,
        phone,
        whatsappNumber: whatsappNumber || phone,
        email,
        passportNumber,
        residencePermitNumber,
        nationality,
        visaExpiryDate,
        dob,
        source,
        middlemanId: middlemanId || null,
        serviceStartDate: startDate,
        policies: {
          create: {
            providerId,
            insuranceCompanyId: insuranceCompanyId || null,
            durationMonths,
            premiumAmount,
            companyShare,
            oxoShare,
            middlemanShare,
            middlemanId: middlemanId || null,
            startDate,
            endDate
          }
        }
      }
    });

    revalidatePath("/dashboard/clients");
    redirect(`/dashboard/clients/${client.id}`);
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

  const sources = [
    { id: "instagram", name: t("Instagram") },
    { id: "google", name: t("Google") },
    { id: "reference", name: t("Reference") },
    { id: "promoters", name: t("Promoters") }
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/clients" style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
          ← {t("Back to Directory")}
        </Link>
        <h1 style={{ fontSize: "2rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <UserPlus size={32} color="var(--brand-primary)" /> {t("Register New Client")}
        </h1>
      </div>

      <form action={createClient} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Section: Personal Info */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            {t("Personal Information")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("First Name")} *</label>
              <input name="firstName" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("Last Name")} *</label>
              <input name="lastName" required style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle}>{t("Address")}</label>
            <input name="address" placeholder={t("Street, City, Postal Code")} style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("Phone Number")}</label>
              <input name="phone" type="tel" placeholder="+420..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("WhatsApp Number (if different)")}</label>
              <input name="whatsappNumber" type="tel" placeholder={t("Leave empty if same as phone")} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("Email Address")}</label>
              <input name="email" type="email" placeholder="email@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("Date of Birth")}</label>
              <input type="date" name="dob" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("Nationality")}</label>
              <input name="nationality" placeholder={t("e.g. Georgian, Azerbaijani...")} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("How did they find us?")}</label>
              <select name="source" style={inputStyle}>
                <option value="">{t("Select source...")}</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section: Documents */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            {t("Documents & Permits")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("Passport Number")}</label>
              <input name="passportNumber" placeholder="AA1234567" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("Residence Permit Number")}</label>
              <input name="residencePermitNumber" placeholder={t("If applicable")} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle}>{t("Visa / Residence Permit Expiry Date")}</label>
            <input type="date" name="visaExpiryDate" style={{ ...inputStyle, maxWidth: "300px" }} />
          </div>
        </div>

        {/* Section: Insurance */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            {t("Insurance Details")}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("Insurance Brand")} *</label>
              <select name="providerId" required style={inputStyle}>
                <option value="">{t("Select brand...")}</option>
                {companies.length > 0 ? (
                  companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                ) : (
                  <>
                    <option value="Slavia">Slavia</option>
                    <option value="PVZP">PVZP</option>
                    <option value="SV Pojistovna">SV Pojistovna</option>
                    <option value="Colonnade">Colonnade</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t("Insurance Company (DB Link)")}</label>
              <select name="insuranceCompanyId" style={inputStyle}>
                <option value="">{t("Select (optional)...")}</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name} — {c.basePrice.toLocaleString()} Kč</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("Premium Amount (Kč)")} *</label>
              <input type="number" name="premiumAmount" required min="0" step="100" placeholder="e.g. 15000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("Duration (months)")} *</label>
              <select name="durationMonths" style={inputStyle}>
                <option value="1">1 {t("month")}</option>
                <option value="3">3 {t("months")}</option>
                <option value="6">6 {t("months")}</option>
                <option value="12">12 {t("months")}</option>
                <option value="24">24 {t("months")}</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t("Insurance ID")}</label>
              <input name="insuranceId" placeholder={t("Leave blank to auto-generate")} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("Coverage Start Date")} *</label>
              <input type="date" name="startDate" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("Coverage End Date")} *</label>
              <input type="date" name="endDate" required style={inputStyle} />
            </div>
          </div>

          {/* Commission Preview */}
          <div style={{ marginTop: "1.25rem", padding: "1rem", background: "rgba(99,102,241,0.08)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--brand-primary)" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              {t("Commission Split (50/30/20)")}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {t("Insurance Company: 50% · OXO: 30% · Middleman: 20% (if assigned)")}
            </div>
          </div>
        </div>

        {/* Section: Middleman */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            {t("Referral / Middleman")}
          </h3>
          <div>
            <label style={labelStyle}>{t("Referred by Middleman?")}</label>
            <select name="middlemanId" style={{ ...inputStyle, maxWidth: "400px" }}>
              <option value="">{t("No middleman (direct client)")}</option>
              {middlemen.map(m => (
                <option key={m.id} value={m.id}>{m.fullName}{m.phone ? ` — ${m.phone}` : ""}</option>
              ))}
            </select>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              {t("If a middleman referred this client, they will receive 20% commission from the policy premium.")}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" style={{ background: "var(--status-success)", color: "white", padding: "1rem 2rem", borderRadius: "100px", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "1rem" }}>
            {t("Save Client")} →
          </button>
          <Link href="/dashboard/clients" style={{ display: "flex", alignItems: "center", padding: "1rem 1.5rem", borderRadius: "100px", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600 }}>
            {t("Cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
