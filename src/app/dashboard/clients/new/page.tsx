import { getTranslator } from "@/lib/i18n";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NewClientPage() {
  const t = getTranslator();

  async function createClient(formData: FormData) {
    "use server";
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const policyType = formData.get("policyType") as string;
    
    // Simulate assigning an intelligent base policy based on type selection constraints
    const provider = "PVZP"; 
    
    const client = await prisma.client.create({
      data: {
        clientNumber: `CZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName,
        lastName,
        nationality: "Unknown",
        serviceStartDate: new Date(),
        policies: {
          create: {
             providerId: policyType,
             premiumAmount: 5000,
             startDate: new Date(),
             endDate: new Date(Date.now() + 86400000 * 365)
          }
        }
      }
    });

    revalidatePath("/dashboard/clients");
    redirect(`/dashboard/clients/${client.id}`);
  }

  // Strictly enforce the 8 policies
  const policyTypes = [
    "Comprehensive health insurance for foreigners",
    "Basic insurance for foreigners",
    "Travel insurance for Czech citizens and foreigners",
    "Car insurance",
    "Home and property insurance",
    "Major risk insurance",
    "Comprehensive pregnancy insurance",
    "Liability insurance"
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/clients" style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500, display: "inline-block", padding: "0.5rem 0" }} className="hover-brand-primary">
          &larr; {t("Back to Directory")}
        </Link>
        <h1 style={{ fontSize: "2rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <UserPlus size={32} color="var(--brand-primary)" /> {t("Register New Client")}
        </h1>
      </div>

      <div className="glass-panel">
        <form action={createClient} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("First Name")}</label>
              <input name="firstName" required style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Last Name")}</label>
              <input name="lastName" required style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }} />
            </div>
          </div>

          <div>
             <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Assign Official Policy")}</label>
             <select name="policyType" required style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }}>
                {policyTypes.map(p => (
                   <option key={p} value={p}>{p}</option>
                ))}
             </select>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button type="submit" style={{ background: "var(--status-success)", color: "white", padding: "1rem 2rem", borderRadius: "100px", border: "none", fontWeight: 700, cursor: "pointer", display: "inline-flex", gap: "0.5rem", alignItems: "center", fontSize: "1rem" }}>
               {t("Save Client")} &rarr;
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
