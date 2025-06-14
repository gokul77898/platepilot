
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-alternative-recipes.ts';
import '@/ai/flows/suggest-recipes-given-constraints.ts';
import '@/ai/flows/analyze-meal-image-flow.ts';
import '@/ai/flows/suggest-meals-with-calories-flow.ts';
import '@/ai/flows/chatbot-flow.ts';
import '@/ai/flows/generate-coaching-statement-flow.ts';
import '@/ai/flows/analyze-recipe-nutrition-flow.ts';
import '@/ai/flows/adapt-recipe-flow.ts'; // Added new recipe adaptation flow

