import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { MealPlan } from '@/types';
import Link from 'next/link';
import { PlusCircle, Edit3, Trash2, CalendarDays } from 'lucide-react';
import Image from 'next/image';

// Mock data for Meal Plans
const mockMealPlans: MealPlan[] = [
  {
    id: 'mp1',
    name: 'Healthy Kickstart Week',
    weekStartDate: '2024-07-29',
    description: 'A week of balanced and nutritious meals to get you started.',
    meals: [
      { id: 'm1', recipeId: 'r1', dayOfWeek: 'Monday', mealType: 'breakfast' },
      { id: 'm2', recipeId: 'r2', dayOfWeek: 'Monday', mealType: 'lunch' },
    ],
  },
  {
    id: 'mp2',
    name: 'Protein Power Plan',
    weekStartDate: '2024-08-05',
    description: 'Focus on high-protein meals for muscle building and satiety.',
    meals: [
      { id: 'm3', recipeId: 'r3', dayOfWeek: 'Tuesday', mealType: 'dinner' },
    ],
  },
];

// Mock recipes for context
const mockRecipes = {
  r1: { name: "Oatmeal with Berries", imageUrl: "https://placehold.co/80x80.png", dataAiHint: "oatmeal berries" },
  r2: { name: "Grilled Chicken Salad", imageUrl: "https://placehold.co/80x80.png", dataAiHint: "chicken salad" },
  r3: { name: "Steak and Veggies", imageUrl: "https://placehold.co/80x80.png", dataAiHint: "steak vegetables" },
};

export default function MealPlansPage() {
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

      {mockMealPlans.length === 0 ? (
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
          {mockMealPlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  Week of {new Date(plan.weekStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </CardDescription>
                {plan.description && <p className="text-sm text-muted-foreground pt-2">{plan.description}</p>}
              </CardHeader>
              <CardContent className="flex-grow">
                <h4 className="font-medium mb-2 text-sm">Sample Meals:</h4>
                <ul className="space-y-2">
                  {plan.meals.slice(0, 2).map(meal => {
                    const recipe = mockRecipes[meal.recipeId as keyof typeof mockRecipes];
                    return (
                      <li key={meal.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                        {recipe.imageUrl && 
                          <Image src={recipe.imageUrl} alt={recipe.name} width={40} height={40} className="rounded-sm" data-ai-hint={recipe.dataAiHint as string} />
                        }
                        <div>
                           <span className="text-xs font-semibold">{recipe.name}</span>
                           <p className="text-xs text-muted-foreground">{meal.dayOfWeek}, {meal.mealType}</p>
                        </div>
                      </li>
                    );
                  })}
                  {plan.meals.length > 2 && <li className="text-xs text-muted-foreground p-2 text-center">...and {plan.meals.length - 2} more</li>}
                </ul>
              </CardContent>
              <CardContent className="border-t pt-4"> {/* CardFooter equivalent styling */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/meal-plans/edit/${plan.id}`}>
                      <Edit3 className="mr-1 h-3 w-3" /> Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* TODO: Add Meal Plan creation form / drag-drop interface placeholder */}
      {/* For now, linking to a new page for creation */}
      {/* <div className="mt-8 p-6 border rounded-lg">
        <h2 className="text-2xl font-headline mb-4">Meal Plan Creator (Placeholder)</h2>
        <p className="text-muted-foreground">Drag and drop recipes onto the calendar to build your meal plan. This feature is under construction.</p>
      </div> */}
    </div>
  );
}
