import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();

  // match your frontend keys exactly
  const { pickupLocationName, destinationName, paymentStatus } = body;

  try {
    // 1. Extract token from headers
    const authHeader = req.headers.get("authorization"); // expects "Bearer <token>"
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 401 });
    }

    // 2. Decode JWT to get user id
    let userId: string;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.id;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // lookup pickup and destination
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

    // find an available shuttle
    const shuttle = await prisma.shuttle.findFirst({
      where: { isAvailable: true },
      include: { bookings: true },
    });

    if (!shuttle) {
      return NextResponse.json(
        { error: "Sorry, no available shuttle" },
        { status: 400 }
      );
    }

    // check shuttle capacity
    if (shuttle.bookings.length >= shuttle.capacity) {
      return NextResponse.json(
        { error: "Selected shuttle is full" },
        { status: 400 }
      );
    }

    // create booking with passengerId from JWT
    const booking = await prisma.booking.create({
      data: {
        passengerId: userId,
        shuttleId: shuttle.id,
        pickupLocationId: pickupLocation.id,
        destinationId: destination.id,
        status: "pending",
        paymentStatus: paymentStatus ?? "unpaid",
      },
    });

    console.log("Booking:", booking);

    return NextResponse.json({
      message: "Ride booked successfully, awaiting driver confirmation",
      booking,
    });
  } catch (error) {
    console.error("Error booking Ride:", error);
    return NextResponse.json({ error: "Error booking ride" }, { status: 400 });
  }
}
