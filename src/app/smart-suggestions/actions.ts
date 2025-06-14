// src/app/smart-suggestions/actions.ts
"use server";

import { suggestAlternativeRecipes, type SuggestAlternativeRecipesInput, type SuggestAlternativeRecipesOutput } from "@/ai/flows/suggest-alternative-recipes";

export async function getSmartRecipeSuggestions(
  input: SuggestAlternativeRecipesInput
): Promise<SuggestAlternativeRecipesOutput | { error: string }> {
  try {
    const suggestions = await suggestAlternativeRecipes(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching smart recipe suggestions:", error);
    // It's good practice to not expose raw error messages to the client
    // For a production app, you might want to log the detailed error and return a generic message
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { error: `Failed to get suggestions: ${errorMessage}` };
  }
}
