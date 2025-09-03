import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const drivers = await prisma.user.findMany({
      where: {
        role: "Driver", // only drivers
      },
      select: {
        id: true, // serial number
        firstName: true,
        lastName: true,
        vehicleSerialNo: true, // vehicle serial
        vehicleType: true, // vehicle type
        isAvailable: true, // availability for drop
      },
    });

    // map data into a simple structure for frontend
    const formatted = drivers.map((d) => ({
      id: d.vehicleSerialNo || d.id, // use vehicle serial as main ID
      name: `${d.firstName} ${d.lastName}`,
      cat: d.vehicleType,
      availability: d.isAvailable,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
