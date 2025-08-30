import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: params.userId,
      },
    });

    return deletedUser;
  } catch (err) {
    console.error("Error deleting user:", err);
  }
}
