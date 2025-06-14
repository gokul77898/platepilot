
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Brain, Lightbulb, Loader2, Save, Sparkles } from 'lucide-react';
import type { UserProfileGoals } from '@/types';
import { loadFromLocalStorage, saveToLocalStorage } from '@/lib/localStorage';
import { getAiCoachingStatement } from './actions';

const USER_GOALS_STORAGE_KEY = 'userProfileGoals_v2'; // Consider versioning if schema changes significantly
const COACHING_STATEMENT_STORAGE_KEY = 'aiCoachingStatement_v2';

const userProfileGoalsSchema = z.object({
  primaryGoal: z.string().min(5, "Please describe your primary goal in a bit more detail (min. 5 characters)."),
  dietaryPreferences: z.string().min(5, "Describe your dietary preferences or important notes (min. 5 characters)."),
  challenges: z.string().min(5, "What are some challenges you face (min. 5 characters)?"),
  allergies: z.string().optional().describe("Comma-separated list of known allergies."),
  generalDietaryNotes: z.string().optional().describe("General notes about your diet, e.g., 'vegan', 'prefers spicy food'."),
});

type UserProfileGoalsFormValues = z.infer<typeof userProfileGoalsSchema>;

export default function AiCoachPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [aiCoachingStatement, setAiCoachingStatement] = useState<string | null>(null);
  const [isGeneratingStatement, setIsGeneratingStatement] = useState(false);

  const form = useForm<UserProfileGoalsFormValues>({
    resolver: zodResolver(userProfileGoalsSchema),
    defaultValues: {
      primaryGoal: '',
      dietaryPreferences: '',
      challenges: '',
      allergies: '',
      generalDietaryNotes: '',
    },
  });

  useEffect(() => {
    const storedGoals = loadFromLocalStorage<UserProfileGoalsFormValues>(USER_GOALS_STORAGE_KEY, {
      primaryGoal: '',
      dietaryPreferences: '',
      challenges: '',
      allergies: '',
      generalDietaryNotes: '',
    });
    form.reset(storedGoals);
    const storedStatement = loadFromLocalStorage<string | null>(COACHING_STATEMENT_STORAGE_KEY, null);
    if (storedStatement && storedGoals.primaryGoal) { // Only load statement if goals were present
        setAiCoachingStatement(storedStatement);
    }
    setIsLoadingGoals(false);
  }, [form]);

  const handleFetchCoachingStatement = async (goals: UserProfileGoalsFormValues) => {
    setIsGeneratingStatement(true);
    const result = await getAiCoachingStatement(goals);
    setIsGeneratingStatement(false);
    if ('error' in result) {
      toast({ variant: 'destructive', title: 'AI Coach Error', description: result.error });
      setAiCoachingStatement("Could not retrieve a coaching tip at this moment. Please try again later.");
    } else {
      setAiCoachingStatement(result.statement);
      saveToLocalStorage(COACHING_STATEMENT_STORAGE_KEY, result.statement);
    }
  };

  const onSubmit: SubmitHandler<UserProfileGoalsFormValues> = async (data) => {
    setIsSubmitting(true);
    saveToLocalStorage(USER_GOALS_STORAGE_KEY, data);
    toast({
      title: "Profile Updated!",
      description: "Your AI Coach profile has been saved.",
    });
    await handleFetchCoachingStatement(data);
    setIsSubmitting(false);
  };

  if (isLoadingGoals) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your coaching profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your AI Health Coach"
        description="Let's personalize your journey. The more you tell your coach, the better the advice!"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-6 w-6 text-primary" />
            Your Health & Diet Profile
          </CardTitle>
          <CardDescription>
            Share your aspirations, dietary needs, allergies, and hurdles. This helps your AI Coach tailor guidance specifically for you.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="primaryGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>My Primary Health Goal</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lose 10 pounds, build muscle, improve energy levels" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dietaryPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Preferences & Key Restrictions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Vegetarian, gluten-free, prefer quick 30-min meals, generally avoid dairy" {...field} rows={3}/>
                    </FormControl>
                    <FormDescription>Specific diets (like keto, paleo), important food avoidances, or general preferences.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Known Allergies (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Peanuts, shellfish, gluten, dairy (if strict)" {...field} />
                    </FormControl>
                    <FormDescription>List any food allergies, comma-separated.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="generalDietaryNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Dietary Notes & Lifestyle (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Follow a vegan diet, prefer spicy food, need low-sodium options, intermittent fasting schedule." {...field} rows={3}/>
                    </FormControl>
                     <FormDescription>Any other details about your eating habits or lifestyle that might be relevant.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="challenges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Challenges You Face</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Cravings for sweets, not enough time for breakfast, emotional eating, staying hydrated" {...field} rows={3}/>
                    </FormControl>
                    <FormDescription>What makes achieving your goals difficult?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || isGeneratingStatement}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save My Profile
              </Button>
               <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => handleFetchCoachingStatement(form.getValues())} 
                  disabled={isGeneratingStatement || !form.formState.isDirty && !aiCoachingStatement } // Enable if form is dirty OR no statement exists
                  className="w-full sm:w-auto"
                >
                {isGeneratingStatement ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-accent" />}
                Get Fresh Coaching Tip
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {(isGeneratingStatement || aiCoachingStatement) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 h-6 w-6 text-accent" />
              Your AI Coach Says...
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGeneratingStatement ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating your personalized tip...
              </div>
            ) : (
              aiCoachingStatement && (
                <Alert className="bg-accent/10 border-accent/30">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <AlertTitle className="text-accent-foreground/90 font-semibold">Personalized Insight</AlertTitle>
                  <AlertDescription className="text-accent-foreground/80 whitespace-pre-line">
                    {aiCoachingStatement}
                  </AlertDescription>
                </Alert>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
