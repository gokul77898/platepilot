
'use server';
/**
 * @fileOverview Suggests meals with estimated calories and detailed ingredient breakdown based on user preferences.
 *
 * - suggestMealsWithCalories - A function that handles meal suggestions.
 * - AiMealSuggestionInput - The input type for the function.
 * - AiMealSuggestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiMealSuggestionInputSchema = z.object({
  mealType: z.string().optional().describe("The type of meal (e.g., breakfast, lunch, dinner, snack)."),
  dietaryPreferences: z.string().optional().describe("Any dietary restrictions or preferences (e.g., vegetarian, gluten-free, low-carb)."),
  keywords: z.string().optional().describe("General keywords for the meal (e.g., quick, healthy, high-protein, comfort food)."),
});

const AiSuggestedIngredientSchema = z.object({
  name: z.string().describe("The name of the ingredient."),
  quantity: z.string().optional().describe("Estimated quantity of the ingredient (e.g., '100', '1/2', '1 medium')."),
  unit: z.string().optional().describe("Unit for the ingredient quantity (e.g., 'g', 'cup', 'piece')."),
  estimatedCalories: z.number().nullable().optional().describe("Estimated calories for this quantity of the ingredient. Null if not reliably estimable."),
});

const AiMealSuggestionSchema = z.object({
  name: z.string().describe("The name of the suggested meal."),
  description: z.string().describe("A detailed description of the meal (2-3 sentences)."),
  ingredients: z.array(AiSuggestedIngredientSchema).describe("A list of main ingredients with their details."),
  estimatedCalories: z.number().nullable().describe("The total estimated calorie count for one serving of the meal. Provide null if unable to estimate reliably."),
});

const AiMealSuggestionOutputSchema = z.array(AiMealSuggestionSchema);

export type AiMealSuggestionInput = z.infer<typeof AiMealSuggestionInputSchema>;
export type AiSuggestedIngredient = z.infer<typeof AiSuggestedIngredientSchema>;
export type AiMealSuggestion = z.infer<typeof AiMealSuggestionSchema>;
export type AiMealSuggestionOutput = z.infer<typeof AiMealSuggestionOutputSchema>;


export async function suggestMealsWithCalories(input: AiMealSuggestionInput): Promise<AiMealSuggestionOutput> {
  return suggestMealsWithCaloriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMealsWithCaloriesPrompt',
  input: {schema: AiMealSuggestionInputSchema},
  output: {schema: AiMealSuggestionOutputSchema},
  prompt: `You are a helpful meal planning assistant. Generate 1-3 meal suggestions based on the user's criteria.
For each meal, you MUST provide:
1. A compelling and detailed 'name' for the meal.
2. A rich 'description' of the meal (2-3 sentences), highlighting its key features or taste profile.
3. A list of main 'ingredients'. For each ingredient, specify its 'name', an estimated 'quantity' (e.g., "100", "1/2", "1 medium"), its 'unit' (e.g., "g", "cup", "piece"), and an 'estimatedCalories' count for that quantity if possible. If calorie estimation for an ingredient is not reliable, set 'estimatedCalories' to null or omit it.
4. The total 'estimatedCalories' for one serving of the entire meal. Provide null if unable to estimate reliably.

User Criteria:
{{#if mealType}}Meal Type: {{{mealType}}}{{/if}}
{{#if dietaryPreferences}}Dietary Preferences: {{{dietaryPreferences}}}{{/if}}
{{#if keywords}}Keywords: {{{keywords}}}{{/if}}
{{#unless mealType}}{{#unless dietaryPreferences}}{{#unless keywords}}No specific criteria provided, suggest general healthy options.{{/unless}}{{/unless}}{{/unless}}

Return the suggestions as a JSON array adhering to the output schema. Ensure calorie estimations are reasonable.
Focus on common, recognizable meal names.

Example Output:
[
  {
    "name": "Hearty Grilled Chicken & Quinoa Power Bowl",
    "description": "A vibrant and satisfying bowl packed with protein and nutrients. Juicy grilled chicken breast sits atop a bed of fluffy quinoa, complemented by colorful roasted vegetables like bell peppers, zucchini, and cherry tomatoes, all drizzled with a light lemon-herb vinaigrette.",
    "ingredients": [
      { "name": "Chicken Breast (grilled)", "quantity": "150", "unit": "g", "estimatedCalories": 200 },
      { "name": "Quinoa (cooked)", "quantity": "1", "unit": "cup", "estimatedCalories": 220 },
      { "name": "Mixed Bell Peppers (roasted)", "quantity": "1/2", "unit": "cup", "estimatedCalories": 30 },
      { "name": "Zucchini (roasted)", "quantity": "1/2", "unit": "cup", "estimatedCalories": 20 },
      { "name": "Cherry Tomatoes", "quantity": "1/4", "unit": "cup", "estimatedCalories": 10 },
      { "name": "Lemon-Herb Vinaigrette", "quantity": "2", "unit": "tbsp", "estimatedCalories": 70 }
    ],
    "estimatedCalories": 550
  }
]
`,
});

const suggestMealsWithCaloriesFlow = ai.defineFlow(
  {
    name: 'suggestMealsWithCaloriesFlow',
    inputSchema: AiMealSuggestionInputSchema,
    outputSchema: AiMealSuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI model did not return any meal suggestions.");
    }
    return output;
  }
);

