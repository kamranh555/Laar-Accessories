"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TARGET_AUDIENCES } from "@/lib/constants";
import { X } from "lucide-react";
import type { Category } from "@/types/product";

interface ProductFiltersProps {
  categories: Category[];
  maxPrice?: number;
}

export function ProductFilters({
  categories,
  maxPrice = 1000000,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const currentCategory = searchParams.get("category");
  const currentAudience = searchParams.get("audience");
  const currentMinPrice = Number(searchParams.get("min_price")) || 0;
  const currentMaxPrice =
    Number(searchParams.get("max_price")) || maxPrice / 100;

  const hasFilters =
    currentCategory || currentAudience || searchParams.has("min_price");

  function clearAll() {
    router.push(window.location.pathname, { scroll: false });
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-brown">
          Filters
        </h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs text-muted-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <Accordion
        defaultValue={[0, 1, 2]}
        className="w-full"
      >
        {/* Audience */}
        <AccordionItem>
          <AccordionTrigger className="text-sm font-medium">
            Audience
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {TARGET_AUDIENCES.map((audience) => (
                <label
                  key={audience}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    checked={currentAudience === audience}
                    onCheckedChange={(checked) =>
                      updateFilter("audience", checked ? audience : null)
                    }
                  />
                  <span className="text-sm capitalize">{audience}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Category */}
        <AccordionItem>
          <AccordionTrigger className="text-sm font-medium">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    checked={currentCategory === cat.slug}
                    onCheckedChange={(checked) =>
                      updateFilter("category", checked ? cat.slug : null)
                    }
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem>
          <AccordionTrigger className="text-sm font-medium">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-1">
              <Slider
                defaultValue={[currentMinPrice, currentMaxPrice]}
                max={maxPrice / 100}
                min={0}
                step={100}
                onValueCommitted={(value: number | readonly number[]) => {
                  const v = Array.isArray(value) ? value : [value];
                  updateFilter("min_price", String(v[0]));
                  updateFilter("max_price", String(v[1]));
                }}
                className="mt-2"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>PKR {currentMinPrice.toLocaleString()}</span>
                <span>PKR {currentMaxPrice.toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size */}
        
      </Accordion>
    </div>
  );
}
