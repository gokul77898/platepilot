
'use server';
/**
 * @fileOverview Analyzes a meal image to estimate calories, assess healthiness, provide consumption advice, and identify dietary flags.
 *
 * - analyzeMealImage - A function that handles the meal image analysis.
 * - AnalyzeMealImageInput - The input type for the analyzeMealImage function.
 * - AnalyzeMealImageOutput - The return type for the analyzeMealImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMealImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMealImageInput = z.infer<typeof AnalyzeMealImageInputSchema>;

const AnalyzeMealImageOutputSchema = z.object({
  identifiedDish: z.string().describe("The name of the dish identified in the image, if possible. E.g., 'Spaghetti Carbonara', 'Chicken Salad'."),
  estimatedCalories: z.number().nullable().describe("Estimated calories in the meal. Null if unable to estimate."),
  isHealthy: z.boolean().describe("Whether the meal is generally considered healthy."),
  healthinessReason: z.string().describe("A brief explanation for why the meal is or isn't considered healthy."),
  consumptionAdvice: z.string().describe("General advice on what might be a typical consumption amount for an average adult (e.g., 'This portion seems appropriate for one person', 'Consider sharing or saving some for later if it's a large portion')."),
  dietaryFlags: z.array(z.string()).optional().describe("A list of potential dietary flags or attributes observed (e.g., 'Likely contains Gluten', 'Appears Dairy-Free', 'High Sugar', 'Vegetarian-Friendly'). Be cautious and use terms like 'Likely' or 'Potential' if not certain. If no specific flags are confidently identified, this can be an empty array or omitted."),
});
export type AnalyzeMealImageOutput = z.infer<typeof AnalyzeMealImageOutputSchema>;

export async function analyzeMealImage(input: AnalyzeMealImageInput): Promise<AnalyzeMealImageOutput> {
  return analyzeMealImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMealImagePrompt',
  input: {schema: AnalyzeMealImageInputSchema},
  output: {schema: AnalyzeMealImageOutputSchema},
  prompt: `You are a nutritional analysis AI. Based on the provided image of a meal:
1. Identify the dish.
2. Estimate the total calories.
3. Determine if it's generally healthy.
4. Provide a brief reason for the healthiness assessment.
5. Offer general advice on a typical consumption amount for an average adult.
6. List any common dietary flags or attributes you can reasonably infer (e.g., 'Likely contains Gluten', 'Appears Dairy-Free', 'High Sugar', 'Good source of protein', 'Vegetarian option'). Preface flags with 'Potential:' or 'Likely:' where appropriate. If unsure about specific flags, do not list them or return an empty array for dietaryFlags.

Your response MUST be in the specified JSON output format.
If you cannot confidently identify the dish or estimate calories, set estimatedCalories to null and provide your best assessment for other fields.
Focus on common food items and general nutritional principles. This is not medical advice.

Image of the meal: {{media url=imageDataUri}}`,
  config: {
    safetySettings: [ 
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

