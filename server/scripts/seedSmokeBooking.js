import crypto from "node:crypto";
import prisma from "../db/index.js";

const userId = process.env.SMOKE_USER_ID;

if (!userId) {
  console.error("SMOKE_USER_ID is required");
  process.exit(1);
}

try {
  const pkg = await prisma.package.create({
    data: {
      id: crypto.randomUUID(),
      title: "Smoke Package",
      description: "smoke",
      price: 199.99,
      imageUrl: null,
    },
  });

  const booking = await prisma.booking.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      packageId: pkg.id,
      bookingDate: new Date(),
      status: "completed",
    },
  });

  console.log(JSON.stringify({ packageId: pkg.id, bookingId: booking.id }));
} finally {
  await prisma.$disconnect();
}
