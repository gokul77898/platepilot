
import { PageHeader } from '@/components/layout/PageHeader';
import MealAnalyzerClient from '@/components/meal-analyzer/MealAnalyzerClient';

export default function MealAnalyzerPage() {
  return (
    <div>
      <PageHeader
        title="Meal Image Analyzer"
        description="Upload an image of your meal to get AI-powered nutritional estimates and health insights."
      />
      <MealAnalyzerClient />
    </div>
  );
}
