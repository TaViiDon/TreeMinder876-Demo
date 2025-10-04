// prisma/seed.ts
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create two example users (custodian + supplier) and some sample trees
  const pass = await bcrypt.hash("password123", 10);

  const cust = await prisma.user.upsert({
    where: { email: "custodian@example.com" },
    update: {},
    create: {
      name: "Custodian One",
      email: "custodian@example.com",
      password: pass,
      role: "CUSTODIAN",
    },
  });

  const sup = await prisma.user.upsert({
    where: { email: "supplier@example.com" },
    update: {},
    create: {
      name: "Supplier One",
      email: "supplier@example.com",
      password: pass,
      role: "SUPPLIER",
    },
  });

  // Add a couple of sample trees
  const t1 = await prisma.tree.upsert({
    where: { treeId: "T-1001" },
    update: {},
    create: {
      treeId: "T-1001",
      species: "Mangifera indica",
      plantedDate: new Date(),
      latitude: -1.2921,
      longitude: 36.8219,
      planterId: cust.id,
    },
  });

  const t2 = await prisma.tree.upsert({
    where: { treeId: "T-1002" },
    update: {},
    create: {
      treeId: "T-1002",
      species: "Ficus benjamina",
      plantedDate: new Date(),
      latitude: -1.3000,
      longitude: 36.8000,
      planterId: sup.id,
    },
  });

  console.log({ custId: cust.id, supId: sup.id, trees: [t1.id, t2.id] });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });