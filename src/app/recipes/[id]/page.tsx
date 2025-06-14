
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Recipe } from '@/types';
import { loadFromLocalStorage } from '@/lib/localStorage';
import { ArrowLeft, Clock, Users, Edit3, Soup, Leaf, Flame, ShoppingBasket } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

const RECIPES_STORAGE_KEY = 'recipes';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = typeof params.id === 'string' ? params.id : undefined;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecipe = useCallback(() => {
    if (recipeId) {
      setIsLoading(true);
      const storedRecipes = loadFromLocalStorage<Recipe[]>(RECIPES_STORAGE_KEY, []);
      const foundRecipe = storedRecipes.find(r => r.id === recipeId);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      } else {
        // Handle recipe not found, e.g., redirect or show error
        router.push('/recipes'); // Or a 404 page
      }
      setIsLoading(false);
    }
  }, [recipeId, router]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto py-8 text-center">
        <PageHeader title="Recipe Not Found" description="The recipe you are looking for does not exist or has been removed." />
        <Button asChild>
          <Link href="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Recipes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={recipe.name}
        description={recipe.description || "A delicious recipe to try."}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/recipes">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recipes
              </Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href={`/recipes/edit/${recipe.id}`}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Recipe
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {recipe.imageUrl && (
            <Card className="overflow-hidden shadow-lg">
              <div className="relative h-64 md:h-96 w-full">
                <Image 
                  src={recipe.imageUrl || "https://placehold.co/800x600.png"} 
                  alt={recipe.name} 
                  layout="fill" 
                  objectFit="cover"
                  data-ai-hint={`${recipe.tags && recipe.tags.length > 0 ? recipe.tags[0] : 'food meal'}`}
                />
              </div>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShoppingBasket className="text-primary"/>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={ingredient.id || index}>
                    {ingredient.quantity} {ingredient.unit || ''} {ingredient.name}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Flame className="text-primary"/>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Soup className="text-primary"/>Recipe Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Clock size={16} /> Prep Time</span>
                <span className="font-medium">{recipe.prepTime}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Clock size={16} /> Cook Time</span>
                <span className="font-medium">{recipe.cookTime}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Users size={16} /> Servings</span>
                <span className="font-medium">{recipe.servings}</span>
              </div>
              {recipe.tags && recipe.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-1.5 text-sm">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {recipe.nutritionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Leaf className="text-primary"/>Nutritional Info</CardTitle>
                <CardDescription>(per serving)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recipe.nutritionalInfo.calories !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">Calories:</span> <span className="font-medium">{recipe.nutritionalInfo.calories} kcal</span></div>}
                {recipe.nutritionalInfo.protein !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">Protein:</span> <span className="font-medium">{recipe.nutritionalInfo.protein} g</span></div>}
                {recipe.nutritionalInfo.carbs !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">Carbs:</span> <span className="font-medium">{recipe.nutritionalInfo.carbs} g</span></div>}
                {recipe.nutritionalInfo.fat !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">Fat:</span> <span className="font-medium">{recipe.nutritionalInfo.fat} g</span></div>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
