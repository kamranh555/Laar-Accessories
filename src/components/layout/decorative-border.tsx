import { cn } from "@/lib/utils";

interface DecorativeBorderProps {
  className?: string;
  variant?: "horizontal" | "vertical";
}

export function DecorativeBorder({
  className,
  variant = "horizontal",
}: DecorativeBorderProps) {
  if (variant === "horizontal") {
    return <div className={cn("w-full border-t border-border", className)} aria-hidden="true" />;
  }
  return <div className={cn("h-full border-l border-border", className)} aria-hidden="true" />;
}
