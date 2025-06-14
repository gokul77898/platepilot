
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel } from '@/components/ui/form'; // Only FormItem and FormLabel needed here
import { analyzeUploadedMealImage } from '@/app/smart-suggestions/actions';
import type { AnalyzeMealImageOutput } from '@/types';
import { Loader2, Camera, CheckCircle, XCircle, Activity, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MealAnalyzerClient() {
  const [mealImageFile, setMealImageFile] = useState<File | null>(null);
  const [mealImageDataUri, setMealImageDataUri] = useState<string | null>(null);
  const [mealImageAnalysis, setMealImageAnalysis] = useState<AnalyzeMealImageOutput | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);


  const { toast } = useToast();

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMealImageFile(file);
      setMealImageAnalysis(null); // Reset previous analysis
      setFormSubmitted(false); // Reset submission state

      const reader = new FileReader();
      reader.onloadend = () => {
        setMealImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMealImageFile(null);
      setMealImageDataUri(null);
    }
  };

  const onAnalyzeImageSubmit = async () => {
    if (!mealImageDataUri) {
      toast({ variant: "destructive", title: "No Image", description: "Please select an image to analyze." });
      return;
    }
    setIsAnalyzingImage(true);
    setMealImageAnalysis(null);
    setFormSubmitted(true);


    const result = await analyzeUploadedMealImage({ imageDataUri: mealImageDataUri });
    setIsAnalyzingImage(false);

    if ("error" in result) {
      toast({ variant: "destructive", title: "Analysis Error", description: result.error });
    } else {
      setMealImageAnalysis(result);
      toast({ title: "Analysis Complete!", description: "Meal image analysis results are ready." });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Meal</CardTitle>
          <CardDescription>For best results, use a clear image of the food. The AI will try to identify it and provide insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormItem>
            <FormLabel htmlFor="meal-image-upload">Meal Image</FormLabel>
            <Input id="meal-image-upload" type="file" accept="image/*" onChange={handleImageFileChange} className="border p-2 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {mealImageDataUri && (
                <div className="mt-4 border rounded-md p-2 inline-block shadow-sm">
                     <Image src={mealImageDataUri} alt="Meal preview" width={200} height={200} className="rounded-md object-cover aspect-square" data-ai-hint="food meal" />
                </div>
            )}
          </FormItem>
        </CardContent>
        <CardFooter>
          <Button onClick={onAnalyzeImageSubmit} disabled={isAnalyzingImage || !mealImageDataUri} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            {isAnalyzingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
            Analyze Meal Image
          </Button>
        </CardFooter>
      </Card>

      {isAnalyzingImage && (
        <div className="text-center py-10"><Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" /><p className="mt-2 text-muted-foreground">Analyzing your meal...</p></div>
      )}
      {!isAnalyzingImage && mealImageAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Meal Analysis Results</CardTitle>
             <CardDescription>
                Identified as: <span className="font-semibold text-primary">{mealImageAnalysis.identifiedDish || "Dish not clearly identified"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={mealImageAnalysis.isHealthy ? "default" : "destructive"} className={mealImageAnalysis.isHealthy ? "bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700" : "bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-700"}>
              {mealImageAnalysis.isHealthy ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /> : <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
              <AlertTitle className={mealImageAnalysis.isHealthy ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                {mealImageAnalysis.isHealthy ? "Looks Generally Healthy!" : "Consider Healthier Options"}
              </AlertTitle>
              <AlertDescription className={mealImageAnalysis.isHealthy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {mealImageAnalysis.healthinessReason}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-muted/30 dark:bg-muted/50">
                    <div className="flex items-center mb-2">
                        <Activity className="h-5 w-5 mr-2 text-primary"/>
                        <h4 className="font-semibold text-lg">Estimated Calories</h4>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                        {mealImageAnalysis.estimatedCalories !== null ? `${mealImageAnalysis.estimatedCalories} kcal` : "N/A"}
                    </p>
                    {mealImageAnalysis.estimatedCalories === null && <p className="text-xs text-muted-foreground">Could not reliably estimate calories.</p>}
                </Card>
                 <Card className="p-4 bg-muted/30 dark:bg-muted/50">
                    <div className="flex items-center mb-2">
                        <Info className="h-5 w-5 mr-2 text-accent"/>
                        <h4 className="font-semibold text-lg">Consumption Advice</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{mealImageAnalysis.consumptionAdvice}</p>
                </Card>
            </div>
            <p className="text-xs text-center text-muted-foreground pt-4">
              Disclaimer: This analysis is AI-generated and for informational purposes only. It is not a substitute for professional nutritional advice.
            </p>
          </CardContent>
        </Card>
      )}
      {!isAnalyzingImage && !mealImageAnalysis && mealImageFile && formSubmitted && (
         <Card><CardContent className="p-6 text-center"><Camera className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-xl font-semibold">Ready to Analyze</h3><p className="mt-1 text-muted-foreground">Click the button above to analyze your uploaded image.</p></CardContent></Card>
      )}
    </div>
  );
}
