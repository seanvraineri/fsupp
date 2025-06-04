// deno-lint-ignore-file
// @ts-nocheck
// lib/products.ts – fetchBestLinks

/**
 * Queries best_product_links_mv for up to 3 links matching the supplement name.
 * Returns a markdown block or an empty string if nothing found / error.
 */
export async function fetchBestLinks(supabase: any, supplementText: string): Promise<string> {
  try {
    // crude extraction: first two words
    const match = supplementText.split(/\s+/).slice(0, 2).join(" ");

    const { data, error } = await supabase
      .from("best_product_links_mv")
      .select("brand, product_url, price, supplement_name")
      .ilike("supplement_name", `%${match}%`)
      .order("price", { ascending: true })
      .limit(3);

    if (error) {
      console.warn("fetchBestLinks error", error);
      return "";
    }

    if (!data || data.length === 0) return "";

    let block = "\n\n### Shop Trusted Supplements:";
    for (const row of data) {
      block += `\n- [${row.brand}](${row.product_url}) – $${row.price}`;
    }
    return block;
  } catch (e) {
    console.warn("fetchBestLinks exception", e);
    return "";
  }
} 