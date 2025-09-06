// src/app/api/users/bookings/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authenticate driver
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

    // 2️⃣ Get the driver’s current working zone
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
      select: { currentCategory: true },
    });

    if (!driver || !driver.currentCategory) {
      return NextResponse.json(
        { error: "Driver has not set a working zone" },
        { status: 400 }
      );
    }

    // 3️⃣ Fetch bookings in the driver’s current zone
    const bookings = await prisma.booking.findMany({
      where: {
        status: "pending",
        pickupLocation: { category: driver.currentCategory },
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
