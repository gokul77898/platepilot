
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CalendarIcon, PlusCircle, Save, Trash2, Loader2, Lightbulb, Sparkles } from 'lucide-react';
import type { Meal, MealPlan, MealType, Recipe, AiMealSuggestion, AiMealSuggestionInput } from '@/types';
import { cn } from '@/lib/utils';
import { loadFromLocalStorage, saveToLocalStorage, generateId } from '@/lib/localStorage';
import { getAiMealSuggestions } from '../actions'; 

const MEAL_PLANS_STORAGE_KEY = 'mealPlans';
const RECIPES_STORAGE_KEY = 'recipes';
const AI_SUGGESTION_ANY_MEAL_TYPE_VALUE = "__any_meal_type_placeholder__";


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

  // AI Suggestion State
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiMealType, setAiMealType] = useState<string>('');
  const [aiDietaryPreferences, setAiDietaryPreferences] = useState<string>('');
  const [aiKeywords, setAiKeywords] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<AiMealSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedDayForAi, setSelectedDayForAi] = useState<Meal['dayOfWeek']>('Monday');
  const [selectedMealTypeForAi, setSelectedMealTypeForAi] = useState<MealType>('breakfast');


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
  
  const { fields, append, remove } = useFieldArray({
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
    } else {
        setIsLoading(false);
        router.push('/meal-plans'); 
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

  const handleFetchAiSuggestions = async () => {
    setIsAiLoading(true);
    setAiSuggestions([]);
    const input: AiMealSuggestionInput = {
        mealType: aiMealType || undefined, // Send undefined if empty string for "any"
        dietaryPreferences: aiDietaryPreferences,
        keywords: aiKeywords,
    };
    const result = await getAiMealSuggestions(input);
    setIsAiLoading(false);
    if ('error' in result) {
        toast({ variant: 'destructive', title: 'AI Suggestion Error', description: result.error });
    } else {
        setAiSuggestions(result);
         if (result.length === 0) {
            toast({ title: 'No Suggestions', description: 'The AI could not find any suggestions for your criteria. Try being more general.' });
        }
    }
  };

  const handleAddAiSuggestionToPlan = (suggestion: AiMealSuggestion) => {
    const newRecipe: Recipe = {
        id: generateId(),
        name: suggestion.name,
        description: suggestion.description || "AI-generated meal suggestion.",
        ingredients: [], 
        instructions: ["Details to be added by user."], 
        prepTime: "N/A",
        cookTime: "N/A",
        servings: 1,
        nutritionalInfo: { calories: suggestion.estimatedCalories ?? undefined },
        imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(suggestion.name)}`,
        tags: ["AI Suggested"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const updatedRecipes = [...availableRecipes, newRecipe];
    setAvailableRecipes(updatedRecipes);
    saveToLocalStorage(RECIPES_STORAGE_KEY, updatedRecipes);

    append({
        id: generateId(),
        dayOfWeek: selectedDayForAi, 
        mealType: selectedMealTypeForAi,
        recipeId: newRecipe.id,
        recipeName: newRecipe.name,
    });

    toast({ title: "Meal Added", description: `${suggestion.name} added to your plan for ${selectedDayForAi}, ${selectedMealTypeForAi}.` });
    setIsAiDialogOpen(false); 
    setAiSuggestions([]);
  };

  const openAiDialog = (day?: Meal['dayOfWeek'], mealType?: MealType) => {
    setSelectedDayForAi(day || 'Monday');
    setSelectedMealTypeForAi(mealType || 'breakfast');
    setAiMealType(mealType || ''); 
    setAiDietaryPreferences('');
    setAiKeywords('');
    setAiSuggestions([]);
    setIsAiDialogOpen(true);
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
    return <p>Meal plan not found or error loading.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit Meal Plan: ${form.getValues('name') || mealPlanToEdit.name}`}
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
              <FormField control={form.control} name="weekStartDate" render={({ field }) => ( 
                <FormItem className="flex flex-col"> 
                  <FormLabel>Week Start Date</FormLabel> 
                  <Popover> 
                    <PopoverTrigger asChild> 
                        <Button variant={"outline"} className={cn("w-full md:w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")} > 
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>} 
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> 
                        </Button> 
                    </PopoverTrigger> 
                    <PopoverContent className="w-auto p-0" align="start"> 
                      <Calendar 
                        mode="single" 
                        selected={field.value} 
                        onSelect={field.onChange} 
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} 
                        initialFocus 
                      /> 
                    </PopoverContent> 
                  </Popover> 
                  <FormMessage /> 
                </FormItem> 
              )} />
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (Optional)</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Meals</CardTitle>
                  <CardDescription>Manage meals in this plan.</CardDescription>
                </div>
                 <Button type="button" variant="outline" size="sm" onClick={() => openAiDialog()}> <Sparkles className="mr-2 h-4 w-4 text-accent" /> AI Suggest Meal </Button>
              </div>
            </CardHeader>
            <CardContent>
               {fields.length > 0 && (
                <div className="space-y-4 mb-4">
                  {fields.map((item, index) => (
                    <Card key={item.id} className="p-4 relative bg-muted/30">
                       <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}> <Trash2 className="h-4 w-4" /> <span className="sr-only">Remove Meal</span> </Button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`meals.${index}.dayOfWeek`} render={({ field: dayField }) => ( <FormItem> <FormLabel>Day</FormLabel> <Select onValueChange={dayField.onChange} defaultValue={dayField.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl> <SelectContent> {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name={`meals.${index}.mealType`} render={({ field: typeField }) => ( <FormItem> <FormLabel>Meal Type</FormLabel> <Select onValueChange={typeField.onChange} defaultValue={typeField.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl> <SelectContent> {mealTypes.map(type => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name={`meals.${index}.recipeId`} render={({ field: recipeField }) => ( <FormItem> <FormLabel>Recipe</FormLabel> <Select onValueChange={recipeField.onChange} defaultValue={recipeField.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select recipe" /></SelectTrigger></FormControl> <SelectContent> {availableRecipes.length > 0 ? availableRecipes.map(recipe => <SelectItem key={recipe.id} value={recipe.id}>{recipe.name}</SelectItem>) : <SelectItem value="no_recipes_available_placeholder" disabled>No recipes available</SelectItem>} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                      </div>
                       <div className="mt-2 text-right">
                        <Button type="button" variant="link" size="sm" className="text-accent hover:text-accent/80" onClick={() => openAiDialog(form.getValues(`meals.${index}.dayOfWeek`), form.getValues(`meals.${index}.mealType`))}> <Sparkles className="mr-1 h-3 w-3" /> AI idea for this slot </Button>
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

      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Meal Suggestions</DialogTitle>
            <DialogDescription>
              Let AI suggest meals for {selectedDayForAi}, {selectedMealTypeForAi}. Fill in optional preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-meal-type-edit">Target Meal Type (optional)</Label>
              <Select
                value={aiMealType === '' ? AI_SUGGESTION_ANY_MEAL_TYPE_VALUE : aiMealType}
                onValueChange={(value) => {
                  setAiMealType(value === AI_SUGGESTION_ANY_MEAL_TYPE_VALUE ? '' : value);
                }}
              >
                <SelectTrigger id="ai-meal-type-edit"><SelectValue placeholder="Any Meal Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={AI_SUGGESTION_ANY_MEAL_TYPE_VALUE}>Any</SelectItem>
                  {mealTypes.map(type => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-dietary-pref-edit">Dietary Preferences (optional)</Label>
              <Input id="ai-dietary-pref-edit" placeholder="e.g., vegetarian, gluten-free, low-carb" value={aiDietaryPreferences} onChange={(e) => setAiDietaryPreferences(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-keywords-edit">Keywords (optional)</Label>
              <Input id="ai-keywords-edit" placeholder="e.g., quick, healthy, high-protein" value={aiKeywords} onChange={(e) => setAiKeywords(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleFetchAiSuggestions} disabled={isAiLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />} Get Suggestions
            </Button>
          </DialogFooter>

          {aiSuggestions.length > 0 && (
            <div className="mt-6 max-h-60 overflow-y-auto space-y-3 pr-2">
              <h4 className="font-semibold text-md mb-2">Suggestions:</h4>
              {aiSuggestions.map((suggestion, index) => (
                <Card key={index} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{suggestion.name}</CardTitle>
                      <CardDescription className="text-xs">{suggestion.description}</CardDescription>
                      {suggestion.estimatedCalories && <p className="text-xs text-primary font-medium mt-1">{suggestion.estimatedCalories} kcal (est.)</p>}
                    </div>
                    <Button type="button" size="sm" onClick={() => handleAddAiSuggestionToPlan(suggestion)} className="ml-2 shrink-0">Add</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
           {isAiLoading && <div className="text-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /> <p className="text-sm text-muted-foreground">AI is thinking...</p></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
    

    