import { PrismaClient } from "@prisma/client";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { bookingId, status } = await req.json();

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization Header Missing" },
        { status: 401 }
      );
    }

    const token = authHeader.split("")[1];
    if (!token) {
      return NextResponse.json({ error: "Token Missing" }, { status: 401 });
    }

    let driverId: string;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      driverId = decoded.id;
    } catch (err) {
      return NextResponse.json({ error: " Invalid Token" }, { status: 401 });
    }

    //to check if booking exists and belongs to this particular shuttle

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { shuttle: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "You’re not authorized to update this booking" },
        { status: 403 }
      );
    }

    //to update booking status

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
      },
      include: {
        pickupLocation: true,
        destination: true,
      },
    });

    return NextResponse.json({
      message: `Booking ${status} succesfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Error updating booking status" },
      { status: 500 }
    );
  }
}
