
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { PantryItem } from '@/types';
import { Archive, PlusCircle, Edit3, Trash2, CalendarIcon, Loader2 } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage, generateId } from '@/lib/localStorage';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const PANTRY_STORAGE_KEY = 'pantryItems';

const pantryItemCategories = ["Produce", "Dairy", "Meat", "Seafood", "Pantry Staples", "Spices", "Frozen", "Beverages", "Other"] as const;

const pantryItemFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Item name is required."),
  quantity: z.string().min(1, "Quantity is required."),
  unit: z.string().optional(),
  category: z.enum(pantryItemCategories).optional(),
  expiryDate: z.date().optional(),
  notes: z.string().optional(),
});
type PantryItemFormValues = z.infer<typeof pantryItemFormSchema>;

export default function PantryPage() {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const { toast } = useToast();

  const form = useForm<PantryItemFormValues>({
    resolver: zodResolver(pantryItemFormSchema),
    defaultValues: { name: "", quantity: "", unit: "", category: undefined, expiryDate: undefined, notes: "" },
  });

  const fetchPantryItems = useCallback(() => {
    setIsLoading(true);
    const storedItems = loadFromLocalStorage<PantryItem[]>(PANTRY_STORAGE_KEY, []);
    setPantryItems(storedItems.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))); // Sort by name
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPantryItems();
  }, [fetchPantryItems]);

  const handleFormSubmit: SubmitHandler<PantryItemFormValues> = (data) => {
    const newItemData = {
      ...data,
      expiryDate: data.expiryDate ? format(data.expiryDate, 'yyyy-MM-dd') : undefined,
      createdAt: new Date().toISOString(),
    };

    let updatedItems;
    if (editingItem) {
      updatedItems = pantryItems.map(item =>
        item.id === editingItem.id ? { ...item, ...newItemData, id: editingItem.id, updatedAt: new Date().toISOString() } : item
      );
      toast({ title: "Item Updated", description: `${data.name} updated in your pantry.` });
    } else {
      const newItem: PantryItem = { ...newItemData, id: generateId() };
      updatedItems = [...pantryItems, newItem];
      toast({ title: "Item Added", description: `${data.name} added to your pantry.` });
    }
    
    updatedItems.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    saveToLocalStorage(PANTRY_STORAGE_KEY, updatedItems);
    setPantryItems(updatedItems);
    form.reset();
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = pantryItems.filter(item => item.id !== itemId);
    saveToLocalStorage(PANTRY_STORAGE_KEY, updatedItems);
    setPantryItems(updatedItems);
    toast({ title: "Item Removed", description: "The item has been removed from your pantry." });
  };

  const openEditForm = (item: PantryItem) => {
    setEditingItem(item);
    form.reset({
      ...item,
      expiryDate: item.expiryDate ? parseISO(item.expiryDate) : undefined,
    });
    setIsFormOpen(true);
  };
  
  const openNewForm = () => {
    setEditingItem(null);
    form.reset({ name: "", quantity: "", unit: "", category: undefined, expiryDate: undefined, notes: "" });
    setIsFormOpen(true);
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading pantry items...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Pantry Inventory"
        description="Manage the ingredients you have on hand."
        actions={
          !isFormOpen && (
            <Button className="bg-primary hover:bg-primary/90" onClick={openNewForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          )
        }
      />

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? "Edit Pantry Item" : "Add New Pantry Item"}</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Item Name</FormLabel> <FormControl><Input placeholder="e.g., Rice" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl> <SelectContent> {pantryItemCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="quantity" render={({ field }) => ( <FormItem> <FormLabel>Quantity</FormLabel> <FormControl><Input placeholder="e.g., 1" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="unit" render={({ field }) => ( <FormItem> <FormLabel>Unit</FormLabel> <FormControl><Input placeholder="e.g., kg, pack" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="expiryDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Expiry Date (Optional)</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} > {field.value ? format(field.value, "PPP") : <span>Pick a date</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem> <FormLabel>Notes (Optional)</FormLabel> <FormControl><Textarea placeholder="Any specific notes about this item..." {...field} rows={2} /></FormControl> <FormMessage /> </FormItem> )} />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingItem(null); form.reset(); }}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90"> {editingItem ? "Save Changes" : "Add Item"} </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}

      {!isFormOpen && pantryItems.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Archive className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-6 text-2xl font-semibold">Your Pantry is Empty</h3>
            <p className="mt-2 text-muted-foreground">Start adding items to your pantry to keep track of what you have.</p>
            <Button className="mt-6 bg-primary hover:bg-primary/90" onClick={openNewForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Item
            </Button>
          </CardContent>
        </Card>
      )}

      {!isFormOpen && pantryItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Pantry Items</CardTitle>
            <CardDescription>Currently you have {pantryItems.length} item(s) in your pantry.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pantryItems.map((item) => (
                <Card key={item.id} className="p-4 flex justify-between items-center bg-muted/30 hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} {item.unit || ''}
                      {item.category && ` • Category: ${item.category}`}
                    </p>
                    {item.expiryDate && (
                      <p className={cn("text-xs", new Date(item.expiryDate) < new Date() ? "text-red-500 font-medium" : "text-muted-foreground")}>
                        Expires: {format(parseISO(item.expiryDate), 'PPP')}
                         {new Date(item.expiryDate) < new Date() && " (Expired)"}
                      </p>
                    )}
                     {item.notes && <p className="text-xs text-muted-foreground italic">Notes: {item.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditForm(item)} title="Edit Item">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Delete Item">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete "{item.name}" from your pantry.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteItem(item.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
