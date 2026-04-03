import { getTranslator } from "@/lib/i18n";
import { CalendarPlus, BellRing } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NewAppointmentPage() {
  const t = getTranslator();
  const clients = await prisma.client.findMany({
    orderBy: { firstName: "asc" }
  });

  async function createAppointment(formData: FormData) {
    "use server";
    const clientId = formData.get("clientId") as string;
    const dateStr = formData.get("date") as string;
    const notes = formData.get("notes") as string;
    const notification = formData.get("notification") === "on";

    const apt = await prisma.appointment.create({
      data: {
        clientId,
        date: new Date(dateStr),
        notes: notes || null
      }
    });

    // Simulate SMS Trigger or Log
    if (notification) {
       console.log(`[SYS] Queued SMS reminder for Appointment ID: ${apt.id}`);
    }

    revalidatePath("/dashboard/appointments");
    redirect(`/dashboard/appointments?success=true`);
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/appointments" style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500, display: "inline-block", padding: "0.5rem 0" }} className="hover-brand-primary">
          &larr; {t("Back to Appointments")}
        </Link>
        <h1 style={{ fontSize: "2rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <CalendarPlus size={32} color="var(--brand-primary)" /> {t("Make an Appointment")}
        </h1>
      </div>

      <div className="glass-panel">
        <form action={createAppointment} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Select Client")}</label>
            <select name="clientId" required style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }}>
               <option value="">-- {t("Select Client")} --</option>
               {clients.map(c => (
                 <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.clientNumber})</option>
               ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Date & Time")}</label>
            <input type="datetime-local" name="date" required style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }} />
          </div>

          <div>
             <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>{t("Notes")}</label>
             <textarea name="notes" rows={3} placeholder={t("Meeting preparation details...")} style={{ width: "100%", padding: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", background: "rgba(59, 130, 246, 0.1)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <input type="checkbox" name="notification" id="notifCheck" defaultChecked style={{ width: "18px", height: "18px" }} />
            <label htmlFor="notifCheck" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--brand-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}><BellRing size={16} /> {t("Send automated SMS reminder to client")}</label>
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <button type="submit" style={{ background: "var(--brand-primary)", width: "100%", color: "white", padding: "1rem", borderRadius: "12px", border: "none", fontWeight: 700, cursor: "pointer", display: "inline-flex", gap: "0.5rem", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
               {t("Save Appointment")}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
