"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Calendar, CheckCircle2, Globe } from "lucide-react";
import ruDict from "@/locales/ru.json";

export default function SettingsPage() {
  const [theme, setTheme] = useState<string>("system");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [notionConnected, setNotionConnected] = useState(false);
  const [locale, setLocale] = useState("en");

  // Client-side quick translator fallback
  const t = (key: string) => {
    if (locale === "ru") return (ruDict as any)[key] || key;
    return key;
  };
  
  const handleLanguageChange = (lang: string) => {
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
    alert(`Language requested: ${lang.toUpperCase()}. Reloading workspace...`);
    window.location.reload();
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("crm-theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Read cookie for locale layout
    const currentLocale = document.cookie.split("; ").find(r => r.startsWith("NEXT_LOCALE="))?.split("=")[1] || "en";
    setLocale(currentLocale);
  }, []);

  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;
    if (newTheme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", newTheme);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("crm-theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <div>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>{t("Settings")}</h1>

      <div className="glass-panel" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>{t("Language Region")}</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{t("Translate the administrative portal. New content defaults to English if untranslated.")}</p>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            onClick={() => handleLanguageChange("en")}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", border: locale === "en" ? "2px solid var(--brand-primary)" : "1px solid var(--border-color)", background: "var(--bg-tertiary)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", fontWeight: 500, cursor: "pointer" }}
          >
            <Globe size={18} /> {t("English (EN)")}
          </button>
          
          <button 
            onClick={() => handleLanguageChange("ru")}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", border: locale === "ru" ? "2px solid var(--brand-primary)" : "1px solid var(--border-color)", background: "var(--bg-tertiary)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", fontWeight: 500, cursor: "pointer" }}
          >
            <Globe size={18} /> {t("Russian (RU)")}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>{t("Appearance")}</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{t("Customize the look and feel of your CRM.")}</p>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            onClick={() => handleThemeChange("light")}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", border: theme === "light" ? "2px solid var(--brand-primary)" : "1px solid var(--border-color)", background: "var(--bg-tertiary)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", fontWeight: 500 }}
          >
            <Sun size={18} /> {t("Light")}
          </button>
          
          <button 
            onClick={() => handleThemeChange("dark")}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", border: theme === "dark" ? "2px solid var(--brand-primary)" : "1px solid var(--border-color)", background: "var(--bg-tertiary)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", fontWeight: 500 }}
          >
            <Moon size={18} /> {t("Dark")}
          </button>

          <button 
            onClick={() => handleThemeChange("system")}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", border: theme === "system" ? "2px solid var(--brand-primary)" : "1px solid var(--border-color)", background: "var(--bg-tertiary)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", fontWeight: 500 }}
          >
            <Monitor size={18} /> {t("System match")}
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: "1rem" }}>{t("Connected Apps")}</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {t("Link your third-party tools to enable automated workflows.")}
        </p>

        <div className="grid-cards">
          {/* Google Calendar Mock */}
          <div style={{ padding: "1.5rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 40, height: 40, background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={24} color="#4285F4" />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Google Calendar</div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{t("Appointments sync")}</div>
              </div>
            </div>
            {googleConnected ? (
              <button onClick={() => setGoogleConnected(false)} style={{ width: "100%", padding: "0.75rem", background: "rgba(16, 185, 129, 0.1)", color: "var(--status-success)", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={18} /> {t("Connected")}
              </button>
            ) : (
              <button onClick={() => setGoogleConnected(true)} style={{ width: "100%", padding: "0.75rem", background: "var(--brand-primary)", color: "white", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600 }}>
                {t("Connect Account")}
              </button>
            )}
          </div>

          {/* Notion Mock */}
          <div style={{ padding: "1.5rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 40, height: 40, background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "black", fontWeight: 700, fontFamily: "serif" }}>
                N
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Notion</div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{t("Tasks & Notes sync")}</div>
              </div>
            </div>
            {notionConnected ? (
              <button onClick={() => setNotionConnected(false)} style={{ width: "100%", padding: "0.75rem", background: "rgba(16, 185, 129, 0.1)", color: "var(--status-success)", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={18} /> {t("Connected")}
              </button>
            ) : (
              <button onClick={() => setNotionConnected(true)} style={{ width: "100%", padding: "0.75rem", background: "var(--brand-primary)", color: "white", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600 }}>
                {t("Connect Account")}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
