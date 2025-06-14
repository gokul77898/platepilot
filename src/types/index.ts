
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
  id: string;
  recipeId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  mealType: MealType;
}

export interface MealPlan {
  id: string;
  name: string;
  weekStartDate: string; // ISO date string
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
