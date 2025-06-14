
'use server';
/**
 * @fileOverview Analyzes a recipe's ingredients and servings to estimate nutritional information per serving.
 *
 * - analyzeRecipeNutrition - A function that handles the recipe nutritional analysis.
 * - AnalyzeRecipeNutritionInput - The input type for the function.
 * - AnalyzeRecipeNutritionOutput - The return type for the function (NutritionalInfo).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { NutritionalInfo, AnalyzeRecipeNutritionInputIngredient } from '@/types'; // Import types

const AnalyzeRecipeNutritionInputIngredientSchema = z.object({
  name: z.string().describe("The name of the ingredient."),
  quantity: z.string().describe("The quantity of the ingredient (e.g., '100', '1/2', '1 medium')."),
  unit: z.string().optional().describe("The unit for the ingredient quantity (e.g., 'g', 'cup', 'piece')."),
});

const AnalyzeRecipeNutritionInputSchema = z.object({
  recipeName: z.string().describe("The name of the recipe being analyzed."),
  ingredients: z.array(AnalyzeRecipeNutritionInputIngredientSchema).describe("A list of ingredients with their quantities and units."),
  servings: z.number().min(1).describe("The total number of servings the recipe makes."),
});
// Explicitly type the Zod schema to match our TS type for clarity
export type AnalyzeRecipeNutritionInput = z.infer<typeof AnalyzeRecipeNutritionInputSchema>;


const NutritionalInfoSchema = z.object({
  calories: z.number().optional().describe("Estimated calories per serving. Omit if not reliably calculable."),
  protein: z.number().optional().describe("Estimated protein in grams per serving. Omit if not reliably calculable."),
  carbs: z.number().optional().describe("Estimated carbohydrates in grams per serving. Omit if not reliably calculable."),
  fat: z.number().optional().describe("Estimated fat in grams per serving. Omit if not reliably calculable."),
});
// Explicitly type the Zod schema to match our TS type for clarity
export type AnalyzeRecipeNutritionOutput = z.infer<typeof NutritionalInfoSchema>;


export async function analyzeRecipeNutrition(input: AnalyzeRecipeNutritionInput): Promise<AnalyzeRecipeNutritionOutput> {
  return analyzeRecipeNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRecipeNutritionPrompt',
  input: {schema: AnalyzeRecipeNutritionInputSchema},
  output: {schema: NutritionalInfoSchema}, 
  prompt: `You are a nutritional analysis AI. Based on the provided recipe details, estimate the nutritional information PER SERVING.
Recipe Name: {{{recipeName}}}
Servings: {{{servings}}}
Ingredients:
{{#each ingredients}}
- {{{quantity}}} {{{unit}}} {{{name}}}
{{/each}}

Your task is to calculate the estimated nutritional values (calories, protein, carbohydrates, and fat) for a single serving of this recipe.
If you cannot reliably estimate a particular nutritional value, omit that field from the output or set it to null.
Focus on common food items and general nutritional principles. This is an estimation, not medical advice.
Return the output in the specified JSON format for NutritionalInfo.

Example Input:
{
  "recipeName": "Chicken Stir-fry",
  "ingredients": [
    { "name": "Chicken Breast", "quantity": "200", "unit": "g" },
    { "name": "Broccoli Florets", "quantity": "1", "unit": "cup" },
    { "name": "Soy Sauce", "quantity": "2", "unit": "tbsp" },
    { "name": "Rice (cooked)", "quantity": "1", "unit": "cup" }
  ],
  "servings": 2
}

Expected JSON Output (for the example above, values are illustrative):
{
  "calories": 350,
  "protein": 30,
  "carbs": 35,
  "fat": 10
}`,
  config: {
    safetySettings: [ 
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  }
});

const analyzeRecipeNutritionFlow = ai.defineFlow(
  {
    name: 'analyzeRecipeNutritionFlow',
    inputSchema: AnalyzeRecipeNutritionInputSchema,
    outputSchema: NutritionalInfoSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        // Return an empty object or specific fields as undefined/null if the AI can't process.
        return { calories: undefined, protein: undefined, carbs: undefined, fat: undefined };
    }
    // Ensure all optional fields are present, even if undefined, to match NutritionalInfo type.
    return {
        calories: output.calories,
        protein: output.protein,
        carbs: output.carbs,
        fat: output.fat,
    };
  }
);
