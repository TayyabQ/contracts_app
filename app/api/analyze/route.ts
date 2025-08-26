import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type AnalyzeResponse = {
  summary: string;
  issues: string[];
  improvements: string[];
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { extractedText, contractId } = (await request.json()) as { 
      extractedText?: string;
      contractId?: string;
    };
    
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: "Missing extractedText" }, { status: 400 });
    }

    if (!contractId) {
      return NextResponse.json({ error: "Missing contractId" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "Server missing GEMINI_API_KEY" }, { status: 500 });
    }

    const prompt = `You are a contracts analyst AI. Given the contract text, provide:
1) A concise summary (4-8 sentences).
2) A bullet list of key issues/risks.
3) A bullet list of suggested improvements.

CRITICAL: Respond with ONLY raw JSON. No prose, no markdown, no code fences.
Use the exact keys: {"summary": string, "issues": string[], "improvements": string[]}

Contract text:\n\n${extractedText.slice(0, 20000)}`; // guard length

    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}` , {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: { temperature: 0.2 },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json({ error: `Gemini error: ${txt}` }, { status: 502 });
    }

    const data = await resp.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("\n");

    let parsed: AnalyzeResponse | null = null;
    // Try strict JSON first
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonPayload = jsonMatch ? jsonMatch[0] : text;
    try {
      parsed = JSON.parse(jsonPayload) as AnalyzeResponse;
    } catch {
      // Fallback: parse sections by headings to avoid mixing content
      const extractSection = (label: string) => {
        const re = new RegExp(`${label}[:\n\r\s-]*([\s\S]*?)(?=\n\s*(summary|issues|improvements)\b|$)`, "i");
        const m = text.match(re);
        return m ? m[1].trim() : "";
      };
      const summaryText = extractSection("summary");
      const issuesText = extractSection("issues");
      const improvementsText = extractSection("improvements");
      const splitList = (s: string) =>
        s
          .split(/\n|•|^-\s|\d+\.\s/gm)
          .map((t: string) => t.trim().replace(/^[-•]\s*/, ""))
          .filter((t: string) => t.length > 0);
      parsed = {
        summary: summaryText || text.trim(),
        issues: splitList(issuesText),
        improvements: splitList(improvementsText),
      };
    }

    // Save analysis results to database
    const { data: analysisData, error: dbError } = await supabase
      .from('analysis_results')
      .insert({
        contract_id: contractId,
        summary: parsed.summary,
        issues: parsed.issues,
        improvements: parsed.improvements
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return NextResponse.json({ error: "Failed to save analysis results" }, { status: 500 });
    }

    return NextResponse.json({
      ...parsed,
      analysisId: analysisData.id
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Analyze failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


