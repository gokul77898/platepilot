
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-alternative-recipes.ts';
import '@/ai/flows/suggest-recipes-given-constraints.ts';
import '@/ai/flows/analyze-meal-image-flow.ts';
import '@/ai/flows/suggest-meals-with-calories-flow.ts'; // Added new flow
