
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler as OriginalSubmitHandler } from 'react-hook-form'; // Renamed SubmitHandler to avoid conflict
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getSmartRecipeSuggestions, getRecipeIdeasFromConstraints } from '@/app/smart-suggestions/actions';
import type { SuggestedRecipe, RecipeIdea } from '@/types';
import { Loader2, Lightbulb, CheckCircle, XCircle, ChefHat } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

// Schema for Alternative Recipe Suggestions
const alternativeSuggestionFormSchema = z.object({
  recipeName: z.string().min(1, "Recipe name is required"),
  ingredients: z.string().min(1, "Please list some ingredients"),
  dietaryRestrictions: z.string().optional(),
  preferredIngredient: z.string().optional(),
  avoidedIngredient: z.string().optional(),
});
type AlternativeSuggestionFormValues = z.infer<typeof alternativeSuggestionFormSchema>;

// Schema for "What's for Dinner?" (Recipe Ideas from Constraints)
const recipeIdeasFormSchema = z.object({
  availableIngredients: z.string().min(1, "List ingredients you have."),
  ingredientsToAvoid: z.string().optional(),
  otherPreferences: z.string().optional(),
});
type RecipeIdeasFormValues = z.infer<typeof recipeIdeasFormSchema>;

// Use a more specific name for SubmitHandler if there's a global one
type SubmitHandler<T> = OriginalSubmitHandler<T>;


