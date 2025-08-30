import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        firstName: true,
        lastName: true,
        id: true,
        email: true,
        role: true,
        vehicleSerialNo: true,
        vehicleType: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
