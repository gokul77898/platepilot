

export interface Ingredient {
  id: string; 
  name: string;
  quantity: string;
  unit?: string;
}

export interface NutritionalInfo {
  calories?: number; 
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
  dataAiHint?: string; 
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
  dietaryFlags?: string[]; 
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
  healthGoals?: string; 
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

// For AI Coach - User Profile Goals
export interface UserProfileGoals {
  primaryGoal: string;
  dietaryPreferences: string; // Existing, can be used for general diet notes initially
  challenges: string;
  allergies?: string; // e.g., "peanuts, shellfish, dairy"
  generalDietaryNotes?: string; // e.g., "vegan", "low-carb", "likes spicy food"
}

export interface GenerateCoachingStatementInput extends UserProfileGoals {}

export interface GenerateCoachingStatementOutput {
  statement: string;
}

// For AI Recipe Nutritional Analysis
export interface AnalyzeRecipeNutritionInputIngredient {
    name: string;
    quantity: string;
    unit?: string;
}
export interface AnalyzeRecipeNutritionInput {
    recipeName: string;
    ingredients: AnalyzeRecipeNutritionInputIngredient[];
    servings: number;
}

export type AnalyzeRecipeNutritionOutput = NutritionalInfo; // Output is the same as NutritionalInfo


// For AI Recipe Adaptation Assistant
export interface AdaptRecipeInput {
  originalRecipeNameOrDetails: string;
  adaptationRequest: string;
}

export interface AdaptRecipeOutput {
  adaptedRecipeName: string;
  suggestedModifications: string;
  warningsOrConsiderations?: string;
}
