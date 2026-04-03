import { prisma } from "@/lib/prisma";
import { getTranslator } from "@/lib/i18n";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";

export default async function AppointmentsPage({ searchParams }: { searchParams: { success?: string } }) {
  const t = getTranslator();
  const showSuccess = searchParams.success === "true";
  const appointments = await prisma.appointment.findMany({
    orderBy: { date: "asc" },
    include: { client: true }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem" }}>{t("Appointments Hub")}</h1>
        <Link href="/dashboard/appointments/new" className="badge badge-info hover-brand-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", border: "none", cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          + {t("Make an Appointment")}
        </Link>
      </div>

      {showSuccess && (
         <div style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--status-success)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)", marginBottom: "2rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CalendarIcon size={18} /> {t("Appointment scheduled successfully! Reminder queued.")}
         </div>
      )}
      
      <div className="glass-panel">
        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>{t("Date & Time")}</th>
              <th>{t("Client")}</th>
              <th>{t("Description")}</th>
              <th>{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id}>
                <td style={{ fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--brand-primary)" }}>
                    <CalendarIcon size={16} /> 
                    {new Date(apt.date).toLocaleDateString()} 
                    <Clock size={16} style={{ marginLeft: "0.5rem" }} />
                    {new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{apt.client.firstName} {apt.client.lastName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t("Client #")}{apt.client.clientNumber}</div>
                </td>
                <td style={{ color: "var(--text-secondary)" }}>{apt.notes || t("No description")}</td>
                <td>
                  <Link href={`/dashboard/clients/${apt.clientId}`} style={{ color: "var(--brand-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                    {t("View Profile →")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
