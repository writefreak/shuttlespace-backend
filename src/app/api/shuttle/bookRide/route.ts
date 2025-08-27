import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { passengerId, shuttleId, pickupLocationName, destinationName } = body;

  try {
    const shuttle = await prisma.shuttle.findUnique({
      where: { id: shuttleId },
      include: { bookings: true },
    });

    if (!shuttle || !shuttle.isAvailable) {
      return NextResponse.json(
        {
          error: "Shuttle Not Available",
        },
        { status: 400 }
      );
    }

    if (shuttle.bookings.length >= shuttle.capacity) {
      return NextResponse.json(
        {
          error: "Shuttle is full",
        },
        { status: 400 }
      );
    }

    const pickupLocation = await prisma.location.findFirst({
      where: { name: pickupLocationName },
    });

    const destination = await prisma.destination.findFirst({
      where: { name: destinationName },
    });

    if (!pickupLocation || !destination) {
      return NextResponse.json(
        { error: "Invalid pickup or destination" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        passengerId,
        shuttleId,
        pickupLocationId: pickupLocation.id,
        destinationId: destination.id,
        status: "booked",
      },
    });

    return NextResponse.json({
      message: "Ride booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Error booking ride:", error);
    return NextResponse.json(
      {
        error: "Error booking ride",
      },
      { status: 400 }
    );
  }
}
