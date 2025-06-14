
"use server";

import { chatWithBot, type ChatbotInput, type ChatbotOutput } from "@/ai/flows/chatbot-flow";

export async function getChatbotResponse(
  input: ChatbotInput
): Promise<ChatbotOutput | { error: string }> {
  try {
    const response = await chatWithBot(input);
    return response;
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { error: `Failed to get chatbot response: ${errorMessage}` };
  }
}
