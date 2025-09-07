import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pickupLocationName, destinationName, paymentStatus } = body;

  try {
    // 1. Auth
    const authHeader = req.headers.get("authorization");
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

    let userId: string;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.id;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Look up pickup & destination
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

    // Zone from pickup location
    const pickupZone = pickupLocation.category;

    // 3. Find a driver currently working in that zone
    const driver = await prisma.user.findFirst({
      where: {
        role: "driver",
        currentCategory: pickupZone,
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "No driver available in this zone" },
        { status: 400 }
      );
    }

    // 4. Find shuttle belonging to that driver
    const shuttle = await prisma.shuttle.findFirst({
      where: {
        driverId: driver.id,
        isAvailable: true,
      },
      include: {
        bookings: true,
      },
    });

    if (!shuttle) {
      return NextResponse.json(
        { error: "No available shuttle for this driver" },
        { status: 400 }
      );
    }

    // 5. Check shuttle capacity
    if (shuttle.bookings.length >= shuttle.capacity) {
      return NextResponse.json({ error: "Shuttle is full" }, { status: 400 });
    }

    // 6. Create booking
    const booking = await prisma.booking.create({
      data: {
        passengerId: userId,
        shuttleId: shuttle.id,
        pickupLocationId: pickupLocation.id,
        destinationId: destination.id,
        status: "pending",
        paymentStatus: paymentStatus ?? "unpaid",
      },
      include: {
        pickupLocation: true,
        destination: true,
      },
    });

    return NextResponse.json({
      message: "Ride booked successfully, awaiting driver confirmation",
      booking,
    });
  } catch (error) {
    console.error("Error booking Ride:", error);
    return NextResponse.json({ error: "Error booking ride" }, { status: 400 });
  }
}
