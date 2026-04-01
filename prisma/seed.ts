import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing
  await prisma.opportunity.deleteMany()
  await prisma.policy.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.client.deleteMany()
  await prisma.admin.deleteMany()

  // Admin
  await prisma.admin.create({
    data: {
      email: 'admin@crm-oxo.cz',
      password: 'password1234',
    }
  })

  // Dummy Clients
  const stages = [
    "Opportunity identification",
    "Initial meeting",
    "Needs analysis",
    "Price quote",
    "Pre-closing"
  ]

  const providerIds = ["PVZP", "Slavia", "SV_Pojistovna", "Colonnade"]
  const policyTypes = [
    "Comprehensive health insurance for foreigners",
    "Basic insurance for foreigners",
    "Travel insurance for Czech citizens and foreigners",
    "Car insurance",
    "Home and property insurance",
    "Major risk insurance",
    "Comprehensive pregnancy insurance",
    "Liability insurance"
  ]

  for (let i = 1; i <= 20; i++) {
    const isForeigner = Math.random() > 0.5
    const provider = providerIds[Math.floor(Math.random() * providerIds.length)]
    
    await prisma.client.create({
      data: {
        clientNumber: `CZ-2024-${String(i).padStart(3, '0')}`,
        firstName: isForeigner ? 'Arthur' : 'Jan',
        lastName: isForeigner ? 'Dent' : 'Novák',
        dob: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        nationality: isForeigner ? 'UK' : 'CZ',
        serviceStartDate: new Date(2023, Math.floor(Math.random() * 11), 1),
        policies: {
          create: [
            {
              providerId: provider,
              includesBankStatement: Math.random() > 0.5,
              premiumAmount: Math.floor(Math.random() * 5000) + 2000,
              startDate: new Date(2023, Math.floor(Math.random() * 11), 1),
              endDate: new Date(2024, Math.floor(Math.random() * 11), 1)
            }
          ]
        },
        opportunities: {
          create: i % 2 === 0 ? [] : [
            {
              stageName: stages[Math.floor(Math.random() * stages.length)],
              potentialValue: Math.floor(Math.random() * 10000) + 1500
            }
          ]
        },
        appointments: {
          create: i % 5 === 0 ? [] : [
            {
              date: new Date(Date.now() + Math.random() * 86400000 * 30),
              notes: 'Follow-up on policy renewal'
            }
          ]
        }
      }
    })
  }

  console.log("Seeding completed. 20 clients created.");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
