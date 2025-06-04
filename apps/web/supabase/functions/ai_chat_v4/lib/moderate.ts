// deno-lint-ignore-file
// @ts-nocheck

/**
 * runModeration
 * Returns true if text is safe, false if blocked.
 */
export async function runModeration(text: string): Promise<boolean> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return true; // no key → skip moderation

  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({ input: text })
    });
    if (!res.ok) return true; // fail open
    const json = await res.json();
    return !(json.results?.[0]?.flagged);
  } catch {
    return true; // network error → allow
  }
} 