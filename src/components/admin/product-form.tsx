"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/lib/actions/admin";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    categoryId: string | null;
    targetAudience: string;
    sku: string | null;
    stockQuantity: number;
    isActive: boolean | null;
    isFeatured: boolean | null;
  };
  categories: { id: string; name: string }[];
}

type ActionResult = { success: boolean; id?: string; error?: string } | null;

async function handleCreate(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return createProduct(formData);
}

async function handleUpdate(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = formData.get("id") as string;
  return updateProduct(id, formData);
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [targetAudience, setTargetAudience] = useState(product?.targetAudience ?? "unisex");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isPending, startTransition] = useTransition();

  const actionFn = isEditing ? handleUpdate : handleCreate;
  const [state, formAction] = useActionState(actionFn, null);

  // Handle action result
  useEffect(() => {
    if (!state) return;

    if (state.success) {
      if (isEditing) {
        toast.success("Product updated successfully");
      } else {
        toast.success("Product created successfully");
        router.push("/admin/products");
      }
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, isEditing, router]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(slugify(name));
    }
  }, [name, slugManuallyEdited]);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManuallyEdited(true);
    setSlug(e.target.value);
  }

  return (
    <form
      action={(formData) => {
        // Append client-side state fields to formData
        formData.set("categoryId", categoryId);
        formData.set("targetAudience", targetAudience);
        formData.set("isActive", String(isActive));
        formData.set("isFeatured", String(isFeatured));

        startTransition(() => {
          formAction(formData);
        });
      }}
    >
      {isEditing && <input type="hidden" name="id" value={product.id} />}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main form fields - left 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="product-slug"
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier. Auto-generated from name.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description ?? ""}
                  placeholder="Product description..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (PKR) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={product ? product.price / 100 : ""}
                    placeholder="0"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter price in Rupees
                  </p>
                </div>

                {/* Compare At Price */}
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare At Price (PKR)</Label>
                  <Input
                    id="compareAtPrice"
                    name="compareAtPrice"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={
                      product?.compareAtPrice
                        ? product.compareAtPrice / 100
                        : ""
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Original price for showing a discount
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - sidebar fields */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Active toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked)}
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => setCategoryId(value ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={targetAudience}
                  onValueChange={(value) =>
                    setTargetAudience(value ?? "unisex")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={product?.sku ?? ""}
                  placeholder="SKU-001"
                />
              </div>

              {/* Stock Quantity */}
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={product?.stockQuantity ?? 0}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit button */}
      <div className="mt-6 flex items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Product"
              : "Create Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
