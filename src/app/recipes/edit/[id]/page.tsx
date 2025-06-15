
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, PlusCircle, Save, Trash2, Loader2, Sparkles } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage, generateId } from '@/lib/localStorage';
import type { Recipe, Ingredient, AnalyzeRecipeNutritionInputIngredient } from '@/types';
import { getRecipeNutritionAnalysis } from '../../actions'; 

const RECIPES_STORAGE_KEY = 'recipes';

const ingredientSchema = z.object({
  id: z.string().default(() => generateId()),
  name: z.string().min(1, "Ingredient name cannot be empty."),
  quantity: z.string().min(1, "Quantity is required."),
  unit: z.string().optional(),
});

const recipeFormSchema = z.object({
  name: z.string().min(3, "Recipe name must be at least 3 characters long."),
  description: z.string().optional(),
  ingredients: z.array(ingredientSchema).min(1, "Please add at least one ingredient."),
  instructions: z.string().min(1, "Please provide instruction steps, each on a new line."),
  prepTime: z.string().min(1, "Prep time is required. e.g., 20 mins"),
  cookTime: z.string().min(1, "Cook time is required. e.g., 45 mins"),
  servings: z.coerce.number().min(1, "Servings must be at least 1.").positive("Servings must be a positive number."),
  imageUrl: z.string().url("Please enter a valid URL for the image, or leave empty.").optional().or(z.literal('')),
  tags: z.string().optional().describe("Comma-separated list of tags, e.g., Italian, Pasta, Quick"),
  nutritionalInfo: z.object({
    calories: z.coerce.number().optional().nullable(),
    protein: z.coerce.number().optional().nullable(),
    carbs: z.coerce.number().optional().nullable(),
    fat: z.coerce.number().optional().nullable(),
  }).optional(),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false);

  const recipeId = typeof params.id === 'string' ? params.id : undefined;

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      ingredients: [],
      instructions: '',
      prepTime: '',
      cookTime: '',
      servings: 1,
      imageUrl: '',
      tags: '',
      nutritionalInfo: { calories: undefined, protein: undefined, carbs: undefined, fat: undefined },
    },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  useEffect(() => {
    if (recipeId) {
      setIsLoading(true);
      const storedRecipes = loadFromLocalStorage<Recipe[]>(RECIPES_STORAGE_KEY, []);
      const foundRecipe = storedRecipes.find(r => r.id === recipeId);
      if (foundRecipe) {
        setRecipeToEdit(foundRecipe);
        form.reset({
          name: foundRecipe.name,
          description: foundRecipe.description || '',
          ingredients: foundRecipe.ingredients.map(ing => ({...ing, id: ing.id || generateId()})),
          instructions: Array.isArray(foundRecipe.instructions) ? foundRecipe.instructions.join('\n') : '',
          prepTime: foundRecipe.prepTime,
          cookTime: foundRecipe.cookTime,
          servings: foundRecipe.servings,
          imageUrl: foundRecipe.imageUrl || '',
          tags: Array.isArray(foundRecipe.tags) ? foundRecipe.tags.join(', ') : '',
          nutritionalInfo: foundRecipe.nutritionalInfo || { calories: undefined, protein: undefined, carbs: undefined, fat: undefined },
        });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Recipe not found." });
        router.push('/recipes');
      }
      setIsLoading(false);
    }
  }, [recipeId, form, router, toast]);


  const onSubmit: SubmitHandler<RecipeFormValues> = (data) => {
    if (!recipeToEdit) return;
    setIsSubmitting(true);

    const updatedRecipe: Recipe = {
      ...recipeToEdit,
      ...data,
      instructions: data.instructions.split('\n').map(instr => instr.trim()).filter(instr => instr.length > 0),
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      imageUrl: data.imageUrl || "https://placehold.co/600x400.png",
      ingredients: data.ingredients.map(ing => ({...ing, id: ing.id || generateId()})),
      nutritionalInfo: {
        calories: data.nutritionalInfo?.calories,
        protein: data.nutritionalInfo?.protein,
        carbs: data.nutritionalInfo?.carbs,
        fat: data.nutritionalInfo?.fat,
      },
      updatedAt: new Date().toISOString(),
    };

    const existingRecipes = loadFromLocalStorage<Recipe[]>(RECIPES_STORAGE_KEY, []);
    const recipeIndex = existingRecipes.findIndex(r => r.id === recipeToEdit.id);
    
    if (recipeIndex > -1) {
      existingRecipes[recipeIndex] = updatedRecipe;
      saveToLocalStorage(RECIPES_STORAGE_KEY, existingRecipes);
      toast({
        title: "Recipe Updated!",
        description: `${updatedRecipe.name} has been successfully updated.`,
      });
      router.push(`/recipes/${updatedRecipe.id}`);
    } else {
      toast({ variant: "destructive", title: "Error", description: "Could not update recipe." });
    }
    setIsSubmitting(false);
  };
  
  const handleAnalyzeNutrition = async () => {
    const { name, ingredients, servings } = form.getValues();
    if (!name || ingredients.length === 0 || !servings || servings < 1) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please provide recipe name, ingredients, and valid servings before analyzing." });
      return;
    }

    setIsAnalyzingNutrition(true);
    const analysisIngredients: AnalyzeRecipeNutritionInputIngredient[] = ingredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
    }));

    const result = await getRecipeNutritionAnalysis({ recipeName: name, ingredients: analysisIngredients, servings });
    setIsAnalyzingNutrition(false);

    if ('error' in result) {
      toast({ variant: "destructive", title: "Nutrition Analysis Error", description: result.error });
    } else {
      form.setValue('nutritionalInfo.calories', result.calories ?? undefined);
      form.setValue('nutritionalInfo.protein', result.protein ?? undefined);
      form.setValue('nutritionalInfo.carbs', result.carbs ?? undefined);
      form.setValue('nutritionalInfo.fat', result.fat ?? undefined);
      toast({ title: "Nutrition Analyzed!", description: "Nutritional information fields have been populated." });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading recipe...</p>
      </div>
    );
  }

  if (!recipeToEdit) {
    return <p>Recipe not found or an error occurred.</p>;
  }


  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit Recipe: ${form.getValues('name') || recipeToEdit.name}`}
        description="Modify the details of your recipe."
        actions={
          <Button variant="outline" asChild>
            <Link href={`/recipes/${recipeId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipe
            </Link>
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Recipe Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Recipe Name</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (Optional)</FormLabel> <FormControl> <Textarea {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="imageUrl" render={({ field }) => ( <FormItem> <FormLabel>Image URL (Optional)</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormDescription>Link to an image. Defaults to placeholder if empty.</FormDescription> <FormMessage /> </FormItem> )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ingredients</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end p-3 border rounded-md bg-muted/50 relative">
                  <FormField control={form.control} name={`ingredients.${index}.name`} render={({ field: nameField }) => ( <FormItem className="flex-1"> <FormLabel className={index !== 0 ? "sr-only" : ""}>Name</FormLabel> <FormControl><Input placeholder="e.g., Flour" {...nameField} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name={`ingredients.${index}.quantity`} render={({ field: qtyField }) => ( <FormItem className="w-24"> <FormLabel className={index !== 0 ? "sr-only" : ""}>Quantity</FormLabel> <FormControl><Input placeholder="e.g., 1" {...qtyField} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name={`ingredients.${index}.unit`} render={({ field: unitField }) => ( <FormItem className="w-20"> <FormLabel className={index !== 0 ? "sr-only" : ""}>Unit</FormLabel> <FormControl><Input placeholder="e.g., cup" {...unitField} /></FormControl> <FormMessage /> </FormItem> )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)} className="text-muted-foreground hover:text-destructive shrink-0" title="Remove Ingredient"> <Trash2 className="h-4 w-4" /> </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendIngredient({id: generateId(), name: '', quantity: '', unit: '' })}> <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient </Button>
              { (form.formState.errors.ingredients?.message || form.formState.errors.ingredients?.root?.message) &&
                <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.ingredients?.message || form.formState.errors.ingredients?.root?.message}
                </p>
              }
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
            <CardContent>
              <FormField control={form.control} name="instructions" render={({ field }) => ( <FormItem> <FormLabel>Instructions</FormLabel> <FormControl> <Textarea placeholder="List each instruction step on a new line..." rows={8} {...field} /> </FormControl> <FormDescription>Enter each step of the recipe on a new line.</FormDescription> <FormMessage /> </FormItem> )} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Timings & Servings</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="prepTime" render={({ field }) => ( <FormItem> <FormLabel>Prep Time</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="cookTime" render={({ field }) => ( <FormItem> <FormLabel>Cook Time</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="servings" render={({ field }) => ( <FormItem> <FormLabel>Servings</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Additional Information (Optional)</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={handleAnalyzeNutrition} disabled={isAnalyzingNutrition || isSubmitting}>
                        {isAnalyzingNutrition ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-accent" />}
                        AI Analyze Nutrition
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem> <FormLabel>Tags</FormLabel> <FormControl><Input placeholder="e.g., Italian, Pasta" {...field} /></FormControl> <FormDescription>Comma-separated list of tags.</FormDescription> <FormMessage /> </FormItem> )} />
              <fieldset className="space-y-2 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">Nutritional Info (per serving)</legend>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                   <FormField control={form.control} name="nutritionalInfo.calories" render={({ field }) => ( <FormItem> <FormLabel>Calories (kcal)</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 550" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="nutritionalInfo.protein" render={({ field }) => ( <FormItem> <FormLabel>Protein (g)</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 30" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="nutritionalInfo.carbs" render={({ field }) => ( <FormItem> <FormLabel>Carbs (g)</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 70" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="nutritionalInfo.fat" render={({ field }) => ( <FormItem> <FormLabel>Fat (g)</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 20" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )} />
                </div>
                <FormDescription className="pt-2 text-xs">Values are per serving. Use the 'AI Analyze Nutrition' button above to auto-fill these based on ingredients and servings.</FormDescription>
              </fieldset>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90" disabled={isSubmitting || isAnalyzingNutrition}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
