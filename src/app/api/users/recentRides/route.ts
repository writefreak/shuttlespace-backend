import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // 1️⃣ Get passengerId from query string or headers (e.g., JWT)
    const url = new URL(req.url);
    const passengerId = url.searchParams.get("passengerId");
    if (!passengerId)
      return NextResponse.json(
        { error: "Missing passengerId" },
        { status: 400 }
      );

    // 2️⃣ Fetch recent bookings for this passenger
    const bookings = await prisma.booking.findMany({
      where: { passengerId },
      orderBy: { createdAt: "desc" },
      take: 10, // last 10 bookings
      select: {
        id: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        shuttle: { select: { category: true } },
        pickupLocation: { select: { name: true } },
        destination: { select: { name: true } },
        passenger: { select: { firstName: true, lastName: true } },
      },
    });

    // 3️⃣ Map to easy frontend format
    const mapped = bookings.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      status: b.status,
      paymentStatus: b.paymentStatus,
      shuttleCategory: b.shuttle.category,
      pickupLocation: b.pickupLocation.name,
      destination: b.destination.name,
      passengerName: `${b.passenger.firstName} ${b.passenger.lastName}`,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch recent bookings" },
      { status: 500 }
    );
  }
}
