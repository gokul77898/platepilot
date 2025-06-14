
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import type { ShoppingListItem } from '@/types';
import { ShoppingCart, Download, Send, CheckCircle, Circle, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage, generateId } from '@/lib/localStorage';
import { useToast } from "@/hooks/use-toast";

const SHOPPING_LIST_STORAGE_KEY = 'shoppingList';

const shoppingItemFormSchema = z.object({
  name: z.string().min(1, "Item name is required."),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});
type ShoppingItemFormValues = z.infer<typeof shoppingItemFormSchema>;

export default function ShoppingListPage() {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<ShoppingItemFormValues>({
    resolver: zodResolver(shoppingItemFormSchema),
    defaultValues: { name: "", quantity: "", unit: "", notes: "" },
  });

  const fetchShoppingList = useCallback(() => {
    setIsLoading(true);
    const storedList = loadFromLocalStorage<ShoppingListItem[]>(SHOPPING_LIST_STORAGE_KEY, []);
    setShoppingList(storedList);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchShoppingList();
  }, [fetchShoppingList]);

  const handleAddItem: SubmitHandler<ShoppingItemFormValues> = (data) => {
    const newItem: ShoppingListItem = {
      id: generateId(),
      name: data.name,
      quantity: data.quantity || '1',
      unit: data.unit || '',
      notes: data.notes || '',
      isBought: false,
      createdAt: new Date().toISOString(),
    };
    const updatedList = [...shoppingList, newItem];
    saveToLocalStorage(SHOPPING_LIST_STORAGE_KEY, updatedList);
    setShoppingList(updatedList);
    toast({ title: "Item Added", description: `${data.name} added to your shopping list.` });
    form.reset();
  };

  const handleToggleBought = (itemId: string) => {
    const updatedList = shoppingList.map(item =>
      item.id === itemId ? { ...item, isBought: !item.isBought } : item
    );
    saveToLocalStorage(SHOPPING_LIST_STORAGE_KEY, updatedList);
    setShoppingList(updatedList);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedList = shoppingList.filter(item => item.id !== itemId);
    saveToLocalStorage(SHOPPING_LIST_STORAGE_KEY, updatedList);
    setShoppingList(updatedList);
    toast({ title: "Item Removed", description: "The item has been removed from your list." });
  };
  
  const handleClearBoughtItems = () => {
    const activeItems = shoppingList.filter(item => !item.isBought);
    saveToLocalStorage(SHOPPING_LIST_STORAGE_KEY, activeItems);
    setShoppingList(activeItems);
    toast({ title: "Bought Items Cleared", description: "All purchased items have been removed from the list." });
  };


  const activeItems = shoppingList.filter(item => !item.isBought);
  const boughtItems = shoppingList.filter(item => item.isBought);

   if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading shopping list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Shopping List"
        description="Manage your grocery items manually."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => alert("Export feature coming soon!")}><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => alert("Share feature coming soon!")}><Send className="mr-2 h-4 w-4" /> Share</Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddItem)}>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Item Name</FormLabel> <FormControl><Input placeholder="e.g., Apples" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="quantity" render={({ field }) => ( <FormItem> <FormLabel>Quantity</FormLabel> <FormControl><Input placeholder="e.g., 6" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="unit" render={({ field }) => ( <FormItem> <FormLabel>Unit</FormLabel> <FormControl><Input placeholder="e.g., pcs, kg" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem className="md:col-span-4"> <FormLabel>Notes (Optional)</FormLabel> <FormControl><Input placeholder="e.g., Organic, specific brand" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90"> <PlusCircle className="mr-2 h-4 w-4" /> Add to List </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>


      {shoppingList.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Shopping List is Empty</h3>
            <p className="mt-1 text-muted-foreground">Add items using the form above.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Grocery Items</CardTitle>
          </CardHeader>
          <CardContent>
            {activeItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Circle className="text-primary h-5 w-5" /> To Buy ({activeItems.length})</h3>
                <ul className="space-y-3">
                  {activeItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Checkbox id={`item-${item.id}`} checked={item.isBought} onCheckedChange={() => handleToggleBought(item.id)} />
                        <div>
                          <label htmlFor={`item-${item.id}`} className="font-medium cursor-pointer">{item.name}</label>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit || ''} {item.notes && `- ${item.notes}`}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeItems.length > 0 && boughtItems.length > 0 && <Separator className="my-6" />}

            {boughtItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="text-green-500 h-5 w-5" /> Already Bought ({boughtItems.length})</h3>
                    <Button variant="outline" size="sm" onClick={handleClearBoughtItems} disabled={boughtItems.length === 0}>Clear Bought Items</Button>
                </div>
                <ul className="space-y-3">
                  {boughtItems.map((item) => (
                     <li key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border group">
                      <div className="flex items-center gap-3">
                        <Checkbox id={`item-${item.id}`} checked={item.isBought} onCheckedChange={() => handleToggleBought(item.id)} />
                        <div>
                          <label htmlFor={`item-${item.id}`} className="font-medium line-through text-muted-foreground cursor-pointer">{item.name}</label>
                          <p className="text-sm text-muted-foreground line-through">
                            {item.quantity} {item.unit || ''} {item.notes && `- ${item.notes}`}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
