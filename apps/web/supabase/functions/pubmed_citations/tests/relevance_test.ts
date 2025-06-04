// deno-lint-ignore-file
// @ts-nocheck
// relevance_test.ts - v2 2025-06-03

import { assertEquals, assertGreater } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { cosineSimilarity, calculateRelevanceScore, type RelevanceContext } from "../lib/relevance.ts";

Deno.test("cosineSimilarity - exact match", () => {
  const text = "magnesium supplement health benefits";
  const similarity = cosineSimilarity(text, text);
  assertEquals(similarity, 1);
});

Deno.test("cosineSimilarity - no match", () => {
  const text1 = "vitamin d supplementation";
  const text2 = "protein powder benefits";
  const similarity = cosineSimilarity(text1, text2);
  assertEquals(similarity, 0);
});

Deno.test("cosineSimilarity - partial match", () => {
  const text1 = "magnesium supplement benefits";
  const text2 = "magnesium health effects study";
  const similarity = cosineSimilarity(text1, text2);
  assertGreater(similarity, 0);
  assertGreater(1, similarity);
});

Deno.test("calculateRelevanceScore - high relevance", () => {
  const context: RelevanceContext = {
    supplementName: "Magnesium Glycinate",
    healthGoals: ["better sleep", "muscle recovery"],
    conditions: ["anxiety", "insomnia"]
  };
  
  const title = "Magnesium supplementation improves sleep quality and anxiety in adults";
  const score = calculateRelevanceScore(title, context);
  
  assertGreater(score, 0.3);
});

Deno.test("calculateRelevanceScore - low relevance", () => {
  const context: RelevanceContext = {
    supplementName: "Vitamin D",
    healthGoals: ["bone health"],
    conditions: ["osteoporosis"]
  };
  
  const title = "Protein powder effects on muscle mass in athletes";
  const score = calculateRelevanceScore(title, context);
  
  assertEquals(score, 0);
}); 
