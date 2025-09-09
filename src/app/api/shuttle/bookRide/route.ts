import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { bookingId, status } = body;

  try {
    // 1. Auth (same as your booking endpoint)
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

    let driverId: string;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      driverId = decoded.id; // logged-in driver’s id
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Find booking that belongs to a shuttle of this driver
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        shuttle: {
          driverId: driverId,
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or not assigned to your shuttle" },
        { status: 404 }
      );
    }

    // 3. Update booking status
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json({ message: "Booking updated", booking: updated });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Error updating booking" },
      { status: 400 }
    );
  }
}
