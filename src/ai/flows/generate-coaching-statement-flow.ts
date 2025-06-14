
'use server';
/**
 * @fileOverview Generates a personalized coaching statement or tip based on user goals, preferences, and challenges.
 *
 * - generateCoachingStatement - Function to get a coaching statement/tip.
 * - GenerateCoachingStatementInput - Input type (user's goals, preferences, challenges, allergies, notes).
 * - GenerateCoachingStatementOutput - Output type (the AI's statement/tip).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoachingStatementInputSchema = z.object({
  primaryGoal: z.string().describe("The user's main health or diet goal (e.g., 'lose weight', 'eat healthier', 'build muscle')."),
  dietaryPreferences: z.string().describe("Specific dietary preferences or restrictions from the user (e.g., 'vegetarian', 'low-carb', 'needs quick meals'). This field was previously 'dietaryPreferences' and can contain general notes."),
  challenges: z.string().describe("Key challenges the user faces regarding their health and diet (e.g., 'late-night snacking', 'finding time to cook', 'staying motivated')."),
  allergies: z.string().optional().describe("A comma-separated list of known allergies the user has (e.g., 'peanuts, shellfish, dairy')."),
  generalDietaryNotes: z.string().optional().describe("Other general dietary notes or the name of a specific diet the user follows (e.g., 'vegan', 'paleo', 'prefers spicy food', 'avoids red meat')."),
});
export type GenerateCoachingStatementInput = z.infer<typeof GenerateCoachingStatementInputSchema>;

const GenerateCoachingStatementOutputSchema = z.object({
  statement: z.string().describe("A brief (2-3 sentences), encouraging, insightful, and actionable coaching statement or tip tailored to the user's input, including their goals, preferences, challenges, allergies, and general dietary notes."),
});
export type GenerateCoachingStatementOutput = z.infer<typeof GenerateCoachingStatementOutputSchema>;

export async function generateCoachingStatement(input: GenerateCoachingStatementInput): Promise<GenerateCoachingStatementOutput> {
  return generateCoachingStatementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoachingStatementPrompt',
  input: {schema: GenerateCoachingStatementInputSchema},
  output: {schema: GenerateCoachingStatementOutputSchema},
  prompt: `You are PlatePilot AI, a supportive and insightful health coach.
A user has shared their health profile. Based on this, provide a concise (2-3 sentences), personalized coaching tip.
Your tip should:
1. Be directly relevant to their stated '{{{primaryGoal}}}', '{{{dietaryPreferences}}}', '{{{challenges}}}'{{#if allergies}}, taking into account their allergies: '{{{allergies}}}'{{/if}}{{#if generalDietaryNotes}} and their general dietary notes: '{{{generalDietaryNotes}}}'{{/if}}.
2. Offer specific, actionable advice or an insightful perspective. Avoid generic statements and aim for practical takeaways.
3. Maintain an encouraging and empathetic tone.
4. If this is a subsequent tip for the user (they clicked "Get Fresh Coaching Tip"), try to offer a fresh or unique angle if possible, building on their profile.

User's Primary Goal: {{{primaryGoal}}}
User's Dietary Preferences/Restrictions: {{{dietaryPreferences}}}
User's Challenges: {{{challenges}}}
{{#if allergies}}User's Allergies: {{{allergies}}}{{/if}}
{{#if generalDietaryNotes}}User's General Dietary Notes: {{{generalDietaryNotes}}}{{/if}}

Your personalized coaching tip:`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE', 
      },
    ],
  },
});

const generateCoachingStatementFlow = ai.defineFlow(
  {
    name: 'generateCoachingStatementFlow',
    inputSchema: GenerateCoachingStatementInputSchema,
    outputSchema: GenerateCoachingStatementOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      return { statement: "I'm ready to help you on your journey! To give you the best advice, tell me a bit more about your goals and what you find challenging. Consider one small positive change you can make today." };
    }
    return output;
  }
);
