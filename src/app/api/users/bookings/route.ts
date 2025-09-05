// src/app/api/users/bookings/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/users/bookings
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "pending", // matches your backend 'pending' status
      },
      include: {
        passenger: true, // fetch passenger object (name, email, etc.)
        pickupLocation: true, // fetch pickup location name
        destination: true, // fetch destination name
      },
      orderBy: {
        createdAt: "desc", // newest bookings first
      },
    });

    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch bookings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
