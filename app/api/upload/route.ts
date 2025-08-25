import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
// Dynamically import pdf-parse inside the request handler to avoid bundling issues

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name || "contract.pdf";
    const fileType = file.type || "application/pdf";
    const isPdfMime = fileType === "application/pdf";
    const isPdfName = fileName.toLowerCase().endsWith(".pdf");
    if (!isPdfMime && !isPdfName) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 415 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "uploads");
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch {}

    const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const filePath = path.join(uploadsDir, `${Date.now()}_${safeName}`);
    await fs.writeFile(filePath, buffer);

    // Extract text content from PDF buffer
    let text = "";
    try {
      const { default: pdfParse } = await import("pdf-parse");
      const parsed = await pdfParse(buffer);
      text = parsed.text || "";
    } catch (e) {
      // If parsing fails, we still return upload info but note extraction failure
      text = "";
    }

    return NextResponse.json({
      ok: true,
      name: fileName,
      size: buffer.length,
      type: fileType,
      savedAs: path.basename(filePath),
      extractedText: text,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


