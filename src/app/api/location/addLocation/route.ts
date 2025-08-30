import { PrismaClient } from "@prisma/client";
import { error } from "console";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category } = body; //destructuring

    if (!name || !category) {
      return NextResponse.json(
        { error: "Both fields are required" },
        {
          status: 400,
        }
      );
    }

    const newLocation = await prisma.location.create({
      data: { name, category },
    });

    return NextResponse.json(newLocation, {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 400 }
    );
  }
}
