import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("chibuike001", 10);

  await prisma.user.upsert({
    where: { email: "admin@shuttle.com" },
    update: { role: "admin" },
    create: {
      email: "admin@shuttle.com",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Administrator",
      role: "admin",
    },
  });
}

main().then(() =>
  prisma.$disconnect().catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  })
);
