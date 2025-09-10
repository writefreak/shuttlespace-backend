// src/app/api/users/deleteUser/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    // Read userId from request body
    const { userId } = await req.json();
    if (!userId) return new Response("Missing userId", { status: 400 });

    // Delete any shuttles related to the user safely
    // await prisma.shuttle.deleteMany({ where: { userId } });

    // Delete the user
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return new Response(JSON.stringify(deletedUser), { status: 200 });
  } catch (err) {
    console.error("Error deleting user:", err);
    return new Response("Failed to delete user", { status: 500 });
  }
}
