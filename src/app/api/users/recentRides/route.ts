// app/api/bookings/recent.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const recentBookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10, // last 10 bookings
      select: {
        id: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        passenger: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        shuttle: {
          select: {
            category: true,
            vehicleSerialNo: true,
          },
        },
        destination: {
          select: {
            name: true,
          },
        },
        pickupLocation: {
          select: {
            name: true,
          },
        },
      },
    });

    // Only keep passengers, map to usable format
    const passengers = recentBookings.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      status: b.status,
      paymentStatus: b.paymentStatus,
      passengerName:
        b.passenger.role === "passenger"
          ? `${b.passenger.firstName} ${b.passenger.lastName}`
          : "N/A",
      shuttleCategory: b.shuttle.category,
      shuttleVehicle: b.shuttle.vehicleSerialNo,
      destination: b.destination.name,
      pickupLocation: b.pickupLocation.name,
    }));

    return NextResponse.json(passengers, { status: 200 });
  } catch (err) {
    console.error("Error fetching recent bookings:", err);
    return NextResponse.json(
      { error: "Failed to fetch recent bookings" },
      { status: 500 }
    );
  }
}
