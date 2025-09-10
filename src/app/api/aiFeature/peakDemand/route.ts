import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { RandomForestRegression } from "ml-random-forest";

const prisma = new PrismaClient();

// This function simulates fetching a large historical dataset.
// In a production app, you would fetch this from your database.
function generateHistoricalData(numDays: number) {
  const historicalData = [];
  const now = new Date();

  // Generate data for past 'numDays'
  for (let d = 0; d < numDays; d++) {
    for (let h = 0; h < 24; h++) {
      const pastDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      const pastHour = h;

      // Simple pseudo-random demand with a peak around 8 AM and 5 PM
      const demand = Math.round(
        (Math.sin((pastHour * Math.PI) / 12) + 1) * 5 + Math.random() * 5
      );

      historicalData.push({ hour: pastHour, demand });
    }
  }
  return historicalData;
}

export async function GET() {
  try {
    // 1️⃣ Fetch actual recent bookings from the database (last 24 hours)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentBookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: oneDayAgo },
      },
      select: { createdAt: true },
    });

    // 2️⃣ Combine recent bookings with simulated historical data for training
    const historicalData = generateHistoricalData(30); // Use 30 days of data for training
    recentBookings.forEach((booking) => {
      historicalData.push({
        hour: new Date(booking.createdAt).getHours(),
        demand: 1,
      });
    });

    // 3️⃣ Prepare dataset for Random Forest
    const X = historicalData.map((d) => [d.hour]); // features (hour of day)
    const y = historicalData.map((d) => d.demand); // targets (demand count)

    // 4️⃣ Train Random Forest regressor
    const rf = new RandomForestRegression({
      nEstimators: 100, // Increased number of trees for better accuracy
      maxFeatures: 1,
    });
    rf.train(X, y);

    // 5️⃣ Predict for the next 6 hours
    const predictions = [];
    const predictionHours = [];
    const currentHour = now.getHours();

    for (let i = 1; i <= 6; i++) {
      const nextHour = (currentHour + i) % 24;
      const prediction = Math.round(rf.predict([[nextHour]])[0]);
      predictions.push(Math.max(0, prediction)); // Ensure no negative predictions
      predictionHours.push(nextHour);
    }

    return NextResponse.json(
      { hours: predictionHours, predictions: predictions },
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
