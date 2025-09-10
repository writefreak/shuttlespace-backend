// src/app/api/dashboard/activities/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Example: fetch last 10 activities across bookings, users, drivers, shuttles
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { passenger: true },
    });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Combine them into a unified activity feed
    const activities = [
      ...bookings.map((b) => ({
        id: b.id,
        type: "booking",
        message: `${b.passenger.firstName} ${b.passenger.lastName} booked a shuttle`,
        time: b.createdAt,
      })),
      ...users.map((u) => ({
        id: u.id,
        type: "user",
        message: `New user ${u.firstName} ${u.lastName} registered`,
        time: u.createdAt,
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime()) // most recent first
      .slice(0, 10); // limit to 10 activities

    return NextResponse.json(activities);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
