"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar automatically when user navigates
  useEffect(() => {
    setIsOpen(false);
    document.body.classList.remove("sidebar-open");
  }, [pathname]);

  const toggleSidebar = () => {
    if (isOpen) {
      document.body.classList.remove("sidebar-open");
      setIsOpen(false);
    } else {
      document.body.classList.add("sidebar-open");
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          <img src="/imgs/logo.png.webp" alt="OXO CRM" style={{ width: 32, height: 32, borderRadius: '8px', objectFit: 'contain' }} />
          OXO CRM
        </div>
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          {isOpen ? <X size={24} color="var(--text-primary)" /> : <Menu size={24} color="var(--text-primary)" />}
        </button>
      </div>

      {isOpen && (
        <div className="sidebar-backdrop" onClick={toggleSidebar}></div>
      )}
    </>
  );
}
