// src/app/api/users/bookings/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/users/bookings
export async function GET() {
  const bookings = await prisma.booking.findMany({
    where: {
      paymentStatus: "paid",
      status: "pending",
      // no driverId filter here, because your schema doesn’t have it
    },
    include: {
      passenger: true,
      pickupLocation: true,
      destination: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return new Response(JSON.stringify(bookings), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
