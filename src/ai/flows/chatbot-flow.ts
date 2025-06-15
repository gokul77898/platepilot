
'use server';
/**
 * @fileOverview A general knowledge chatbot focused on health, diet, and food management.
 *
 * - chatWithBot - A function to get a response from the chatbot.
 * - ChatbotInput - The input type for the chatWithBot function.
 * - ChatbotOutput - The return type for the chatWithBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotInputSchema = z.object({
  userQuery: z.string().describe("The user's question or message to the chatbot."),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  aiResponse: z.string().describe("The chatbot's response to the user query."),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function chatWithBot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatbotInputSchema},
  output: {schema: ChatbotOutputSchema},
  prompt: `You are PlatePilot AI, a friendly and knowledgeable assistant specializing in health, diet, and food management.
Answer the user's questions clearly and concisely. If a question is outside your expertise, politely state that you cannot answer it.
Provide helpful and actionable information where possible.

User's query: {{{userQuery}}}

Your response:`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT', // Adjust safety for health advice
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      }
    ],
  }
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Throw an error if the model doesn't return an output
      throw new Error("The AI model did not return a valid response for the chatbot query.");
    }
    return output;
  }
);
