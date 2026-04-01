import { prisma } from "@/lib/prisma";
import { getTranslator } from "@/lib/i18n";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";

export default async function AppointmentsPage() {
  const t = getTranslator();
  const appointments = await prisma.appointment.findMany({
    orderBy: { date: "asc" },
    include: { client: true }
  });

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>{t("Appointments Hub")}</h1>
      
      <div className="glass-panel">
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
  );
}
