import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const passengerId = payload.id; // assuming your JWT has { id: userId }

    // Fetch last 6 bookings for this passenger
    const bookings = await prisma.booking.findMany({
      where: { passengerId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        passenger: true,
        shuttle: true,
        pickupLocation: true,
        destination: true,
      },
    });

    // Map the response to only include what the frontend needs
    const result = bookings.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      status: b.status,
      paymentStatus: b.paymentStatus,
      shuttleCategory: b.shuttle.category,
      pickupLocation: b.pickupLocation.name,
      destination: b.destination.name,
      passengerName: `${b.passenger.firstName} ${b.passenger.lastName}`,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Error fetching recent bookings:", err);
    return NextResponse.json(
      { error: "Failed to fetch recent bookings" },
      { status: 500 }
    );
  }
}
