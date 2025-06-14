
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CalendarIcon, PlusCircle, Save, Trash2, Loader2 } from 'lucide-react';
import type { Meal, MealPlan, MealType, Recipe } from '@/types';
import { cn } from '@/lib/utils';
import { loadFromLocalStorage, saveToLocalStorage, generateId } from '@/lib/localStorage';

const MEAL_PLANS_STORAGE_KEY = 'mealPlans';
const RECIPES_STORAGE_KEY = 'recipes';

const mealSchema = z.object({
  id: z.string().default(() => generateId()),
  dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], { required_error: "Day is required."}),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], { required_error: "Meal type is required."}),
  recipeId: z.string().min(1, "Recipe is required."),
  recipeName: z.string().optional(),
});

const mealPlanFormSchema = z.object({
  name: z.string().min(3, "Plan name must be at least 3 characters long."),
  description: z.string().optional(),
  weekStartDate: z.date({ required_error: "Week start date is required."}),
  meals: z.array(mealSchema).optional(),
});

type MealPlanFormValues = z.infer<typeof mealPlanFormSchema>;

const daysOfWeek: Meal['dayOfWeek'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function EditMealPlanPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mealPlanToEdit, setMealPlanToEdit] = useState<MealPlan | null>(null);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);

  const planId = typeof params.id === 'string' ? params.id : undefined;

  const form = useForm<MealPlanFormValues>({
    resolver: zodResolver(mealPlanFormSchema),
    defaultValues: {
      name: '',
      description: '',
      weekStartDate: undefined,
      meals: [],
    },
  });
  
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "meals",
  });

  useEffect(() => {
    const storedRecipes = loadFromLocalStorage<Recipe[]>(RECIPES_STORAGE_KEY, []);
    setAvailableRecipes(storedRecipes);

    if (planId) {
      setIsLoading(true);
      const storedMealPlans = loadFromLocalStorage<MealPlan[]>(MEAL_PLANS_STORAGE_KEY, []);
      const foundPlan = storedMealPlans.find(p => p.id === planId);
      
      if (foundPlan) {
        setMealPlanToEdit(foundPlan);
        form.reset({
          name: foundPlan.name,
          description: foundPlan.description || '',
          weekStartDate: parseISO(foundPlan.weekStartDate),
          meals: foundPlan.meals.map(m => ({
              id: m.id || generateId(),
              dayOfWeek: m.dayOfWeek,
              mealType: m.mealType,
              recipeId: m.recipeId,
              recipeName: m.recipeName || storedRecipes.find(r => r.id === m.recipeId)?.name || 'Recipe not found'
          })),
        });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Meal plan not found." });
        router.push('/meal-plans');
      }
      setIsLoading(false);
    }
  }, [planId, form, router, toast]);


  const onSubmit: SubmitHandler<MealPlanFormValues> = (data) => {
    if (!mealPlanToEdit) return;
    setIsSubmitting(true);

    const updatedMealPlan: MealPlan = {
      ...mealPlanToEdit,
      name: data.name,
      description: data.description || '',
      weekStartDate: format(data.weekStartDate, 'yyyy-MM-dd'),
      meals: data.meals?.map(meal => {
        const selectedRecipe = availableRecipes.find(r => r.id === meal.recipeId);
        return {
          ...meal,
          id: meal.id || generateId(),
          recipeName: selectedRecipe?.name || 'Recipe not found',
        };
      }) || [],
      updatedAt: new Date().toISOString(),
    };

    const existingMealPlans = loadFromLocalStorage<MealPlan[]>(MEAL_PLANS_STORAGE_KEY, []);
    const planIndex = existingMealPlans.findIndex(p => p.id === mealPlanToEdit.id);

    if (planIndex > -1) {
      existingMealPlans[planIndex] = updatedMealPlan;
      saveToLocalStorage(MEAL_PLANS_STORAGE_KEY, existingMealPlans);
      toast({
        title: "Meal Plan Updated!",
        description: `${updatedMealPlan.name} has been successfully updated.`,
      });
      router.push('/meal-plans');
    } else {
       toast({ variant: "destructive", title: "Error", description: "Could not update meal plan." });
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading meal plan...</p>
      </div>
    );
  }

  if (!mealPlanToEdit) {
    return <p>Meal plan not found.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit Meal Plan: ${mealPlanToEdit.name}`}
        description="Modify your meal plan details."
        actions={
          <Button variant="outline" asChild>
            <Link href="/meal-plans">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Meal Plans
            </Link>
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Plan Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Plan Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="weekStartDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Week Start Date</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full md:w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")} > {field.value ? format(field.value, "PPP") : <span>Pick a date</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (Optional)</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Meals</CardTitle></CardHeader>
            <CardContent>
               {fields.length > 0 && (
                <div className="space-y-4 mb-4">
                  {fields.map((item, index) => (
                    <Card key={item.id} className="p-4 relative bg-muted/30">
                       <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}> <Trash2 className="h-4 w-4" /> <span className="sr-only">Remove Meal</span> </Button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`meals.${index}.dayOfWeek`} render={({ field: dayField }) => ( <FormItem> <FormLabel>Day</FormLabel> <Select onValueChange={dayField.onChange} defaultValue={dayField.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl> <SelectContent> {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name={`meals.${index}.mealType`} render={({ field: typeField }) => ( <FormItem> <FormLabel>Meal Type</FormLabel> <Select onValueChange={typeField.onChange} defaultValue={typeField.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl> <SelectContent> {mealTypes.map(type => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name={`meals.${index}.recipeId`} render={({ field: recipeField }) => ( <FormItem> <FormLabel>Recipe</FormLabel> <Select onValueChange={recipeField.onChange} defaultValue={recipeField.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select recipe" /></SelectTrigger></FormControl> <SelectContent> {availableRecipes.length > 0 ? availableRecipes.map(recipe => <SelectItem key={recipe.id} value={recipe.id}>{recipe.name}</SelectItem>) : <SelectItem value="" disabled>No recipes available</SelectItem>} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ id: generateId(), dayOfWeek: 'Monday', mealType: 'breakfast', recipeId: '' })}> <PlusCircle className="mr-2 h-4 w-4" /> Add Meal Slot </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90" disabled={isSubmitting}> {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>} </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
