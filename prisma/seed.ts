import { PrismaClient } from "@prisma/client";
import { hospital, movements, products, staff } from "../src/lib/data";

const prisma = new PrismaClient();

async function main() {
  await prisma.movement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.hospitalSettings.deleteMany();

  await prisma.hospitalSettings.create({
    data: {
      id: 1,
      name: hospital.name,
      sector: hospital.sector,
      lastSync: new Date(hospital.lastSync),
    },
  });

  await prisma.staff.createMany({
    data: staff.map((person) => ({
      id: person.id,
      name: person.name,
      role: person.role,
      rfidCard: person.rfidCard,
    })),
  });

  await prisma.product.createMany({
    data: products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit: product.unit,
      stock: product.stock,
      minStock: product.minStock,
      criticalStock: product.criticalStock,
      rfidTag: product.rfidTag,
    })),
  });

  await prisma.movement.createMany({
    data: movements.map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      staffId: movement.staffId,
      type: movement.type,
      quantity: movement.quantity,
      timestamp: new Date(movement.timestamp),
      source: movement.source,
    })),
  });

  console.log(
    `Seed OK: ${products.length} produtos, ${staff.length} funcionários, ${movements.length} movimentações.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
