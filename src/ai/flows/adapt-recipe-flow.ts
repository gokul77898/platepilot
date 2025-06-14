
'use server';
/**
 * @fileOverview Provides AI-powered recipe adaptation suggestions.
 *
 * - adaptRecipe - A function to get adaptation suggestions for a recipe.
 * - AdaptRecipeInput - The input type for the adaptRecipe function.
 * - AdaptRecipeOutput - The return type for the adaptRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptRecipeInputSchema = z.object({
  originalRecipeNameOrDetails: z.string().describe("The name of the original recipe, or its ingredients and instructions."),
  adaptationRequest: z.string().describe("The user's request for how to adapt the recipe (e.g., 'Make this gluten-free and low-sugar', 'How can I make this vegan?')."),
});
export type AdaptRecipeInput = z.infer<typeof AdaptRecipeInputSchema>;

const AdaptRecipeOutputSchema = z.object({
  adaptedRecipeName: z.string().describe("A suggested new name for the adapted recipe (e.g., 'Gluten-Free, Low-Sugar Apple Crumble')."),
  suggestedModifications: z.string().describe("Detailed, step-by-step suggestions on how to modify the recipe. This should include ingredient swaps, quantity adjustments, and changes to preparation methods if necessary."),
  warningsOrConsiderations: z.string().optional().describe("Any warnings, important considerations, or potential impacts on taste, texture, or baking time due to the adaptations."),
});
export type AdaptRecipeOutput = z.infer<typeof AdaptRecipeOutputSchema>;

export async function adaptRecipe(input: AdaptRecipeInput): Promise<AdaptRecipeOutput> {
  return adaptRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptRecipePrompt',
  input: {schema: AdaptRecipeInputSchema},
  output: {schema: AdaptRecipeOutputSchema},
  prompt: `You are an expert recipe adaptation assistant. A user wants to modify an existing recipe to meet certain dietary needs or preferences.

Original Recipe (name or details):
{{{originalRecipeNameOrDetails}}}

Adaptation Request:
{{{adaptationRequest}}}

Your task is to:
1. Suggest a new name for the adapted recipe that reflects the changes (e.g., "Gluten-Free {Original Name}", "Vegan {Original Name}").
2. Provide detailed, actionable suggested modifications. This should explain *what* to change and *how*. If specific ingredient swaps are needed, list them with appropriate quantities if possible. If preparation methods need to change, describe those changes.
3. List any important warnings, considerations, or potential impacts on the final dish's taste, texture, or cooking/baking time that the user should be aware of. If there are none, you can omit this field or state "No specific warnings."

Focus on practical, clear, and helpful advice. Ensure your response is in the specified JSON output format.
If the original recipe details are too vague to provide specific adaptations (e.g., just a recipe name with no ingredients), explain what additional information would be helpful from the user. In such cases, you can still suggest a generic adapted name if appropriate, but focus the 'suggestedModifications' on what information is needed.
If the adaptation request is impossible or unsafe (e.g., making a water-based soup 'crispy'), politely state that and explain why.

Example output format:
{
  "adaptedRecipeName": "Gluten-Free, Dairy-Free Chocolate Chip Cookies",
  "suggestedModifications": "To make these chocolate chip cookies gluten-free and dairy-free:\n1. Flour: Replace all-purpose flour with a 1:1 gluten-free baking flour blend.\n2. Butter: Substitute dairy butter with an equal amount of dairy-free butter spread or coconut oil (solidified).\n3. Milk (if any): If the recipe calls for milk, use a dairy-free alternative like almond milk, soy milk, or oat milk.\n4. Chocolate Chips: Ensure you use dairy-free chocolate chips.",
  "warningsOrConsiderations": "Gluten-free flours can sometimes result in a slightly different texture. Baking times might need minor adjustments; keep an eye on them. Ensure your dairy-free butter alternative is suitable for baking."
}
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const adaptRecipeFlow = ai.defineFlow(
  {
    name: 'adaptRecipeFlow',
    inputSchema: AdaptRecipeInputSchema,
    outputSchema: AdaptRecipeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid recipe adaptation. Please try refining your request.");
    }
    return output;
  }
);

