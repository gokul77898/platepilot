
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, ListChecks, CalendarDays, PlusCircle, Lightbulb, Loader2 } from 'lucide-react';
import type { MealPlan, Recipe, ShoppingListItem } from '@/types';
import { loadFromLocalStorage } from '@/lib/localStorage';
import { format, parseISO, isFuture, isToday, differenceInDays, addDays } from 'date-fns';

const MEAL_PLANS_STORAGE_KEY = 'mealPlans';
const RECIPES_STORAGE_KEY = 'recipes';
const SHOPPING_LIST_STORAGE_KEY = 'shoppingList';

interface UpcomingMeal {
  id: string;
  name: string;
  time: string;
  imageUrl?: string;
  dataAiHint?: string;
  recipeId: string;
  mealPlanId: string;
}

export default function DashboardPage() {
  const [upcomingMeals, setUpcomingMeals] = useState<UpcomingMeal[]>([]);
  const [shoppingListSummary, setShoppingListSummary] = useState<{ itemsDue: number; categories: { name: string; count: number }[] }>({ itemsDue: 0, categories: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    const storedMealPlans = loadFromLocalStorage<MealPlan[]>(MEAL_PLANS_STORAGE_KEY, []);
    const storedRecipes = loadFromLocalStorage<Recipe[]>(RECIPES_STORAGE_KEY, []);
    const storedShoppingList = loadFromLocalStorage<ShoppingListItem[]>(SHOPPING_LIST_STORAGE_KEY, []);

    // Process upcoming meals
    const today = new Date();
    today.setHours(0,0,0,0); // normalize today to start of day
    const nextThreeDaysMeals: UpcomingMeal[] = [];

    storedMealPlans.forEach(plan => {
      const planStartDate = parseISO(plan.weekStartDate);
      plan.meals.forEach(meal => {
        let mealDate: Date | null = null;
        const dayOffset = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(meal.dayOfWeek);
        if (dayOffset !== -1) {
            mealDate = addDays(planStartDate, dayOffset);
        }

        if (mealDate && (isToday(mealDate) || (isFuture(mealDate) && differenceInDays(mealDate, today) <= 2))) {
          const recipe = storedRecipes.find(r => r.id === meal.recipeId);
          if (recipe) {
            let timeString = format(mealDate, 'EEEE, MMM d');
            if (isToday(mealDate)) timeString = `Today, ${meal.mealType}`;
            else if (differenceInDays(mealDate, today) === 1) timeString = `Tomorrow, ${meal.mealType}`;
            else timeString = `${format(mealDate, 'EEEE')}, ${meal.mealType}`;
            
            nextThreeDaysMeals.push({
              id: `${plan.id}-${meal.id}`,
              name: recipe.name,
              time: timeString,
              imageUrl: recipe.imageUrl || 'https://placehold.co/100x100.png',
              dataAiHint: recipe.tags && recipe.tags.length > 0 ? recipe.tags[0] : 'food',
              recipeId: recipe.id,
              mealPlanId: plan.id,
            });
          }
        }
      });
    });
    
    // Sort meals chronologically and by typical meal type order
    const mealTypeOrder: Record<string, number> = { 'breakfast': 1, 'lunch': 2, 'dinner': 3, 'snack': 4 };
    nextThreeDaysMeals.sort((a, b) => {
        const dateA = parseISO(a.time.split(', ')[0] === 'Today' ? format(today, 'yyyy-MM-dd') : a.time.split(', ')[0] === 'Tomorrow' ? format(addDays(today,1), 'yyyy-MM-dd') : a.time.split(', ')[0] ); // This is not robust for actual date sorting
        const dateB = parseISO(b.time.split(', ')[0] === 'Today' ? format(today, 'yyyy-MM-dd') : b.time.split(', ')[0] === 'Tomorrow' ? format(addDays(today,1), 'yyyy-MM-dd') : b.time.split(', ')[0] );
        if(dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();
        
        const typeA = a.time.split(', ')[1]?.toLowerCase() || '';
        const typeB = b.time.split(', ')[1]?.toLowerCase() || '';
        return (mealTypeOrder[typeA] || 5) - (mealTypeOrder[typeB] || 5);
    });

    setUpcomingMeals(nextThreeDaysMeals.slice(0, 5)); // Show top 5 upcoming

    // Process shopping list summary
    const activeShoppingItems = storedShoppingList.filter(item => !item.isBought);
    // For simplicity, categories won't be dynamically generated here from items yet.
    // This could be enhanced later if PantryItems have categories.
    setShoppingListSummary({
      itemsDue: activeShoppingItems.length,
      categories: [ // Static categories for now
        { name: 'Total Items', count: activeShoppingItems.length },
      ]
    });

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome to PlatePilot!"
        description="Your personalized dashboard for meal planning and smart eating."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="text-primary" />Upcoming Meals</CardTitle>
            <CardDescription>A quick look at your planned meals for the next few days.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMeals.length > 0 ? (
              <ul className="space-y-4">
                {upcomingMeals.map((meal) => (
                  <li key={meal.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Image src={meal.imageUrl!} alt={meal.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={meal.dataAiHint} />
                    <div>
                      <h3 className="font-semibold">{meal.name}</h3>
                      <p className="text-sm text-muted-foreground">{meal.time}</p>
                       <Link href={`/recipes/${meal.recipeId}`} className="text-xs text-primary hover:underline">View Recipe</Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No upcoming meals planned for the next 3 days. <Link href="/meal-plans/new" className="text-primary hover:underline">Plan now!</Link></p>
            )}
            <Button asChild variant="outline" className="mt-4 w-full md:w-auto">
              <Link href="/meal-plans">View All Meal Plans</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks className="text-primary" />Shopping List Summary</CardTitle>
            <CardDescription>Overview of your pending grocery items.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{shoppingListSummary.itemsDue} <span className="text-base font-normal text-muted-foreground">items to buy</span></p>
            <ul className="mt-3 space-y-1 text-sm">
              {shoppingListSummary.categories.map(cat => (
                <li key={cat.name} className="flex justify-between">
                  <span>{cat.name}</span>
                  <span className="font-medium">{cat.count}</span>
                </li>
              ))}
            </ul>
            {shoppingListSummary.itemsDue === 0 && <p className="text-sm text-muted-foreground mt-2">Your shopping list is all clear!</p>}
            <Button asChild variant="default" className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/shopping-list">Go to Shopping List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Utensils className="text-primary" />Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button asChild size="lg" variant="outline" className="flex flex-col h-auto py-4 items-center justify-center gap-2">
            <Link href="/meal-plans/new">
              <CalendarDays className="w-8 h-8 text-primary" />
              <span className="text-base">Create New Meal Plan</span>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex flex-col h-auto py-4 items-center justify-center gap-2">
            <Link href="/recipes/new">
              <PlusCircle className="w-8 h-8 text-primary" />
              <span className="text-base">Add New Recipe</span>
            </Link>
          </Button>
           <Button asChild size="lg" variant="outline" className="flex flex-col h-auto py-4 items-center justify-center gap-2">
            <Link href="/smart-suggestions">
              <Lightbulb className="w-8 h-8 text-primary" />
              <span className="text-base">Get Smart Suggestions</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
