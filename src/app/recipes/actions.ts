
"use server";

import { 
    analyzeRecipeNutrition, 
    type AnalyzeRecipeNutritionInput, 
    type AnalyzeRecipeNutritionOutput 
} from "@/ai/flows/analyze-recipe-nutrition-flow";

export async function getRecipeNutritionAnalysis(
  input: AnalyzeRecipeNutritionInput
): Promise<AnalyzeRecipeNutritionOutput | { error: string }> {
  try {
    const response = await analyzeRecipeNutrition(input);
    return response;
  } catch (error) {
    console.error("Error fetching recipe nutritional analysis:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during nutritional analysis.";
    return { error: `Failed to analyze recipe nutrition: ${errorMessage}` };
  }
}
