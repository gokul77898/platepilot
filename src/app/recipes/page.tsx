import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Recipe } from '@/types';
import Link from 'next/link';
import { PlusCircle, Edit3, Trash2, Eye, Soup, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

// Mock data for Recipes
const mockRecipes: Recipe[] = [
  {
    id: 'r1',
    name: 'Classic Spaghetti Bolognese',
    description: 'A rich and hearty Italian classic, perfect for a family dinner.',
    ingredients: [
      { name: 'Spaghetti', quantity: '400g' },
      { name: 'Minced Beef', quantity: '500g' },
      { name: 'Tomato Passata', quantity: '700g' },
    ],
    instructions: ['Cook spaghetti.', 'Brown minced beef.', 'Add passata and simmer.', 'Serve hot.'],
    prepTime: '20 mins',
    cookTime: '1 hour',
    servings: 4,
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Italian', 'Pasta', 'Family Favorite'],
    nutritionalInfo: { calories: 600, protein: 30, carbs: 70, fat: 20 }
  },
  {
    id: 'r2',
    name: 'Avocado Toast with Egg',
    description: 'A quick and nutritious breakfast or light lunch option.',
    ingredients: [
      { name: 'Sourdough Bread', quantity: '2 slices' },
      { name: 'Avocado', quantity: '1' },
      { name: 'Eggs', quantity: '2' },
    ],
    instructions: ['Toast bread.', 'Mash avocado.', 'Fry eggs.', 'Assemble and season.'],
    prepTime: '5 mins',
    cookTime: '10 mins',
    servings: 1,
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Breakfast', 'Quick', 'Healthy'],
    nutritionalInfo: { calories: 400, protein: 20, carbs: 30, fat: 25 }
  },
   {
    id: 'r3',
    name: 'Chicken Stir-fry',
    description: 'A flavorful and customizable stir-fry with chicken and vegetables.',
    ingredients: [
      { name: 'Chicken Breast', quantity: '300g' },
      { name: 'Broccoli', quantity: '1 head' },
      { name: 'Soy Sauce', quantity: '3 tbsp' },
    ],
    instructions: ['Slice chicken.', 'Chop vegetables.', 'Stir-fry chicken.', 'Add vegetables and sauce.'],
    prepTime: '15 mins',
    cookTime: '15 mins',
    servings: 2,
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Asian', 'Quick', 'Dinner'],
    nutritionalInfo: { calories: 450, protein: 40, carbs: 20, fat: 20 }
  },
];


export default function RecipesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Recipes"
        description="Browse, add, and manage your collection of delicious recipes."
        actions={
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/recipes/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Recipe
            </Link>
          </Button>
        }
      />

      {mockRecipes.length === 0 ? (
         <Card>
          <CardContent className="p-6 text-center">
            <Soup className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No Recipes Yet</h3>
            <p className="mt-1 text-muted-foreground">Start by adding your first recipe.</p>
            <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
              <Link href="/recipes/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Recipe
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRecipes.map((recipe) => (
            <Card key={recipe.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              {recipe.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image src={recipe.imageUrl} alt={recipe.name} layout="fill" objectFit="cover" data-ai-hint={`${recipe.tags ? recipe.tags[0] : ''} food`} />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="font-headline text-2xl">{recipe.name}</CardTitle>
                {recipe.description && <CardDescription className="pt-1 h-12 overflow-hidden text-ellipsis">{recipe.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <span className="flex items-center gap-1"><Clock size={16} /> {recipe.prepTime} Prep</span>
                  <span className="flex items-center gap-1"><Clock size={16} /> {recipe.cookTime} Cook</span>
                  <span className="flex items-center gap-1"><Users size={16} /> {recipe.servings} Servings</span>
                </div>
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex w-full justify-between items-center">
                   <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
                    <Link href={`/recipes/${recipe.id}`}>
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild title="Edit Recipe">
                      <Link href={`/recipes/edit/${recipe.id}`}>
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="destructive" size="icon" title="Delete Recipe">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
