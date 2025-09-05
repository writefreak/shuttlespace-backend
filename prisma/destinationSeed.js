import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const destinations = [
    { name: "ICT", category: "Law/Science" },
    { name: "F&G", category: "Backate" },
    { name: "Environmental", category: "Management" },
    { name: "Engineering", category: "Law/Science" },
    { name: "Hostel H", category: "Backate" },
    { name: "Maingate", category: "Maingate" },
    { name: "Backgate", category: "Backate" },
    { name: "UBA", category: "Backate" },
    { name: "Convocation arena", category: "Management" },
    { name: "Old site", category: "Backate" },
    { name: "Microfinance Bank", category: "Law/Science" },
  ];

  for (const dest of destinations) {
    await prisma.destination.upsert({
      where: { name: dest.name },
      update: {},
      create: dest,
    });
  }

  console.log("Destinations seeded!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
