
"use server";

import { suggestMealsWithCalories, type AiMealSuggestionInput, type AiMealSuggestionOutput } from "@/ai/flows/suggest-meals-with-calories-flow";

export async function getAiMealSuggestions(
  input: AiMealSuggestionInput
): Promise<AiMealSuggestionOutput | { error: string }> {
  try {
    const suggestions = await suggestMealsWithCalories(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching AI meal suggestions:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { error: `Failed to get meal suggestions: ${errorMessage}` };
  }
}
