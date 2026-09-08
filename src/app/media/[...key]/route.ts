import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";

const STORAGE_DIR = path.resolve(process.env.LOCAL_STORAGE_DIR ?? "./storage/uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

/** Sert les fichiers stockés localement (driver « local »). Avec le driver
 * « s3 »/R2, les médias sont servis par le bucket et cette route est inerte. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const filename = key.join("/");

  if (filename.includes("..") || path.isAbsolute(filename)) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }
  const filePath = path.join(STORAGE_DIR, filename);
  if (!filePath.startsWith(STORAGE_DIR)) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  try {
    await stat(filePath);
    const buffer = await readFile(filePath);
    const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    const downloadName = request.nextUrl.searchParams.get("download");
    if (downloadName) {
      headers["Content-Disposition"] = `attachment; filename="${downloadName.replace(/"/g, "")}"`;
    }
    return new NextResponse(new Uint8Array(buffer), { headers });
  } catch {
    return NextResponse.json({ error: "Média introuvable" }, { status: 404 });
  }
}
