
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { MealPlan, Recipe } from '@/types';
import { PlusCircle, Edit3, Trash2, CalendarDays, Lightbulb, Utensils, Loader2 } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage } from '@/lib/localStorage';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';


const MEAL_PLANS_STORAGE_KEY = 'mealPlans';
const RECIPES_STORAGE_KEY = 'recipes';

export default function MealPlansPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(() => {
    setIsLoading(true);
    const storedMealPlans = loadFromLocalStorage<MealPlan[]>(MEAL_PLANS_STORAGE_KEY, []);
    const storedRecipes = loadFromLocalStorage<Recipe[]>(RECIPES_STORAGE_KEY, []);
    
    const recipesMap: Record<string, Recipe> = {};
    storedRecipes.forEach(recipe => {
      recipesMap[recipe.id] = recipe;
    });

    setMealPlans(storedMealPlans);
    setRecipes(recipesMap);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteMealPlan = (planId: string) => {
    const updatedMealPlans = mealPlans.filter(plan => plan.id !== planId);
    saveToLocalStorage(MEAL_PLANS_STORAGE_KEY, updatedMealPlans);
    setMealPlans(updatedMealPlans);
    toast({
      title: "Meal Plan Deleted",
      description: "The meal plan has been removed.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading meal plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Meal Plans"
        description="Create, view, and manage your weekly meal plans."
        actions={
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/meal-plans/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Plan
            </Link>
          </Button>
        }
      />

      {mealPlans.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No Meal Plans Yet</h3>
            <p className="mt-1 text-muted-foreground">Start by creating your first meal plan.</p>
            <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
              <Link href="/meal-plans/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  Week of {format(parseISO(plan.weekStartDate), 'PPP')}
                </CardDescription>
                {plan.description && <p className="text-sm text-muted-foreground pt-2">{plan.description}</p>}
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <h4 className="font-medium mb-2 text-sm flex items-center"><Utensils className="mr-2 h-4 w-4 text-primary" />Sample Meals:</h4>
                <ul className="space-y-3">
                  {plan.meals.slice(0, 3).map(meal => {
                    const recipe = recipes[meal.recipeId];
                    if (!recipe) return <li key={meal.id} className="text-sm text-red-500">Recipe (ID: {meal.recipeId}) not found</li>;
                    
                    const dataAiHint = recipe.tags && recipe.tags.length > 0 ? recipe.tags.join(" ") : "food";

                    return (
                      <li key={meal.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-muted">
                        {recipe.imageUrl && 
                          <Image src={recipe.imageUrl} alt={recipe.name} width={50} height={50} className="rounded-md object-cover" data-ai-hint={dataAiHint} />
                        }
                        <div className="flex-1">
                           <span className="block text-sm font-semibold text-primary-foreground/90">{recipe.name}</span>
                           <p className="text-xs text-muted-foreground">{meal.dayOfWeek}, {meal.mealType}</p>
                           {recipe.nutritionalInfo?.calories && (
                             <p className="text-xs text-muted-foreground mt-0.5">Approx. {recipe.nutritionalInfo.calories} calories</p>
                           )}
                           <Link href="/smart-suggestions" className="text-xs text-accent hover:text-accent/80 hover:underline mt-1 inline-flex items-center">
                             <Lightbulb className="mr-1 h-3 w-3" /> Get Ideas
                           </Link>
                        </div>
                      </li>
                    );
                  })}
                  {plan.meals.length > 3 && <li className="text-xs text-muted-foreground p-2 text-center">...and {plan.meals.length - 3} more meals</li>}
                   {plan.meals.length === 0 && <li className="text-xs text-muted-foreground p-2">No meals added to this plan yet.</li>}
                </ul>
              </CardContent>
              <CardFooter className="border-t pt-4 mt-auto">
                <div className="flex justify-end gap-2 w-full">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/meal-plans/edit/${plan.id}`}>
                      <Edit3 className="mr-1 h-3 w-3" /> Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the meal plan "{plan.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteMealPlan(plan.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
