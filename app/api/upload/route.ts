import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
// Dynamically import pdf-parse inside the request handler to avoid bundling issues

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Upload file to Supabase Storage
    const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const filePath = `${user.id}/${Date.now()}_${safeName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, buffer, {
        contentType: fileType,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    // Save contract metadata to database
    const { data: contractData, error: dbError } = await supabase
      .from('contracts')
      .insert({
        user_id: user.id,
        filename: fileName,
        file_path: filePath,
        file_size: buffer.length,
        file_type: fileType,
        extracted_text: text
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('contracts').remove([filePath]);
      return NextResponse.json({ error: "Failed to save contract metadata" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      name: fileName,
      size: buffer.length,
      type: fileType,
      savedAs: filePath,
      extractedText: text,
      contractId: contractData.id
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


