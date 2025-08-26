import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all contracts for the user with their analysis results
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        *,
        analysis_results (
          id,
          summary,
          issues,
          improvements,
          analyzed_at
        )
      `)
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (contractsError) {
      console.error('Database query error:', contractsError);
      return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 });
    }

    return NextResponse.json({
      contracts: contracts || []
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch contracts";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
