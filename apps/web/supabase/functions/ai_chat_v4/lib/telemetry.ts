// deno-lint-ignore-file
// @ts-nocheck
export async function logMetric(sb: any, data: { provider?: string; latency_ms?: number; tokens?: number }) {
  try {
    await sb.from("chat_metrics").insert({
      provider: data.provider ?? "openai:gpt-4o-mini",
      latency_ms: data.latency_ms ?? null,
      tokens: data.tokens ?? null,
      created_at: new Date().toISOString()
    });
  } catch (_) {}
}

export async function logCost(sb: any, cost: number) {
  try {
    await sb.from("chat_costs").insert({
      cost_usd: cost,
      created_at: new Date().toISOString()
    });
  } catch (_) {}
} 