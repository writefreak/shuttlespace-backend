// src/app/api/drivers/currentCategory/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
  try {
    // 1️⃣ Authenticate driver
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json(
        { error: "Authorization header missing" },
        { status: 401 }
      );

    const token = authHeader.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Token missing" }, { status: 401 });

    let driverId: string;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      driverId = decoded.id;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2️⃣ Extract new category from request body
    const { currentCategory } = await req.json();
    if (!currentCategory)
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );

    // Optional: validate category
    const validCategories = [
      "Maingate",
      "Backgate",
      "Law/Science",
      "Environmental",
    ];
    if (!validCategories.includes(currentCategory))
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });

    // 3️⃣ Update driver
    const updatedDriver = await prisma.user.update({
      where: { id: driverId },
      data: { currentCategory },
      select: { id: true, email: true, currentCategory: true },
    });

    return NextResponse.json(
      { message: "Category updated", driver: updatedDriver },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}
