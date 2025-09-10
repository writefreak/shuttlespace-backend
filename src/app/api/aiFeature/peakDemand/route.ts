// app/api/stats/peakDemand.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { RandomForestRegression } from "ml-random-forest";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1️⃣ Fetch bookings
    const bookings = await prisma.booking.findMany({
      select: { createdAt: true },
    });

    if (!bookings.length) {
      return NextResponse.json({ hours: [], predictions: [] }, { status: 200 });
    }

    // 2️⃣ Get last 6 hours
    const now = new Date();
    const last6Hours = Array.from(
      { length: 6 },
      (_, i) => (now.getHours() - 5 + i + 24) % 24
    );

    // 3️⃣ Count bookings for each of last 6 hours
    const counts = last6Hours.map(
      (h) =>
        bookings.filter((b) => new Date(b.createdAt).getHours() === h).length
    );

    // 4️⃣ Prepare dataset for Random Forest
    const X = last6Hours.map((h) => [h]); // features
    const y = counts; // targets

    // 5️⃣ Train Random Forest regressor
    const rf = new RandomForestRegression({
      nEstimators: 50, // number of trees
      maxFeatures: 1,
    });

    rf.train(X, y);

    // 6️⃣ Predict for last 6 hours
    const predictions = X.map((x) => Math.round(rf.predict([x])[0]));

    return NextResponse.json(
      { hours: last6Hours, predictions },
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
