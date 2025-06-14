
'use server';
/**
 * @fileOverview Generates a personalized coaching statement based on user goals.
 *
 * - generateCoachingStatement - Function to get a coaching statement.
 * - GenerateCoachingStatementInput - Input type (user's goals).
 * - GenerateCoachingStatementOutput - Output type (the AI's statement).
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
  statement: z.string().describe("A brief (2-3 sentences), encouraging, and actionable introductory coaching statement tailored to the user's input."),
});
export type GenerateCoachingStatementOutput = z.infer<typeof GenerateCoachingStatementOutputSchema>;

export async function generateCoachingStatement(input: GenerateCoachingStatementInput): Promise<GenerateCoachingStatementOutput> {
  return generateCoachingStatementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoachingStatementPrompt',
  input: {schema: GenerateCoachingStatementInputSchema},
  output: {schema: GenerateCoachingStatementOutputSchema},
  prompt: `You are PlatePilot AI, a friendly, encouraging, and insightful health coach.
A user has shared their goals and challenges with you. Your task is to provide a brief (2-3 sentences max) introductory coaching statement.
This statement should:
1. Acknowledge their primary goal.
2. Briefly touch upon their preferences or challenges in an empathetic way.
3. Offer a piece of general, actionable advice or encouragement related to their input.
4. Maintain a positive and supportive tone.

User's Primary Goal: {{{primaryGoal}}}
User's Dietary Preferences/Notes: {{{dietaryPreferences}}}
User's Challenges: {{{challenges}}}

Your coaching statement:`,
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
      return { statement: "I'm ready to help you on your journey! Let's work together to achieve your goals." };
    }
    return output;
  }
);
