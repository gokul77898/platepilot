
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { MealPlan, Recipe } from '@/types'; // Added Recipe type
import Link from 'next/link';
import { PlusCircle, Edit3, Trash2, CalendarDays, Lightbulb, Utensils } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

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
      { id: 'm3', recipeId: 'r3', dayOfWeek: 'Tuesday', mealType: 'dinner' },
    ],
  },
  {
    id: 'mp2',
    name: 'Protein Power Plan',
    weekStartDate: '2024-08-05',
    description: 'Focus on high-protein meals for muscle building and satiety.',
    meals: [
      { id: 'm3', recipeId: 'r3', dayOfWeek: 'Tuesday', mealType: 'dinner' },
      { id: 'm1', recipeId: 'r1', dayOfWeek: 'Wednesday', mealType: 'breakfast'},
    ],
  },
];

// Updated mock recipes with nutritionalInfo for calorie display
const mockRecipes: Record<string, Pick<Recipe, 'name' | 'imageUrl' | 'nutritionalInfo' | 'tags'>> = {
  r1: { 
    name: "Oatmeal with Berries", 
    imageUrl: "https://placehold.co/80x80.png",
    nutritionalInfo: { calories: 300, protein: 10, carbs: 55, fat: 5 },
    tags: ["breakfast", "healthy"]
  },
  r2: { 
    name: "Grilled Chicken Salad", 
    imageUrl: "https://placehold.co/80x80.png",
    nutritionalInfo: { calories: 450, protein: 40, carbs: 20, fat: 25 },
    tags: ["lunch", "low-carb"]
  },
  r3: { 
    name: "Steak and Veggies", 
    imageUrl: "https://placehold.co/80x80.png",
    nutritionalInfo: { calories: 550, protein: 50, carbs: 30, fat: 28 },
    tags: ["dinner", "protein"]
  },
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
            <Card key={plan.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  Week of {new Date(plan.weekStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </CardDescription>
                {plan.description && <p className="text-sm text-muted-foreground pt-2">{plan.description}</p>}
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <h4 className="font-medium mb-2 text-sm flex items-center"><Utensils className="mr-2 h-4 w-4 text-primary" />Sample Meals:</h4>
                <ul className="space-y-3">
                  {plan.meals.slice(0, 3).map(meal => { // Show up to 3 sample meals
                    const recipe = mockRecipes[meal.recipeId as keyof typeof mockRecipes];
                    if (!recipe) return <li key={meal.id} className="text-sm text-red-500">Recipe not found</li>;
                    
                    const dataAiHint = recipe.tags ? recipe.tags.join(" ") : "food";

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
              <CardFooter className="border-t pt-4 mt-auto"> {/* Use CardFooter for consistent padding and border */}
                <div className="flex justify-end gap-2 w-full">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/meal-plans/edit/${plan.id}`}>
                      <Edit3 className="mr-1 h-3 w-3" /> Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
