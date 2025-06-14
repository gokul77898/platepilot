
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export default function AiCoachPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Coach"
        description="Your personal AI assistant for hyper-personalized meal planning, progress tracking, and adaptive coaching."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-6 w-6 text-primary" />
            Welcome to Your AI Coach!
          </CardTitle>
          <CardDescription>
            This section is dedicated to providing you with advanced, personalized insights and guidance to achieve your health and dietary goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Exciting features are coming soon, including:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
            <li>Detailed goal setting and tracking.</li>
            <li>Adaptive meal plans that learn from your preferences and progress.</li>
            <li>Daily insights and motivational coaching.</li>
            <li>Integration with health trackers.</li>
          </ul>
          <p className="mt-6 font-semibold">
            Stay tuned for a truly personalized experience!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
