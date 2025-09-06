// src/app/api/users/bookings/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // 1. auth driver
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
      driverId = decoded.id;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. find the driver’s shuttle(s)
    const shuttles = await prisma.shuttle.findMany({
      where: { driverId: driverId },
      select: { id: true },
    });

    if (!shuttles.length) {
      return NextResponse.json(
        { error: "No shuttle assigned to this driver" },
        { status: 404 }
      );
    }

    const shuttleIds = shuttles.map((s) => s.id);

    // 3. fetch only bookings for those shuttles
    const bookings = await prisma.booking.findMany({
      where: {
        status: "pending",
        shuttleId: { in: shuttleIds },
      },
      include: {
        passenger: true,
        pickupLocation: true,
        destination: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
