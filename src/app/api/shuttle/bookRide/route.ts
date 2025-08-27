import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { passengerId, shuttleId, pickupLocationId, destinationId } = body;

  try {
    const shuttle = await prisma.shuttle.findUnique({
      where: { id: shuttleId },
      include: { bookings: true },
    });

    //matching backend/database column names with frontend names
    const destination = await prisma.destination.findFirst({
      where: { name: body.destinationName },
    });

    const pickupLocation = await prisma.location.findFirst({
      where: { name: body.pickupLocation },
    });

    const destinationCat = await prisma.destination.findFirst({
      where: { category: body.destinationCat },
    });

    const rideCategory = await prisma.shuttle.findFirst({
      where: { category: body.rideCategory },
    });

    if (!shuttle || !shuttle.isAvailable) {
      return NextResponse.json(
        {
          error: "Shuttle Not Available",
        },
        { status: 400 }
      );
    }

    //to check if the shuttle is empty or not
    if (shuttle.bookings.length >= shuttle.capacity) {
      return NextResponse.json(
        {
          error: "Shuttle is full",
        },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        passengerId,
        shuttleId,
        pickupLocationId,
        destinationId,
        status: "booked",
      },
    });

    return NextResponse.json({
      message: "Ride booked successfully",
      booking,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "Error booking ride",
      },
      { status: 400 }
    );
  }
}
