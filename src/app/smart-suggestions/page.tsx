import { PageHeader } from '@/components/layout/PageHeader';
import SuggestionClientPage from '@/components/smart-suggestions/SuggestionClientPage';

export default function SmartSuggestionsPage() {
  return (
    <div>
      <PageHeader
        title="Smart Recipe Suggestions"
        description="Get AI-powered recipe ideas and ingredient alternatives."
      />
      <SuggestionClientPage />
    </div>
  );
}
