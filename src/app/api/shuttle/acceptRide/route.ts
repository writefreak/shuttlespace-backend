// app/api/bookings/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { bookingId, status, shuttleId } = await req.json();

    if (!bookingId || !status || !shuttleId) {
      return NextResponse.json(
        { error: "Missing bookingId, status or shuttleId" },
        { status: 400 }
      );
    }

    // 1. Fetch booking to verify it belongs to the shuttle
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.shuttleId !== shuttleId) {
      return NextResponse.json(
        { error: "Booking does not belong to this shuttle" },
        { status: 403 }
      );
    }

    // 2. Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
