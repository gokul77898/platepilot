"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getSmartRecipeSuggestions } from '@/app/smart-suggestions/actions';
import type { SuggestedRecipe } from '@/types';
import { Loader2, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

const suggestionFormSchema = z.object({
  recipeName: z.string().min(1, "Recipe name is required"),
  ingredients: z.string().min(1, "Please list some ingredients"),
  dietaryRestrictions: z.string().optional(),
  preferredIngredient: z.string().optional(),
  avoidedIngredient: z.string().optional(),
});

type SuggestionFormValues = z.infer<typeof suggestionFormSchema>;

export default function SuggestionClientPage() {
  const [suggestions, setSuggestions] = useState<SuggestedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionFormSchema),
    defaultValues: {
      recipeName: "",
      ingredients: "",
      dietaryRestrictions: "",
      preferredIngredient: "",
      avoidedIngredient: "",
    },
  });

  const onSubmit: SubmitHandler<SuggestionFormValues> = async (data) => {
    setIsLoading(true);
    setSuggestions([]);
    
    const result = await getSmartRecipeSuggestions({
      recipeName: data.recipeName,
      ingredients: data.ingredients,
      dietaryRestrictions: data.dietaryRestrictions || "None",
      preferredIngredient: data.preferredIngredient,
      avoidedIngredient: data.avoidedIngredient,
    });

    setIsLoading(false);

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error fetching suggestions",
        description: result.error,
      });
    } else {
      setSuggestions(result);
      if (result.length === 0) {
        toast({
          title: "No suggestions found",
          description: "Try adjusting your criteria.",
        });
      } else {
         toast({
          title: "Suggestions found!",
          description: `Found ${result.length} alternative recipes.`,
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Alternative Recipes</CardTitle>
              <CardDescription>
                Tell us about a recipe or ingredients you have, and any constraints, to get smart suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Ingredients</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List ingredients you have or are in the original recipe, e.g., chicken breast, pasta, cream..." {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated list of ingredients.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                control={form.control}
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
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Suggestions...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get Smart Suggestions
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {isLoading && (
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Generating recipe ideas...</p>
        </div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Recipes</CardTitle>
            <CardDescription>Here are some alternatives based on your input.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 relative">
                     <Image src={`https://placehold.co/300x200.png?text=${encodeURIComponent(suggestion.name)}`} alt={suggestion.name} width={300} height={200} className="object-cover w-full h-48 md:h-full" data-ai-hint="recipe food" />
                  </div>
                  <div className="p-4 md:w-2/3">
                    <CardTitle className="text-xl font-headline mb-1">{suggestion.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      {suggestion.meetsCriteria ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" /> Meets Criteria
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" /> May Not Meet Criteria
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2"><strong>Reason:</strong> {suggestion.reason}</p>
                    <p className="text-sm font-semibold mb-1">Ingredients:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line text-ellipsis overflow-hidden max-h-20">
                      {suggestion.ingredients}
                    </p>
                     <Button variant="outline" size="sm" className="mt-3">View Full Recipe (Mock)</Button>
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {!isLoading && suggestions.length === 0 && form.formState.isSubmitted && (
         <Card>
            <CardContent className="p-6 text-center">
              <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No Suggestions Found</h3>
              <p className="mt-1 text-muted-foreground">We couldn't find any recipe suggestions for your criteria. Please try adjusting your input.</p>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
