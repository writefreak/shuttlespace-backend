// app/api/stats/peakDemand.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as tf from "@tensorflow/tfjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1️⃣ Fetch historical bookings from your database
    const bookings = await prisma.booking.findMany({
      select: { createdAt: true },
    });

    if (!bookings.length) {
      // no data yet, return empty array
      return NextResponse.json([], { status: 200 });
    }

    // 2️⃣ Count bookings per hour
    const countsPerHour: number[] = Array(24).fill(0);
    bookings.forEach((b) => {
      const hour = new Date(b.createdAt).getHours();
      countsPerHour[hour] += 1;
    });

    // 3️⃣ Prepare tensors for TensorFlow
    const xs = tf.tensor2d([...Array(24).keys()].map((h) => [h])); // 0-23 hours
    const ys = tf.tensor2d(countsPerHour.map((c) => [c])); // counts

    // 4️⃣ Build simple linear regression model
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [1], units: 1 }));

    model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

    // 5️⃣ Train model
    await model.fit(xs, ys, { epochs: 100 });

    // 6️⃣ Predict bookings for each hour
    const preds = model.predict(xs) as tf.Tensor;
    const predictionArray = Array.from(preds.dataSync()).map((v) =>
      Math.round(v)
    );

    // 7️⃣ Return predictions as JSON
    return NextResponse.json(predictionArray, { status: 200 });
  } catch (err) {
    console.error("Error fetching peak demand:", err);
    return NextResponse.json(
      { error: "Failed to fetch peak demand" },
      { status: 500 }
    );
  }
}
