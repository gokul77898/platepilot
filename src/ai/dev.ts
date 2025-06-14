import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-alternative-recipes.ts';
import '@/ai/flows/suggest-recipes-given-constraints.ts';