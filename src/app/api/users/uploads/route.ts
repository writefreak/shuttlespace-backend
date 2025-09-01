import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as any;
    const id = formData.get("id") as string;

    if (!file || !id) {
      return NextResponse.json(
        { error: "Missing File or id" },
        { status: 400 }
      );
    }
    const arrayBuffer = await file.arrayBuffer();

    const uploadResult = await supabase.storage
      .from("avatars")
      .upload(`profileImage-${id}.jpg`, new Uint8Array(arrayBuffer), {
        upsert: true,
      });

    if (uploadResult.error) {
      return NextResponse.json(
        { error: uploadResult.error?.message },
        { status: 500 }
      );
    }
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(`profileImage-${id}.jpg`);

    const imageUrl = publicUrlData.publicUrl; //image

    //get public url
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { image: imageUrl },
    });
    return NextResponse.json({
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in Upload", error);
    NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
