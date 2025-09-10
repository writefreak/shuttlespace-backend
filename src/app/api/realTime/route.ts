// app/api/realtime/route.ts
import { NextRequest } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(req: NextRequest) {
  // get bookingId from query
  const bookingId = req.nextUrl.searchParams.get("bookingId");

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        `data: ${JSON.stringify({ message: "connected" })}\n\n`
      );

      // subscribe to only this booking’s updates
      const channel = supabase
        .channel("booking-changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "booking",
            filter: `id=eq.${bookingId}`, // 👈 only updates for this booking id
          },
          (payload) => {
            controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
          }
        )
        .subscribe();

      req.signal.addEventListener("abort", () => {
        supabase.removeChannel(channel);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
