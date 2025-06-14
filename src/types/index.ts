

export interface Ingredient {
  id: string; // Added ID for potential key prop usage if ingredients become more dynamic
  name: string;
  quantity: string;
  unit?: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: Ingredient[]; // Changed from string to Ingredient[] for better structure
  instructions: string[]; // Changed from string to string[]
  prepTime: string; 
  cookTime: string; 
  servings: number;
  nutritionalInfo?: NutritionalInfo;
  imageUrl?: string;
  tags?: string[]; // Changed from string to string[]
  createdAt?: string;
  updatedAt?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string; 
  recipeId: string; 
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  mealType: MealType;
  // Optional: Store recipe name directly for quicker display, but recipeId is canonical
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
  name: string; // Simplified from ingredientName
  quantity: string;
  unit?: string;
  // recipeNames might be complex to maintain dynamically without a backend,
  // For localStorage, keeping it simple or deriving it on the fly if needed.
  // For now, let's remove recipeNames to simplify localStorage version.
  // recipeNames?: string[]; 
  isBought: boolean;
  notes?: string;
  createdAt?: string;
}

// For AI recipe suggestions
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
