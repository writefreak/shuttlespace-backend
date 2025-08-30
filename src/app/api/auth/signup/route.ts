import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.clone().json();

    const {
      email,
      password,
      firstName,
      lastName,
      role,
      vehicleSerialNo,
      vehicleType,
    } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );

    if (password.length < 6)
      return NextResponse.json(
        { error: "Password too short" },
        { status: 400 }
      );

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: any = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    };
    const user = await prisma.user.create({ data: userData });

    //to create a shuttle if the user is a driver
    if (role === "Driver") {
      userData.vehicleSerialNo = vehicleSerialNo;
      userData.vehicleType = vehicleType;
      await prisma.shuttle.create({
        data: {
          driverId: user.id,
          vehicleSerialNo,
          vehicleType,
          capacity: 15, // default or from input
          category: vehicleType, // optional
        },
      });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
