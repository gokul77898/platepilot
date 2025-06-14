
'use server';
/**
 * @fileOverview Generates a personalized coaching statement or tip based on user goals.
 *
 * - generateCoachingStatement - Function to get a coaching statement/tip.
 * - GenerateCoachingStatementInput - Input type (user's goals).
 * - GenerateCoachingStatementOutput - Output type (the AI's statement/tip).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoachingStatementInputSchema = z.object({
  primaryGoal: z.string().describe("The user's main health or diet goal (e.g., 'lose weight', 'eat healthier', 'build muscle')."),
  dietaryPreferences: z.string().describe("Specific dietary preferences, restrictions, or notes from the user (e.g., 'vegetarian', 'low-carb', 'needs quick meals')."),
  challenges: z.string().describe("Key challenges the user faces regarding their health and diet (e.g., 'late-night snacking', 'finding time to cook', 'staying motivated')."),
});
export type GenerateCoachingStatementInput = z.infer<typeof GenerateCoachingStatementInputSchema>;

const GenerateCoachingStatementOutputSchema = z.object({
  statement: z.string().describe("A brief (2-3 sentences), encouraging, insightful, and actionable coaching statement or tip tailored to the user's input."),
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
A user has shared their health goals, dietary notes, and challenges.
Based on this, provide a concise (2-3 sentences), personalized coaching tip.
Your tip should:
1. Be directly relevant to their stated '{{{primaryGoal}}}', '{{{dietaryPreferences}}}', or '{{{challenges}}}'.
2. Offer specific, actionable advice or an insightful perspective. Avoid generic statements and aim for practical takeaways.
3. Maintain an encouraging and empathetic tone.
4. If this is a subsequent tip for the user, try to offer a fresh or unique angle if possible.

User's Primary Goal: {{{primaryGoal}}}
User's Dietary Preferences/Notes: {{{dietaryPreferences}}}
User's Challenges: {{{challenges}}}

Your personalized coaching tip:`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE', // For health-related advice
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
      return { statement: "I'm ready to help you on your journey! Let's work together to achieve your goals. Consider one small positive change you can make today." };
    }
    return output;
  }
);

