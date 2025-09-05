import { PrismaClient } from "@prisma/client";
import { data } from "autoprefixer";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { passengerId, pickUpLocationName, destinationName, paymentStatus } =
    body;

  try {
    //lookup pickup and destination
    const pickupLocation = await prisma.location.findFirst({
      where: { name: pickUpLocationName },
    });

    const destination = await prisma.destination.findFirst({
      where: { name: destinationName },
    });

    if (!pickupLocation || !destination) {
      return NextResponse.json(
        {
          error: "Invalid Pickup or Location",
        },
        { status: 400 }
      );
    }

    const shuttle = await prisma.shuttle.findFirst({
      where: {
        isAvailable: true,

        //I can add currentLocation: pickupLocation.category
      },
      include: { bookings: true },
    });

    if (!shuttle) {
      return NextResponse.json(
        {
          error: "Sorry, no available shuttle",
        },
        { status: 400 }
      );
    }

    //to check shuttle capacity
    if (shuttle.bookings.length >= shuttle.capacity) {
      return NextResponse.json(
        {
          error: "Selected shuttle is full",
        },
        { status: 400 }
      );
    }

    //create booking with pending status

    const booking = await prisma.booking.create({
      data: {
        passengerId,
        shuttleId: shuttle.id,
        pickupLocationId: pickupLocation.id,
        destinationId: destination.id,
        status: "pending",
        paymentStatus: paymentStatus ?? "unpaid", //check payment status and accept unpaid for now
      },
    });

    console.log("Booking:", booking);
    return NextResponse.json({
      message: "Ride booked successfully, awaiting driver confirmation",
      booking,
    });
  } catch (error) {
    console.error("Error booking Ride:", error);
    return NextResponse.json(
      {
        error: "Error Booking Ride",
      },
      { status: 400 }
    );
  }
}
