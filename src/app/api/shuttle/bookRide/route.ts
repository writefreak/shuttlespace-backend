import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { passengerId, driverId, pickupLocationId, destinationId } = body;

  try {
    const driver = await prisma.user.findUnique({ where: { id: driverId } });
    if (!driver || !driver.isAvailable)
      return NextResponse.json(
        { error: "Driver not available" },
        { status: 400 }
      );

    const booking = await prisma.booking.create({
      data: {
        passengerId,
        driverId,
        pickupLocationId,
        destinationId,
        status: "booked",
      },
    });

    // Mark driver as unavailable
    await prisma.user.update({
      where: { id: driverId },
      data: { isAvailable: false },
    });

    return NextResponse.json({ message: "Ride booked successfully", booking });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Error booking ride" }, { status: 500 });
  }
}
