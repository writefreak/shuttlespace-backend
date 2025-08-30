// src/app/api/users/deleteUser/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json(); // read from request body
    if (!userId) return new Response("Missing userId", { status: 400 });

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return new Response(JSON.stringify(deletedUser), { status: 200 });
  } catch (err) {
    console.error("Error deleting user:", err);
    return new Response("Failed to delete user", { status: 500 });
  }
}
