// app/api/stats/peakDemand.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { RandomForestRegression } from "ml-random-forest";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1️⃣ Fetch actual bookings in the last 24 hours
    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      select: { createdAt: true },
    });

    // 2️⃣ Count bookings per hour (0-23)
    const countsPerHour: number[] = Array(24).fill(0);
    bookings.forEach((b) => {
      const hour = new Date(b.createdAt).getHours();
      countsPerHour[hour] += 1;
    });

    // 3️⃣ Prepare dataset for Random Forest
    const X = countsPerHour.map((_, hour) => [hour]); // feature: hour
    const y = countsPerHour; // target: bookings count

    // 4️⃣ Train Random Forest
    const rf = new RandomForestRegression({ nEstimators: 100, maxFeatures: 1 });
    rf.train(X, y);

    // 5️⃣ Predict next 6 hours
    const predictions = [];
    const predictionHours = [];
    const currentHour = now.getHours();

    for (let i = 1; i <= 6; i++) {
      const nextHour = (currentHour + i) % 24;
      const prediction = Math.round(rf.predict([[nextHour]])[0]);
      predictions.push(Math.max(0, prediction)); // no negatives
      predictionHours.push(nextHour);
    }

    return NextResponse.json(
      { hours: predictionHours, predictions },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch peak demand" },
      { status: 500 }
    );
  }
}
