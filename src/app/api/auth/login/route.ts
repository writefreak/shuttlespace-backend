import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";
import { error } from "console";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.clone().json(); //fetching from API
    const { email, password } = body; //destructuring fetched data
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Please input the following fields",
        },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Wrong details please",
        },
        { status: 401 }
      );
    }

    const isValidPassword = bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: "Invalid password",
        },
        {
          status: 401,
        }
      );
    }

    const { password: _, ...safeUser } = user; //hide password
    return NextResponse.json(
      {
        message: "Login Successful",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    NextResponse.json(
      {
        error: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}
