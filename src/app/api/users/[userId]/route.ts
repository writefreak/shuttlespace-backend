import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } } // This is the corrected line
) {
  try {
    const { userId } = params;

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(deletedUser, { status: 200 });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
