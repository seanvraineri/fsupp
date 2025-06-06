// deno-lint-ignore-file
// @ts-nocheck
// lib/profile.ts – buildUserProfile helper
// Fetches consolidated user context via RPC and prepares a trimmed profile object.

export interface UserProfile {
  userId: string | null;
  raw: Record<string, unknown>;
  text: string;          // ≤1500 chars summary
  biomarkerAlerts: string[];
  hash: string;          // sha256 of text for caching
}

/**
 * Calls rpc_get_user_context(user_id) which must return a JSON object containing:
 *  labs, gene_highlights, flags, goals, adherence, journal, prefs
 */
export async function buildUserProfile(supabase: any, userId?: string | null): Promise<UserProfile> {
  if (!userId) {
    return {
      userId: null,
      raw: {},
      text: "General user without profile.",
      biomarkerAlerts: [],
      hash: await sha256("General user without profile.")
    };
  }

  // Call RPC – tolerate failure by returning empty profile
  const { data, error } = await supabase.rpc("rpc_get_user_context", { p_user_id: userId });
  if (error) {
    console.warn("rpc_get_user_context error", error);
  }

  const context: Record<string, unknown> = data || {};

  // Build biomarker alerts if labs present
  const biomarkerAlerts: string[] = [];
  if (Array.isArray(context.labs)) {
    for (const lab of context.labs) {
      const { name, value, ref_low, ref_high } = lab as any;
      if (typeof value === "number" && (value < ref_low || value > ref_high)) {
        biomarkerAlerts.push(`${name} out of range (${value})`);
      }
    }
  }

  // Create concise textual summary (≤1500 chars)
  const textParts: string[] = [];
  if (context.flags) textParts.push(`Flags: ${JSON.stringify(context.flags)}`);
  if (context.goals) textParts.push(`Goals: ${JSON.stringify(context.goals)}`);
  if (context.gene_highlights) textParts.push(`Gene highlights: ${JSON.stringify(context.gene_highlights)}`);
  if (context.adherence) textParts.push(`Adherence: ${JSON.stringify(context.adherence)}`);
  if (context.journal) textParts.push(`Journal: ${JSON.stringify(context.journal).slice(0, 300)}`);

  let summary = textParts.join(" \n");
  if (summary.length > 1500) summary = summary.slice(0, 1490) + "…";

  return {
    userId,
    raw: context,
    text: summary,
    biomarkerAlerts,
    hash: await sha256(summary)
  };
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
} 
