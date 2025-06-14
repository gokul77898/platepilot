
"use server";

import { 
    generateCoachingStatement, 
    type GenerateCoachingStatementInput, 
    type GenerateCoachingStatementOutput 
} from "@/ai/flows/generate-coaching-statement-flow";

export async function getAiCoachingStatement(
  input: GenerateCoachingStatementInput
): Promise<GenerateCoachingStatementOutput | { error: string }> {
  try {
    const response = await generateCoachingStatement(input);
    return response;
  } catch (error)
 {
    console.error("Error fetching AI coaching statement:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { error: `Failed to get coaching statement: ${errorMessage}` };
  }
}
