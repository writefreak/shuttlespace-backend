import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Remove the explicit type annotation for the second argument
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params; // Now you can directly access `userId` from `params`

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
