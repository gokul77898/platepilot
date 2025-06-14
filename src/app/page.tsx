import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Utensils, ListChecks, CalendarDays, PlusCircle, Lightbulb } from 'lucide-react';
import Image from 'next/image';

// Mock data for demonstration
const upcomingMeals = [
  { id: '1', name: 'Chicken Salad', time: 'Today, Lunch', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'chicken salad' },
  { id: '2', name: 'Spaghetti Bolognese', time: 'Tomorrow, Dinner', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'spaghetti bolognese' },
  { id: '3', name: 'Oatmeal with Berries', time: 'Monday, Breakfast', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'oatmeal berries' },
];

const shoppingListSummary = {
  itemsDue: 5,
  categories: [
    { name: 'Vegetables', count: 2 },
    { name: 'Dairy', count: 1 },
    { name: 'Meat', count: 1 },
    { name: 'Pantry', count: 1 },
  ]
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome to PlatePilot!"
        description="Your personalized dashboard for meal planning and smart eating."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="text-primary" />
              Upcoming Meals
            </CardTitle>
            <CardDescription>A quick look at your planned meals.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMeals.length > 0 ? (
              <ul className="space-y-4">
                {upcomingMeals.map((meal) => (
                  <li key={meal.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Image src={meal.imageUrl} alt={meal.name} width={60} height={60} className="rounded-md" data-ai-hint={meal.dataAiHint} />
                    <div>
                      <h3 className="font-semibold">{meal.name}</h3>
                      <p className="text-sm text-muted-foreground">{meal.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No upcoming meals planned. <Link href="/meal-plans" className="text-primary hover:underline">Plan now!</Link></p>
            )}
            <Button asChild variant="outline" className="mt-4 w-full md:w-auto">
              <Link href="/meal-plans">View Full Meal Plan</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="text-primary" />
              Shopping List Summary
            </CardTitle>
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
            <Button asChild variant="default" className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/shopping-list">Go to Shopping List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="text-primary" />
            Quick Actions
          </CardTitle>
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
