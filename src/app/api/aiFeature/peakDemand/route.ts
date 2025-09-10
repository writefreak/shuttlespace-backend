// app/api/stats/peakDemand.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { RandomForestRegression as RF } from "ml-random-forest";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1️⃣ Fetch bookings from DB
    const bookings = await prisma.booking.findMany({
      select: { createdAt: true },
    });

    if (!bookings.length) {
      return NextResponse.json([], { status: 200 });
    }

    // 2️⃣ Count bookings per hour
    const countsPerHour: number[] = Array(24).fill(0);
    bookings.forEach((b) => {
      const hour = new Date(b.createdAt).getHours();
      countsPerHour[hour] += 1;
    });

    // 3️⃣ Prepare data for Random Forest
    const X = Array.from({ length: 24 }, (_, i) => [i]); // [[0],[1],..,[23]]
    const y = countsPerHour;

    // 4️⃣ Train Random Forest
    const rf = new RF({
      nEstimators: 100,
      maxFeatures: 1, // only 1 feature (hour)
    });
    rf.train(X, y);

    // 5️⃣ Predict next 6 hours (or any range)
    const X_pred = Array.from({ length: 6 }, (_, i) => [18 + i]); // hours 18-23
    const predictions = rf.predict(X_pred).map((v) => Math.round(v));

    return NextResponse.json(predictions, { status: 200 });
  } catch (err) {
    console.error("Error fetching peak demand:", err);
    return NextResponse.json(
      { error: "Failed to fetch peak demand" },
      { status: 500 }
    );
  }
}
