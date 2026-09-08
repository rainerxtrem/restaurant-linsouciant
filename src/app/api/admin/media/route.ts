import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { listMedia, uploadMedia, MediaUploadError } from "@/lib/services/media.service";

export async function GET() {
  try {
    await requireAdmin();
    const media = await listMedia();
    return NextResponse.json({ media });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }
    const media = await uploadMedia(file, session.user.id);
    return NextResponse.json({ media });
  } catch (error) {
    if (error instanceof MediaUploadError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return handleApiError(error);
  }
}
