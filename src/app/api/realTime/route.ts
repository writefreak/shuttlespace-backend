// app/api/realtime/route.ts
import { NextRequest } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        `data: ${JSON.stringify({ message: "connected" })}\n\n`
      );

      // subscribe to supabase realtime
      const channel = supabase
        .channel("booking-changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "booking",
          },
          (payload) => {
            controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
          }
        )
        .subscribe();

      // close handler
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
