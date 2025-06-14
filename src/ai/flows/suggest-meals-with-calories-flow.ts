
'use server';
/**
 * @fileOverview Suggests meals with estimated calories based on user preferences.
 *
 * - suggestMealsWithCalories - A function that handles meal suggestions.
 * - AiMealSuggestionInputSchema - The input type for the function.
 * - AiMealSuggestionOutputSchema - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AiMealSuggestionInputSchema = z.object({
  mealType: z.string().optional().describe("The type of meal (e.g., breakfast, lunch, dinner, snack)."),
  dietaryPreferences: z.string().optional().describe("Any dietary restrictions or preferences (e.g., vegetarian, gluten-free, low-carb)."),
  keywords: z.string().optional().describe("General keywords for the meal (e.g., quick, healthy, high-protein, comfort food)."),
});

export const AiMealSuggestionSchema = z.object({
  name: z.string().describe("The name of the suggested meal."),
  description: z.string().describe("A brief description of the meal (1-2 sentences)."),
  estimatedCalories: z.number().nullable().describe("The estimated calorie count for one serving of the meal. Provide null if unable to estimate reliably."),
});

export const AiMealSuggestionOutputSchema = z.array(AiMealSuggestionSchema);

export type AiMealSuggestionInput = z.infer<typeof AiMealSuggestionInputSchema>;
export type AiMealSuggestion = z.infer<typeof AiMealSuggestionSchema>;
export type AiMealSuggestionOutput = z.infer<typeof AiMealSuggestionOutputSchema>;


export async function suggestMealsWithCalories(input: AiMealSuggestionInput): Promise<AiMealSuggestionOutput> {
  return suggestMealsWithCaloriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMealsWithCaloriesPrompt',
  input: {schema: AiMealSuggestionInputSchema},
  output: {schema: AiMealSuggestionOutputSchema},
  prompt: `You are a helpful meal planning assistant. Generate 3-5 meal suggestions based on the user's criteria. For each meal, provide a name, a brief 1-2 sentence description, and an estimated calorie count for a typical single serving.

User Criteria:
{{#if mealType}}Meal Type: {{{mealType}}}{{/if}}
{{#if dietaryPreferences}}Dietary Preferences: {{{dietaryPreferences}}}{{/if}}
{{#if keywords}}Keywords: {{{keywords}}}{{/if}}
{{#unless mealType}}{{#unless dietaryPreferences}}{{#unless keywords}}No specific criteria provided, suggest general healthy options.{{/unless}}{{/unless}}{{/unless}}

Return the suggestions as a JSON array adhering to the output schema. Ensure calorie estimations are reasonable for a single serving. If calories cannot be reliably estimated for a specific suggestion, set estimatedCalories to null for that item.
Focus on common, recognizable meal names.
Example Output:
[
  {
    "name": "Grilled Chicken Salad",
    "description": "A fresh salad with grilled chicken breast, mixed greens, cherry tomatoes, cucumbers, and a light vinaigrette.",
    "estimatedCalories": 350
  },
  {
    "name": "Quinoa Bowl with Roasted Vegetables",
    "description": "Nutrient-packed quinoa topped with a colorful mix of roasted sweet potatoes, broccoli, and bell peppers.",
    "estimatedCalories": 450
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
