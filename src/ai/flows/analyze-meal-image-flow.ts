
'use server';
/**
 * @fileOverview Analyzes a meal image to estimate calories, assess healthiness, and provide consumption advice.
 *
 * - analyzeMealImage - A function that handles the meal image analysis.
 * - AnalyzeMealImageInput - The input type for the analyzeMealImage function.
 * - AnalyzeMealImageOutput - The return type for the analyzeMealImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeMealImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMealImageInput = z.infer<typeof AnalyzeMealImageInputSchema>;

export const AnalyzeMealImageOutputSchema = z.object({
  identifiedDish: z.string().describe("The name of the dish identified in the image, if possible. E.g., 'Spaghetti Carbonara', 'Chicken Salad'."),
  estimatedCalories: z.number().nullable().describe("Estimated calories in the meal. Null if unable to estimate."),
  isHealthy: z.boolean().describe("Whether the meal is generally considered healthy."),
  healthinessReason: z.string().describe("A brief explanation for why the meal is or isn't considered healthy."),
  consumptionAdvice: z.string().describe("General advice on what might be a typical consumption amount for an average adult (e.g., 'This portion seems appropriate for one person', 'Consider sharing or saving some for later if it's a large portion')."),
});
export type AnalyzeMealImageOutput = z.infer<typeof AnalyzeMealImageOutputSchema>;

export async function analyzeMealImage(input: AnalyzeMealImageInput): Promise<AnalyzeMealImageOutput> {
  return analyzeMealImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMealImagePrompt',
  input: {schema: AnalyzeMealImageInputSchema},
  output: {schema: AnalyzeMealImageOutputSchema},
  prompt: `You are a nutritional analysis AI. Based on the provided image of a meal, identify the dish, estimate the total calories, determine if it's generally healthy, provide a brief reason for the healthiness assessment, and offer general advice on a typical consumption amount for an average adult.

Your response MUST be in the specified JSON output format.
If you cannot confidently identify the dish or estimate calories, set estimatedCalories to null and provide your best assessment for other fields.
Focus on common food items and general nutritional principles. This is not medical advice.

Image of the meal: {{media url=imageDataUri}}`,
  config: {
    safetySettings: [ // Adjusted for potentially sensitive topics like health advice, though still general.
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  }
});

const analyzeMealImageFlow = ai.defineFlow(
  {
    name: 'analyzeMealImageFlow',
    inputSchema: AnalyzeMealImageInputSchema,
    outputSchema: AnalyzeMealImageOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI model did not return a valid analysis. Please try again with a clearer image or a different meal.");
    }
    return output;
  }
);
