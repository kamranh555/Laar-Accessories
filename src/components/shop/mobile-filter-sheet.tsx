"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductFilters } from "@/components/shop/product-filters";
import type { Category } from "@/types/product";

interface MobileFilterSheetProps {
  categories: Category[];
  maxPrice?: number;
}

export function MobileFilterSheet({
  categories,
  maxPrice,
}: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        }
      />
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-lg text-brown">
            Filters
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <ProductFilters categories={categories} maxPrice={maxPrice} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