export default function SuggestionClientPage() {
  const [alternativeSuggestions, setAlternativeSuggestions] = useState<SuggestedRecipe[]>([]);
  const [recipeIdeas, setRecipeIdeas] = useState<RecipeIdea[]>([]);
  const [isAlternativeLoading, setIsAlternativeLoading] = useState(false);
  const [isRecipeIdeasLoading, setIsRecipeIdeasLoading] = useState(false);
  const { toast } = useToast();

  const alternativeForm = useForm<AlternativeSuggestionFormValues>({
    resolver: zodResolver(alternativeSuggestionFormSchema),
    defaultValues: {
      recipeName: "",
      ingredients: "",
      dietaryRestrictions: "",
      preferredIngredient: "",
      avoidedIngredient: "",
    },
  });

  const recipeIdeasForm = useForm<RecipeIdeasFormValues>({
    resolver: zodResolver(recipeIdeasFormSchema),
    defaultValues: {
      availableIngredients: "",
      ingredientsToAvoid: "",
      otherPreferences: "",
    },
  });

  const onAlternativeSubmit: SubmitHandler<AlternativeSuggestionFormValues> = async (data) => {
    setIsAlternativeLoading(true);
    setAlternativeSuggestions([]);
    
    const result = await getSmartRecipeSuggestions({
      recipeName: data.recipeName,
      ingredients: data.ingredients,
      dietaryRestrictions: data.dietaryRestrictions || "None",
      preferredIngredient: data.preferredIngredient,
      avoidedIngredient: data.avoidedIngredient,
    });

    setIsAlternativeLoading(false);

    if ("error" in result) {
      toast({ variant: "destructive", title: "Error", description: result.error });
    } else {
      setAlternativeSuggestions(result);
      toast({ title: "Suggestions Found!", description: `Found ${result.length} alternative recipes.` });
    }
  };

  const onRecipeIdeasSubmit: SubmitHandler<RecipeIdeasFormValues> = async (data) => {
    setIsRecipeIdeasLoading(true);
    setRecipeIdeas([]);
    
    let constraints = `Suggest recipes using these available ingredients: ${data.availableIngredients}.`;
    if (data.ingredientsToAvoid) {
      constraints += ` Avoid these ingredients: ${data.ingredientsToAvoid}.`;
    }
    if (data.otherPreferences) {
      constraints += ` Other preferences: ${data.otherPreferences}.`;
    }

    const result = await getRecipeIdeasFromConstraints({ constraints });
    setIsRecipeIdeasLoading(false);

    if ("error" in result) {
      toast({ variant: "destructive", title: "Error", description: result.error });
    } else {
      setRecipeIdeas(result.recipes.map(name => ({ name }))); // Adapt to RecipeIdea[]
      toast({ title: "Recipe Ideas Found!", description: `Found ${result.recipes.length} ideas.` });
    }
  };

  return (
    <div className="space-y-8">
      {/* Form for Alternative Recipes */}
      <Form {...alternativeForm}>
        <form onSubmit={alternativeForm.handleSubmit(onAlternativeSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Alternative Recipes</CardTitle>
              <CardDescription>
                Tell us about a recipe or ingredients you have, and any constraints, to get smart suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={alternativeForm.control}
                name="recipeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Recipe Name / Idea</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chicken Alfredo, or 'Something with chicken'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={alternativeForm.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Ingredients</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List ingredients you have or are in the original recipe..." {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated list of ingredients.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={alternativeForm.control}
                  name="dietaryRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Restrictions (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., vegetarian, gluten-free" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alternativeForm.control}
                  name="preferredIngredient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingredient to Use Up (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., mushrooms" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={alternativeForm.control}
                name="avoidedIngredient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredient to Avoid (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., peanuts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isAlternativeLoading} className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                {isAlternativeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                Get Alternative Suggestions
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {/* Display Alternative Suggestions */}
      {isAlternativeLoading && (
        <div className="text-center py-10"><Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" /><p className="mt-2 text-muted-foreground">Generating alternatives...</p></div>
      )}
      {!isAlternativeLoading && alternativeSuggestions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Suggested Alternatives</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {alternativeSuggestions.map((suggestion, index) => (
              <Card key={index} className="overflow-hidden"><div className="md:flex">
                <div className="md:w-1/3 relative"><Image src={`https://placehold.co/300x200.png?text=${encodeURIComponent(suggestion.name)}`} alt={suggestion.name} width={300} height={200} className="object-cover w-full h-48 md:h-full" data-ai-hint="recipe food" /></div>
                <div className="p-4 md:w-2/3">
                  <CardTitle className="text-xl font-headline mb-1">{suggestion.name}</CardTitle>
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    {suggestion.meetsCriteria ? <span className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> Meets Criteria</span> : <span className="flex items-center text-red-600"><XCircle className="h-4 w-4 mr-1" /> May Not Meet Criteria</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Reason:</strong> {suggestion.reason}</p>
                  <p className="text-sm font-semibold mb-1">Ingredients:</p><p className="text-sm text-muted-foreground whitespace-pre-line text-ellipsis overflow-hidden max-h-20">{suggestion.ingredients}</p>
                  <Button variant="outline" size="sm" className="mt-3">View Full Recipe (Mock)</Button>
                </div></div></Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Form for "What's for Dinner?" */}
      <Form {...recipeIdeasForm}>
        <form onSubmit={recipeIdeasForm.handleSubmit(onRecipeIdeasSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What's For Dinner?</CardTitle>
              <CardDescription>Get quick recipe ideas based on what you have.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={recipeIdeasForm.control}
                name="availableIngredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients You Have</FormLabel>
                    <FormControl><Textarea placeholder="e.g., chicken, broccoli, rice, soy sauce" {...field} /></FormControl>
                    <FormDescription>Comma-separated list.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={recipeIdeasForm.control}
                name="ingredientsToAvoid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients to Avoid (optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., nuts, dairy" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={recipeIdeasForm.control}
                name="otherPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Preferences (optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., quick meal, spicy, low-carb" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isRecipeIdeasLoading} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                {isRecipeIdeasLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChefHat className="mr-2 h-4 w-4" />}
                Get Recipe Ideas
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {/* Display Recipe Ideas */}
      {isRecipeIdeasLoading && (
        <div className="text-center py-10"><Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" /><p className="mt-2 text-muted-foreground">Thinking of ideas...</p></div>
      )}
      {!isRecipeIdeasLoading && recipeIdeas.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recipe Ideas</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside">
              {recipeIdeas.map((idea, index) => (
                <li key={index} className="text-md">{idea.name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* No results messages */}
      {!isAlternativeLoading && alternativeSuggestions.length === 0 && alternativeForm.formState.isSubmitted && (
         <Card><CardContent className="p-6 text-center"><Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-xl font-semibold">No Alternative Suggestions</h3><p className="mt-1 text-muted-foreground">Try adjusting your criteria.</p></CardContent></Card>
      )}
      {!isRecipeIdeasLoading && recipeIdeas.length === 0 && recipeIdeasForm.formState.isSubmitted && (
         <Card><CardContent className="p-6 text-center"><ChefHat className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-xl font-semibold">No Recipe Ideas Found</h3><p className="mt-1 text-muted-foreground">Try different ingredients or preferences.</p></CardContent></Card>
      )}
    </div>
  );
}
