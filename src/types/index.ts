
export interface Ingredient {
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
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string; // e.g., "30 minutes"
  cookTime: string; // e.g., "1 hour"
  servings: number;
  nutritionalInfo?: NutritionalInfo;
  imageUrl?: string;
  tags?: string[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string; // Could be auto-generated or based on index
  recipeId: string; // User will input this, ideally from a recipe selector later
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  mealType: MealType;
  // Optional: Add recipeName if you want to store it directly, though recipeId is for lookup
  // recipeName?: string; 
}

export interface MealPlan {
  id: string;
  name: string;
  weekStartDate: string; // ISO date string, e.g., "2024-07-29"
  meals: Meal[];
  description?: string;
}

export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  quantity: string;
  unit?: string;
  recipeNames: string[];
  isBought: boolean;
}

// For AI recipe suggestions
export interface SuggestedRecipe {
  name: string;
  ingredients: string; // This is a string as per AI flow output
  reason: string;
  meetsCriteria: boolean;
}

// For AI "What's for Dinner" suggestions
export interface RecipeIdea {
  name: string;
}


// Pantry Management
export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  expiryDate?: string; // ISO date string
  category?: string; // e.g., Dairy, Produce, Pantry Staples
}
