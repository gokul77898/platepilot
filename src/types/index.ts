

export interface Ingredient {
  id: string; 
  name: string;
  quantity: string;
  unit?: string;
}

export interface NutritionalInfo {
  calories?: number; // Made optional as not all recipes might have it initially
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: Ingredient[]; 
  instructions: string[]; 
  prepTime: string; 
  cookTime: string; 
  servings: number;
  nutritionalInfo?: NutritionalInfo;
  imageUrl?: string;
  tags?: string[]; 
  createdAt?: string;
  updatedAt?: string;
  dataAiHint?: string; // Added for dashboard image consistency
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string; 
  recipeId: string; 
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  mealType: MealType;
  recipeName?: string; 
}

export interface MealPlan {
  id: string;
  name: string;
  weekStartDate: string; 
  meals: Meal[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string; 
  quantity: string;
  unit?: string;
  isBought: boolean;
  notes?: string;
  createdAt?: string;
}

// For AI recipe (alternative) suggestions
export interface SuggestedRecipe {
  name: string;
  ingredients: string; 
  reason: string;
  meetsCriteria: boolean;
}

// For AI "What's for Dinner" suggestions
export interface RecipeIdea {
  name: string;
}

// For AI Meal Image Analysis
export interface AnalyzeMealImageInput {
  imageDataUri: string;
}

export interface AnalyzeMealImageOutput {
  identifiedDish: string;
  estimatedCalories: number | null;
  isHealthy: boolean;
  healthinessReason: string;
  consumptionAdvice: string;
}


// Pantry Management
export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  expiryDate?: string; 
  category?: string; 
  notes?: string;
  createdAt?: string;
}

// For AI Meal Suggestion with Calories (Enhanced)
export interface AiMealSuggestionInput {
  mealType?: string;
  dietaryPreferences?: string;
  keywords?: string;
  healthGoals?: string; // Added health goals
}

export interface AiSuggestedIngredient {
  name: string;
  quantity?: string;
  unit?: string;
  estimatedCalories?: number | null;
}

export interface AiMealSuggestion {
  name: string;
  description: string;
  ingredients: AiSuggestedIngredient[];
  estimatedCalories: number | null;
}
export type AiMealSuggestionOutput = AiMealSuggestion[];

// For Chatbot
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
