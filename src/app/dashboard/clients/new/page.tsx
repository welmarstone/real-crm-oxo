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
    const dob = formData.get("dob") ? new Date(formData.get("dob") as string) : undefined;
    const nationality = formData.get("nationality") as string;
    const birthPlace = formData.get("birthPlace") as string;
    const source = formData.get("source") as string;
    const notes = formData.get("notes") as string;
    
    // We aren't capturing policyType in DB right now due to schema constraints, but mapping to providerId works!
    // Wait, let's just insert providerId correctly for the UI.
    const providerId = formData.get("providerId") as string;
    
    const client = await prisma.client.create({
      data: {
        clientNumber: `CZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName,
        lastName,
        dob,
        nationality,
        birthPlace,
        source,
        notes,
        serviceStartDate: new Date(),
        policies: {
          create: {
             providerId,
             premiumAmount: 5000,
             startDate: new Date(formData.get("startDate") as string || Date.now()),
             endDate: new Date(formData.get("endDate") as string || Date.now() + 86400000 * 365)
          }
        }
      }
    });

    revalidatePath("/dashboard/clients");
    redirect(`/dashboard/clients/${client.id}`);
  }

  const providers = ["Slavia", "PVZP", "SV Pojistovna", "Colonnade"];
  
  const sources = [
    { id: "instagram", name: t("Instagram") },
    { id: "google", name: t("Google") },
    { id: "reference", name: t("Reference") },
    { id: "promoters", name: t("Promoters") }
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Birth Date")}</label>
              <input type="date" name="dob" style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Birth Place")}</label>
              <input type="text" name="birthPlace" placeholder={t("e.g. Prague")} style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
               <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Nationality")}</label>
               <input type="text" name="nationality" placeholder={t("e.g. Czech")} style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }} />
            </div>
            <div>
               <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("How did they learn about us")}</label>
               <select name="source" style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }}>
                  <option value="">{t("Select Source...")}</option>
                  {sources.map(s => (
                     <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
               </select>
            </div>
          </div>

          <div>
             <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Insurance Brand")}</label>
             <select name="providerId" required style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }}>
                <option value="">{t("Select Brand...")}</option>
                {providers.map(p => (
                   <option key={p} value={p}>{p}</option>
                ))}
             </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
             <div>
               <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Coverage Start Date")}</label>
               <input type="date" name="startDate" required style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }} />
             </div>
             <div>
               <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Expiration Date")}</label>
               <input type="date" name="endDate" required style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }} />
             </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Other Details (Notes)")}</label>
            <textarea name="notes" rows={3} placeholder={t("Any additional CRM details...")} style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", resize: "vertical" }} />
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
