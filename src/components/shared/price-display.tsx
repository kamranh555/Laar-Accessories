import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
}

export function PriceDisplay({
  price,
  compareAtPrice,
  className,
}: PriceDisplayProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-semibold",
          hasDiscount ? "text-terracotta" : "text-brown"
        )}
      >
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">
          {formatPrice(compareAtPrice)}
        </span>
      )}
      {hasDiscount && (
        <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-xs font-medium text-terracotta">
          -{Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
        </span>
      )}
    </div>
  );
}
