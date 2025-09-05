// pages/api/driver/bookings/[driverId].ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { driverId } = req.query;

  if (!driverId || typeof driverId !== "string") {
    return res.status(400).json({ error: "Driver ID is required" });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        paymentStatus: "paid", // only paid bookings
        status: "pending", // only pending ones
        shuttle: {
          driverId: driverId, // shuttle belongs to this driver
        },
      },
      include: {
        passenger: true,
        pickupLocation: true,
        destination: true,
        shuttle: true, // optional if you want shuttle details too
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching driver bookings:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
