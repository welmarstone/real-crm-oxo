"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download, X } from "lucide-react";
import Link from "next/link";
import ruDict from "@/locales/ru.json";

interface ParsedRow {
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  passportNumber?: string;
  nationality?: string;
  residencePermitNumber?: string;
  visaExpiryDate?: string;
  insuranceBrand?: string;
  premiumAmount?: number;
  startDate?: string;
  endDate?: string;
}

const EXPECTED_COLUMNS = [
  "firstName", "lastName", "address", "phone", "whatsappNumber", "email",
  "passportNumber", "nationality", "residencePermitNumber", "visaExpiryDate",
  "insuranceBrand", "premiumAmount", "startDate", "endDate"
];

export default function ImportClientsPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [status, setStatus] = useState<"idle" | "parsed" | "importing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [locale, setLocale] = useState("en");
  const t = (key: string) => {
    if (locale === "ru") return (ruDict as any)[key] || key;
    return key;
  };

  useEffect(() => {
    setLocale(document.cookie.split("; ").find(r => r.startsWith("NEXT_LOCALE="))?.split("=")[1] || "en");
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<any>(ws, { defval: "" });

      if (data.length === 0) {
        setErrorMsg(t("The Excel file appears to be empty."));
        setStatus("error");
        return;
      }

      const parsed: ParsedRow[] = data.map((row: any) => ({
        firstName: String(row.firstName || row["First Name"] || row["firstname"] || ""),
        lastName: String(row.lastName || row["Last Name"] || row["lastname"] || ""),
        address: String(row.address || row["Address"] || ""),
        phone: String(row.phone || row["Phone"] || row["Phone Number"] || ""),
        whatsappNumber: String(row.whatsappNumber || row["WhatsApp"] || row["Whatsapp Number"] || ""),
        email: String(row.email || row["Email"] || ""),
        passportNumber: String(row.passportNumber || row["Passport"] || row["Passport Number"] || ""),
        nationality: String(row.nationality || row["Nationality"] || ""),
        residencePermitNumber: String(row.residencePermitNumber || row["Residence Permit"] || ""),
        visaExpiryDate: formatDate(row.visaExpiryDate || row["Visa Expiry"] || ""),
        insuranceBrand: String(row.insuranceBrand || row["Insurance Brand"] || row["Insurance"] || ""),
        premiumAmount: parseFloat(row.premiumAmount || row["Premium"] || row["Amount"] || 0),
        startDate: formatDate(row.startDate || row["Start Date"] || ""),
        endDate: formatDate(row.endDate || row["End Date"] || ""),
      })).filter(r => r.firstName && r.lastName);

      setRows(parsed);
      setStatus("parsed");
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(t("Failed to parse file: ") + err.message);
      setStatus("error");
    }
  };

  const formatDate = (val: any): string => {
    if (!val) return "";
    if (val instanceof Date) return val.toISOString().split("T")[0];
    return String(val);
  };

  const handleImport = async () => {
    setStatus("importing");
    try {
      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      setImportedCount(json.count);
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  const downloadTemplate = () => {
    const content = EXPECTED_COLUMNS.join(",") + "\nJohn,Doe,Prague 1,+420123456789,,john@email.com,AB123456,Georgian,,2026-12-31,Slavia,15000,2024-01-01,2025-01-01";
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oxo-crm-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/clients" style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
          ← {t("Back to Clients Pipeline")}
        </Link>
        <h1 style={{ fontSize: "2rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Upload size={32} color="var(--brand-primary)" /> {t("Import Excel")}
        </h1>
      </div>

      {status === "success" ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <CheckCircle2 size={64} color="var(--status-success)" style={{ marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{t("Import Successful!")}</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
            {importedCount} {t("clients have been added to the pipeline.")}
          </p>
          <Link href="/dashboard/clients" style={{ background: "var(--brand-primary)", color: "white", padding: "0.875rem 2rem", borderRadius: "100px", fontWeight: 700, textDecoration: "none" }}>
            {t("View Clients Pipeline →")}
          </Link>
        </div>
      ) : (
        <>
          {/* Upload Zone */}
          <div className="glass-panel" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem" }}>{t("Upload File")}</h2>
              <button onClick={downloadTemplate} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
                <Download size={16} /> {t("Download Template")}
              </button>
            </div>

            <label
              htmlFor="excel-upload"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "3rem", border: "2px dashed var(--border-color)", borderRadius: "var(--radius-lg)", cursor: "pointer", transition: "all 0.2s", background: "var(--bg-tertiary)" }}
              onDragOver={e => e.preventDefault()}
            >
              <FileSpreadsheet size={48} color="var(--brand-primary)" />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{t("Drop your Excel file here")}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>{t("Supports .xlsx, .xls, .csv files")}</div>
              </div>
            </label>
            <input
              id="excel-upload"
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              style={{ display: "none" }}
            />

            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-secondary)" }}>{t("Expected columns:")}</strong>{" "}
              {EXPECTED_COLUMNS.join(", ")}
            </div>
          </div>

          {status === "error" && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <AlertTriangle size={20} /> {errorMsg}
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <div className="glass-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem" }}>{t("Preview — ")}{rows.length}{t(" clients found")}</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>{t("Review before importing")}</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => { setRows([]); setStatus("idle"); if (fileRef.current) fileRef.current.value = ""; }}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", color: "var(--text-secondary)", cursor: "pointer" }}
                  >
                    <X size={16} /> {t("Clear")}
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={status === "importing"}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", background: "var(--status-success)", color: "white", border: "none", borderRadius: "100px", fontWeight: 700, cursor: "pointer" }}
                  >
                    {status === "importing" ? t("Importing...") : `${t("Import ")}${rows.length}${t(" Clients →")}`}
                  </button>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="data-table" style={{ minWidth: "900px" }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Phone</th>
                      <th>Nationality</th>
                      <th>Insurance Brand</th>
                      <th>Premium (Kč)</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} style={{ opacity: !row.firstName ? 0.4 : 1 }}>
                        <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{row.firstName}</td>
                        <td style={{ fontWeight: 600 }}>{row.lastName}</td>
                        <td>{row.phone || "—"}</td>
                        <td>{row.nationality || "—"}</td>
                        <td>{row.insuranceBrand || "—"}</td>
                        <td>{row.premiumAmount ? Number(row.premiumAmount).toLocaleString() : "—"}</td>
                        <td>{row.startDate || "—"}</td>
                        <td>{row.endDate || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
