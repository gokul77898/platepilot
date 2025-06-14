import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { ShoppingListItem } from '@/types';
import { ShoppingCart, Download, Send, CheckCircle, Circle } from 'lucide-react';

// Mock data for Shopping List
const mockShoppingList: ShoppingListItem[] = [
  { id: 'sl1', ingredientName: 'Chicken Breast', quantity: '2', unit: 'lbs', recipeNames: ['Chicken Stir-fry', 'Grilled Chicken Salad'], isBought: false },
  { id: 'sl2', ingredientName: 'Broccoli', quantity: '1', unit: 'head', recipeNames: ['Chicken Stir-fry'], isBought: false },
  { id: 'sl3', ingredientName: 'Avocado', quantity: '3', recipeNames: ['Avocado Toast'], isBought: true },
  { id: 'sl4', ingredientName: 'Spaghetti', quantity: '1', unit: 'pack', recipeNames: ['Spaghetti Bolognese'], isBought: false },
  { id: 'sl5', ingredientName: 'Eggs', quantity: '1', unit: 'dozen', recipeNames: ['Avocado Toast'], isBought: false },
  { id: 'sl6', ingredientName: 'Sourdough Bread', quantity: '1', unit: 'loaf', recipeNames: ['Avocado Toast'], isBought: true },
];

export default function ShoppingListPage() {
  const activeItems = mockShoppingList.filter(item => !item.isBought);
  const boughtItems = mockShoppingList.filter(item => item.isBought);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Shopping List"
        description="Your automatically generated grocery list from your meal plans."
        actions={
          <div className="flex gap-2">
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export List</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Send className="mr-2 h-4 w-4" /> Share List</Button>
          </div>
        }
      />

      {mockShoppingList.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Shopping List is Empty</h3>
            <p className="mt-1 text-muted-foreground">Add recipes to a meal plan to generate a shopping list.</p>
            <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
              <Link href="/meal-plans">
                Go to Meal Plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Grocery Items</CardTitle>
            <CardDescription>Based on your current meal plan: "Healthy Kickstart Week" (example).</CardDescription>
          </CardHeader>
          <CardContent>
            {activeItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Circle className="text-primary h-5 w-5" /> To Buy ({activeItems.length})</h3>
                <ul className="space-y-3">
                  {activeItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Checkbox id={`item-${item.id}`} />
                        <div>
                          <label htmlFor={`item-${item.id}`} className="font-medium">{item.ingredientName}</label>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit || ''} (For: {item.recipeNames.join(', ')})
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeItems.length > 0 && boughtItems.length > 0 && <Separator className="my-6" />}

            {boughtItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="text-green-500 h-5 w-5" /> Already Bought ({boughtItems.length})</h3>
                <ul className="space-y-3">
                  {boughtItems.map((item) => (
                     <li key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Checkbox id={`item-${item.id}`} defaultChecked disabled />
                        <div>
                          <label htmlFor={`item-${item.id}`} className="font-medium line-through text-muted-foreground">{item.ingredientName}</label>
                          <p className="text-sm text-muted-foreground line-through">
                            {item.quantity} {item.unit || ''} (For: {item.recipeNames.join(', ')})
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Dummy Link component for type checking, as next/link is used above
const Link = ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
  <a href={href} {...props}>{children}</a>
);
