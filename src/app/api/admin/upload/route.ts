import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const BUCKET = "thumbnails";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "파일이 없습니다." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { message: "이미지 파일만 업로드할 수 있습니다." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { message: "파일 크기는 5 MB 이하여야 합니다." },
      { status: 400 }
    );
  }

  // 버킷이 없으면 생성 (이미 존재하면 오류 무시)
  const { error: bucketErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES
  });
  if (bucketErr && !bucketErr.message.toLowerCase().includes("already exists")) {
    return NextResponse.json(
      { message: "스토리지 초기화에 실패했습니다." },
      { status: 500 }
    );
  }

  const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes    = await file.arrayBuffer();

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(filename, bytes, { contentType: file.type, upsert: false });

  if (uploadErr) {
    return NextResponse.json({ message: "업로드에 실패했습니다." }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
