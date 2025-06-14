
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Archive, PlusCircle } from 'lucide-react';

export default function PantryPage() {
  // Mock data for now
  const pantryItemsCount = 0; // Replace with actual data fetching later

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pantry Inventory"
        description="Manage the ingredients you have on hand."
        actions={
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        }
      />

      {pantryItemsCount === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Archive className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-6 text-2xl font-semibold">Your Pantry is Empty</h3>
            <p className="mt-2 text-muted-foreground">
              Start adding items to your pantry to keep track of what you have.
            </p>
            <Button className="mt-6 bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p>List of pantry items will go here...</p>
            {/* TODO: Implement display of pantry items */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
