import Link from 'next/link';
import { LayoutDashboard, Users, Calendar, Settings } from 'lucide-react';
import { getTranslator } from '@/lib/i18n';
import MobileNav from '@/components/MobileNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = getTranslator();

  return (
    <div className="app-container">
      <MobileNav />
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
          <img src="/imgs/logo.png.webp" alt="OXO CRM" style={{ width: 32, height: 32, borderRadius: '8px', objectFit: 'contain' }} />
          OXO CRM
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginTop: '2rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t("Menu")}
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/dashboard" className="nav-link"><LayoutDashboard size={20} /> {t("Dashboard")}</Link>
          <Link href="/dashboard/clients" className="nav-link"><Users size={20} /> {t("Clients Pipeline")}</Link>
          <Link href="/dashboard/appointments" className="nav-link"><Calendar size={20} /> {t("Appointments")}</Link>
          
          <div style={{ flex: 1 }}></div>

          <Link href="/dashboard/settings" className="nav-link"><Settings size={20} /> {t("Settings")}</Link>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
