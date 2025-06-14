
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
import type { Recipe } from '@/types';
import { PlusCircle, Edit3, Trash2, Eye, Soup, Clock, Users, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { loadFromLocalStorage, saveToLocalStorage, generateId } from '@/lib/localStorage';
import { useToast } from "@/hooks/use-toast";

const RECIPES_STORAGE_KEY = 'recipes';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecipes = useCallback(() => {
    setIsLoading(true);
    const storedRecipes = loadFromLocalStorage<Recipe[]>(RECIPES_STORAGE_KEY, []);
    setRecipes(storedRecipes);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleDeleteRecipe = (recipeId: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    saveToLocalStorage(RECIPES_STORAGE_KEY, updatedRecipes);
    setRecipes(updatedRecipes);
    toast({
      title: "Recipe Deleted",
      description: "The recipe has been removed from your collection.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading recipes...</p>
      </div>
    );
  }

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

      {recipes.length === 0 ? (
         <Card>
          <CardContent className="p-6 text-center">
            <Soup className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No Recipes Yet</h3>
            <p className="mt-1 text-muted-foreground">Start by adding your first recipe to your collection.</p>
            <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
              <Link href="/recipes/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Recipe
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              {recipe.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image 
                    src={recipe.imageUrl || "https://placehold.co/600x400.png"} 
                    alt={recipe.name} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={`${recipe.tags && recipe.tags.length > 0 ? recipe.tags[0] : 'food'}`} 
                  />
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
                  <div className="flex flex-wrap gap-1 mt-2">
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Delete Recipe">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the recipe "{recipe.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRecipe(recipe.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
