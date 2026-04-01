"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addProductVariant, deleteProductVariant } from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

interface ProductVariant {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  sku: string | null;
  priceOverride: number | null;
  stockQuantity: number;
  isActive: boolean | null;
}

interface ProductVariantsSectionProps {
  productId: string;
  variants: ProductVariant[];
}

export function ProductVariantsSection({
  productId,
  variants,
}: ProductVariantsSectionProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Add variant form state
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [variantSku, setVariantSku] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [priceOverride, setPriceOverride] = useState("");

  function resetForm() {
    setSize("");
    setColor("");
    setColorHex("#000000");
    setVariantSku("");
    setStockQuantity("0");
    setPriceOverride("");
  }

  function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();

    const stock = parseInt(stockQuantity, 10);
    if (isNaN(stock) || stock < 0) {
      toast.error("Stock quantity must be a non-negative number");
      return;
    }

    startTransition(async () => {
      const result = await addProductVariant(productId, {
        size: size || undefined,
        color: color || undefined,
        colorHex: colorHex || undefined,
        sku: variantSku || undefined,
        priceOverride: priceOverride
          ? parseInt(priceOverride, 10) * 100
          : undefined,
        stockQuantity: stock,
      });

      if (result.success) {
        toast.success("Variant added successfully");
        resetForm();
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to add variant");
      }
    });
  }

  function handleDeleteVariant(variantId: string) {
    startTransition(async () => {
      const result = await deleteProductVariant(variantId);
      if (result.success) {
        toast.success("Variant deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete variant");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-brown">Variants</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage product size and color variants
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />
            Add Variant
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Variant</DialogTitle>
              <DialogDescription>
                Create a new size or color variant for this product.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddVariant} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="variantSize">Size</Label>
                  <Input
                    id="variantSize"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. S, M, L, XL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variantColor">Color</Label>
                  <Input
                    id="variantColor"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Red, Blue"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="variantColorHex">Color Hex</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="variantColorHex"
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="h-8 w-12 cursor-pointer p-0.5"
                    />
                    <Input
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variantSku">SKU</Label>
                  <Input
                    id="variantSku"
                    value={variantSku}
                    onChange={(e) => setVariantSku(e.target.value)}
                    placeholder="SKU-001-RED-M"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="variantStock">Stock Quantity *</Label>
                  <Input
                    id="variantStock"
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variantPrice">Price Override (PKR)</Label>
                  <Input
                    id="variantPrice"
                    type="number"
                    min="0"
                    value={priceOverride}
                    onChange={(e) => setPriceOverride(e.target.value)}
                    placeholder="Leave empty to use base price"
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Variant"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Variants Table */}
      <Card className="mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price Override</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No variants yet. Add a variant to offer different sizes or
                    colors.
                  </TableCell>
                </TableRow>
              ) : (
                variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>{variant.size || "--"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {variant.colorHex && (
                          <div
                            className="h-4 w-4 rounded-full border border-border"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                        )}
                        {variant.color || "--"}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {variant.sku || "--"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          variant.stockQuantity === 0
                            ? "font-medium text-destructive"
                            : ""
                        }
                      >
                        {variant.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      {variant.priceOverride
                        ? formatPrice(variant.priceOverride)
                        : "--"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => handleDeleteVariant(variant.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
