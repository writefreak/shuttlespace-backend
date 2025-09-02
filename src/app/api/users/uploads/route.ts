// File: /app/api/upload/route.ts (Next.js 13+ with App Router)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Init Supabase client (server-side)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role needed for server uploads
);

export async function POST(req: Request) {
  try {
    // Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Create unique file name
    const fileName = `${Date.now()}-${file.name}`;

    // Upload to Supabase bucket
    const { error } = await supabase.storage
      .from("avatars") // bucket name
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
