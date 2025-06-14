
"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; // useParams to get ID
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
import type { Meal, MealPlan, MealType } from '@/types';
import { cn } from '@/lib/utils';

// Mock data for Meal Plans (same as in meal-plans/page.tsx for consistency)
const mockMealPlans: MealPlan[] = [
  {
    id: 'mp1',
    name: 'Healthy Kickstart Week',
    weekStartDate: '2024-07-29',
    description: 'A week of balanced and nutritious meals to get you started.',
    meals: [
      { id: 'm1', recipeId: 'r1', dayOfWeek: 'Monday', mealType: 'breakfast' },
      { id: 'm2', recipeId: 'r2', dayOfWeek: 'Monday', mealType: 'lunch' },
    ],
  },
  {
    id: 'mp2',
    name: 'Protein Power Plan',
    weekStartDate: '2024-08-05',
    description: 'Focus on high-protein meals for muscle building and satiety.',
    meals: [
      { id: 'm3', recipeId: 'r3', dayOfWeek: 'Tuesday', mealType: 'dinner' },
    ],
  },
];


const mealSchema = z.object({
  id: z.string().optional(), // Existing meals will have IDs
  dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], { required_error: "Day is required."}),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], { required_error: "Meal type is required."}),
  recipeId: z.string().min(1, "Recipe ID or name is required."),
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
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

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
    if (planId) {
      // Simulate fetching data
      setIsLoading(true);
      setTimeout(() => {
        const foundPlan = mockMealPlans.find(p => p.id === planId);
        if (foundPlan) {
          setMealPlan(foundPlan);
          form.reset({
            name: foundPlan.name,
            description: foundPlan.description || '',
            weekStartDate: parseISO(foundPlan.weekStartDate), // Convert string to Date
            meals: foundPlan.meals.map(m => ({ // Ensure existing meals have IDs for key prop
                id: m.id,
                dayOfWeek: m.dayOfWeek,
                mealType: m.mealType,
                recipeId: m.recipeId,
            })),
          });
        } else {
          toast({ variant: "destructive", title: "Error", description: "Meal plan not found." });
          router.push('/meal-plans');
        }
        setIsLoading(false);
      }, 500);
    }
  }, [planId, form, router, toast]);


  const onSubmit: SubmitHandler<MealPlanFormValues> = (data) => {
    if (!mealPlan) return;
    const updatedData = {
      ...mealPlan, // Keep original ID
      ...data,
      weekStartDate: format(data.weekStartDate, 'yyyy-MM-dd'), // Format date back to string
      meals: data.meals?.map((meal, index) => ({ ...meal, id: meal.id || `m-new-${Date.now()}-${index}` })) || []
    };
    console.log('Updated Meal Plan Data:', updatedData);
    // Here you would typically send the data to your backend
    toast({
      title: "Meal Plan Updated!",
      description: `${data.name} has been successfully updated (data logged to console).`,
    });
    router.push('/meal-plans');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading meal plan...</p>
      </div>
    );
  }

  if (!mealPlan) {
    // This case should ideally be handled by the redirect in useEffect
    return <p>Meal plan not found.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit Meal Plan: ${mealPlan.name}`}
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
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weekStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Week Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full md:w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                           disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meals</CardTitle>
            </CardHeader>
            <CardContent>
               {fields.length > 0 && (
                <div className="space-y-4 mb-4">
                  {fields.map((item, index) => (
                    <Card key={item.id} className="p-4 relative bg-muted/30">
                       <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Remove Meal</span>
                        </Button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`meals.${index}.dayOfWeek`}
                          render={({ field: dayField }) => (
                            <FormItem>
                              <FormLabel>Day</FormLabel>
                              <Select onValueChange={dayField.onChange} defaultValue={dayField.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`meals.${index}.mealType`}
                          render={({ field: typeField }) => (
                            <FormItem>
                              <FormLabel>Meal Type</FormLabel>
                              <Select onValueChange={typeField.onChange} defaultValue={typeField.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {mealTypes.map(type => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`meals.${index}.recipeId`}
                          render={({ field: recipeField }) => (
                            <FormItem>
                              <FormLabel>Recipe ID/Name</FormLabel>
                              <FormControl><Input placeholder="Enter Recipe ID or Name" {...recipeField} /></FormControl>
                              <FormDescription className="text-xs">Later, this will be a recipe search.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ dayOfWeek: 'Monday', mealType: 'breakfast', recipeId: '' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Meal Slot
              </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <><Save className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
