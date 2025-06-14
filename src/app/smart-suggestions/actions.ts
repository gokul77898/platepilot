
// src/app/smart-suggestions/actions.ts
"use server";

import { suggestAlternativeRecipes, type SuggestAlternativeRecipesInput, type SuggestAlternativeRecipesOutput } from "@/ai/flows/suggest-alternative-recipes";
import { suggestRecipesGivenConstraints, type SuggestRecipesGivenConstraintsInput, type SuggestRecipesGivenConstraintsOutput } from "@/ai/flows/suggest-recipes-given-constraints";
import { analyzeMealImage, type AnalyzeMealImageInput, type AnalyzeMealImageOutput } from "@/ai/flows/analyze-meal-image-flow";


export async function getSmartRecipeSuggestions(
  input: SuggestAlternativeRecipesInput
): Promise<SuggestAlternativeRecipesOutput | { error: string }> {
  try {
    const suggestions = await suggestAlternativeRecipes(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching smart recipe suggestions:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { error: `Failed to get suggestions: ${errorMessage}` };
  }
}

export async function getRecipeIdeasFromConstraints(
  input: SuggestRecipesGivenConstraintsInput
): Promise<SuggestRecipesGivenConstraintsOutput | { error: string }> {
  try {
    const ideas = await suggestRecipesGivenConstraints(input);
    return ideas;
  } catch (error) {
    console.error("Error fetching recipe ideas from constraints:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { error: `Failed to get recipe ideas: ${errorMessage}` };
  }
}

export async function analyzeUploadedMealImage(
  input: AnalyzeMealImageInput
): Promise<AnalyzeMealImageOutput | { error: string }> {
  try {
    const analysis = await analyzeMealImage(input);
    return analysis;
  } catch (error) {
    console.error("Error analyzing meal image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { error: `Failed to analyze image: ${errorMessage}` };
  }
}
