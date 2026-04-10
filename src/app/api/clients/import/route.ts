import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generateInsuranceId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INS-${year}-${rand}`;
}

function generateClientNumber() {
  return `CZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(request: Request) {
  try {
    const { rows } = await request.json();
    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    let count = 0;
    for (const row of rows) {
      if (!row.firstName || !row.lastName) continue;

      const premiumAmount = parseFloat(row.premiumAmount) || 0;
      const companyShare = premiumAmount * 0.5;
      const oxoShare = premiumAmount * 0.3;

      await prisma.client.create({
        data: {
          clientNumber: generateClientNumber(),
          insuranceId: generateInsuranceId(),
          firstName: row.firstName,
          lastName: row.lastName,
          address: row.address || null,
          phone: row.phone || null,
          whatsappNumber: row.whatsappNumber || row.phone || null,
          email: row.email || null,
          passportNumber: row.passportNumber || null,
          nationality: row.nationality || null,
          residencePermitNumber: row.residencePermitNumber || null,
          visaExpiryDate: row.visaExpiryDate ? new Date(row.visaExpiryDate) : null,
          serviceStartDate: row.startDate ? new Date(row.startDate) : new Date(),
          policies: premiumAmount > 0 ? {
            create: {
              providerId: row.insuranceBrand || "Unknown",
              premiumAmount,
              companyShare,
              oxoShare,
              middlemanShare: 0,
              durationMonths: 12,
              startDate: row.startDate ? new Date(row.startDate) : new Date(),
              endDate: row.endDate ? new Date(row.endDate) : new Date(Date.now() + 86400000 * 365),
            }
          } : undefined
        }
      });
      count++;
    }

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
