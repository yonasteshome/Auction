"use client";

import { useState, useTransition } from "react";
import { Button } from "@repo/ui/components/button";
import { ShoppingBasket, Plus, Minus, Check } from "lucide-react";
import { toast } from "sonner";
import { addToShoppingList } from "@/actions/shopping-list";

interface ShoppingListQuickAddProps {
  itemId: string;
  unit: string;
}

export function ShoppingListQuickAdd({ itemId, unit }: ShoppingListQuickAddProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    startTransition(async () => {
      const result = await addToShoppingList(itemId, quantity, unit);
      if (result.success) {
        toast.success(`Added ${quantity} ${unit} to shopping list`);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } else {
        toast.error(result.message || "Failed to add to shopping list");
      }
    });
  };

  return (
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 bg-white dark:bg-slate-950 px-2 rounded-lg border border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50"
          disabled={quantity <= 1 || isPending}
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center font-bold text-sm">{quantity}</span>
        <button 
          onClick={() => setQuantity(quantity + 1)}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50"
          disabled={isPending}
        >
          <Plus size={14} />
        </button>
      </div>
      
      <Button 
        onClick={handleAdd}
        disabled={isPending || added}
        className={`rounded-lg h-9 px-4 font-bold text-xs transition-all ${
          added 
            ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
            : "bg-[#135bec] hover:bg-[#0d4fd4] text-white shadow-sm"
        }`}
      >
        {isPending ? (
          <span className="flex items-center gap-2">Adding...</span>
        ) : added ? (
          <span className="flex items-center gap-2"><Check size={14} /> Added</span>
        ) : (
          <span className="flex items-center gap-2"><ShoppingBasket size={14} /> Add to List</span>
        )}
      </Button>
    </div>
  );
}
