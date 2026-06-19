import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function jsonErr(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  // Auth guard
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.user_metadata?.role !== "super_admin") {
    return jsonErr("Unauthorized", 401);
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return jsonErr("File tidak ditemukan");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const allowed = ["png", "jpg", "jpeg", "webp", "svg"];
  if (!allowed.includes(ext)) return jsonErr("Format file tidak didukung (png/jpg/webp/svg)");

  const fileName = `${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const service = createServiceClient();
  const { error } = await service.storage
    .from("logos")
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (error) return jsonErr(error.message);

  const { data } = service.storage.from("logos").getPublicUrl(fileName);
  return NextResponse.json({ data: { url: data.publicUrl } });
}
