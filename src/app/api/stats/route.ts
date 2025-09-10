import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    //to get all active passengers

    const passengersActive = await prisma.user.count({
      where: { role: "passenger" },
    });

    //completed bookings
    const bookingsCompleted = await prisma.booking.count({
      where: { status: "Accepted" },
    });

    //active drivers
    const activeDrivers = await prisma.user.count({
      where: { role: "driver", isAvailable: true },
    });

    //available shuttles

    const shuttlesAvailable = await prisma.shuttle.count({
      where: { isAvailable: true },
    });

    return NextResponse.json(
      {
        passengersActive,
        activeDrivers,
        bookingsCompleted,
        shuttlesAvailable,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching stats");
    return NextResponse.json(
      {
        error: "Failed to fetch your stats",
      },
      { status: 500 }
    );
  }
}
