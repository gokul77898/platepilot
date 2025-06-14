// src/ai/flows/suggest-alternative-recipes.ts
'use server';

/**
 * @fileOverview Suggests alternative ingredients or recipes based on user constraints.
 *
 * - suggestAlternativeRecipes - A function that handles the suggestion of alternative ingredients or recipes.
 * - SuggestAlternativeRecipesInput - The input type for the suggestAlternativeRecipes function.
 * - SuggestAlternativeRecipesOutput - The return type for the suggestAlternativeRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeRecipesInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to find alternatives for.'),
  ingredients: z.string().describe('The list of ingredients in the recipe.'),
  dietaryRestrictions: z.string().describe('The dietary restrictions of the user.'),
  preferredIngredient: z.string().optional().describe('The preferred ingredient to use up.'),
  avoidedIngredient: z.string().optional().describe('The ingredient to avoid.'),
});
export type SuggestAlternativeRecipesInput = z.infer<typeof SuggestAlternativeRecipesInputSchema>;

const SuggestedRecipeSchema = z.object({
  name: z.string().describe('The name of the suggested recipe.'),
  ingredients: z.string().describe('The ingredients of the suggested recipe.'),
  reason: z.string().describe('Why this recipe is suggested based on the input criteria.'),
  meetsCriteria: z.boolean().describe('Whether this recipe meets the user criteria.'),
});

const SuggestAlternativeRecipesOutputSchema = z.array(SuggestedRecipeSchema);
export type SuggestAlternativeRecipesOutput = z.infer<typeof SuggestAlternativeRecipesOutputSchema>;

const recipeAlignmentTool = ai.defineTool({
  name: 'recipeAlignmentTool',
  description: 'Check if a recipe aligns with the provided dietary restrictions, preferred ingredients, and ingredients to avoid.',
  inputSchema: z.object({
    recipeName: z.string().describe('The name of the recipe to check.'),
    ingredients: z.string().describe('The ingredients of the recipe.'),
    dietaryRestrictions: z.string().describe('The dietary restrictions of the user.'),
    preferredIngredient: z.string().optional().describe('The preferred ingredient to use up.'),
    avoidedIngredient: z.string().optional().describe('The ingredient to avoid.'),
  }),
  outputSchema: z.object({
    meetsCriteria: z.boolean().describe('Whether the recipe meets the specified criteria.'),
    reason: z.string().describe('The reason why the recipe meets or does not meet the criteria.'),
  }),
},
async (input) => {
  // Placeholder implementation; replace with actual logic to check recipe alignment
  // based on dietary restrictions, preferred ingredients, and avoided ingredients.
  // This tool should analyze the recipe and return whether it meets the criteria.
  return {
    meetsCriteria: true, // Replace with actual logic
    reason: 'This recipe aligns with the specified criteria.', // Replace with actual logic
  };
});

export async function suggestAlternativeRecipes(input: SuggestAlternativeRecipesInput): Promise<SuggestAlternativeRecipesOutput> {
  return suggestAlternativeRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeRecipesPrompt',
  input: {schema: SuggestAlternativeRecipesInputSchema},
  output: {schema: SuggestAlternativeRecipesOutputSchema},
  tools: [recipeAlignmentTool],
  prompt: `You are a recipe suggestion expert. Given a recipe, dietary restrictions, and ingredient preferences, you will suggest alternative recipes that meet the user's needs.

Original Recipe Name: {{{recipeName}}}
Original Ingredients: {{{ingredients}}}
Dietary Restrictions: {{{dietaryRestrictions}}}
Preferred Ingredient (if any): {{{preferredIngredient}}}
Avoided Ingredient (if any): {{{avoidedIngredient}}}

Suggest at least three alternative recipes, considering the user's dietary restrictions and ingredient preferences. For each suggested recipe, use the recipeAlignmentTool to determine if it meets the user's criteria.  Make sure the meetsCriteria output field is set appropriately.

Format your response as a JSON array of recipes, including the recipe name, ingredients, and a brief reason for the suggestion. Make sure that the ingredients field is populated, and that the response is valid JSON.

Example:
[
  {
    "name": "Alternative Recipe 1",
    "ingredients": "List of ingredients",
    "reason": "Why this recipe is suggested",
    "meetsCriteria": true
  },
  {
    "name": "Alternative Recipe 2",
    "ingredients": "List of ingredients",
    "reason": "Why this recipe is suggested",
    "meetsCriteria": false
  }
]
`,
});

const suggestAlternativeRecipesFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeRecipesFlow',
    inputSchema: SuggestAlternativeRecipesInputSchema,
    outputSchema: SuggestAlternativeRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
