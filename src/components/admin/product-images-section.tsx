"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { addProductImage, deleteProductImage } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Trash2, Upload } from "lucide-react";

interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  displayOrder: number | null;
  isPrimary: boolean | null;
}

interface ProductImagesSectionProps {
  productId: string;
  images: ProductImage[];
}

export function ProductImagesSection({
  productId,
  images,
}: ProductImagesSectionProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [altText, setAltText] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);

    try {
      // Upload the file
      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await uploadRes.json();

      // Add the image to the product
      startTransition(async () => {
        const result = await addProductImage(
          productId,
          url,
          altText,
          isPrimary
        );

        if (result.success) {
          toast.success("Image added successfully");
          setAltText("");
          setIsPrimary(false);
          form.reset();
          router.refresh();
        } else {
          toast.error("Failed to add image");
        }
      });
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  function handleDeleteImage(imageId: string) {
    startTransition(async () => {
      const result = await deleteProductImage(imageId);
      if (result.success) {
        toast.success("Image deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete image");
      }
    });
  }

  return (
    <div>
      <h2 className="font-serif text-xl font-bold text-brown">Images</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage product images
      </p>

      {/* Existing images */}
      {images.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <Card key={image.id}>
              <CardContent className="relative p-2">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={image.url}
                    alt={image.altText || "Product image"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {image.isPrimary && (
                      <Badge className="bg-amber-100 text-amber-800">
                        Primary
                      </Badge>
                    )}
                    {image.altText && (
                      <span className="truncate text-xs text-muted-foreground">
                        {image.altText}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload form */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImagePlus className="h-4 w-4" />
            Add Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageFile">Image File</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="altText">Alt Text</Label>
              <Input
                id="altText"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image..."
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPrimary">Set as primary image</Label>
              <Switch
                id="isPrimary"
                checked={isPrimary}
                onCheckedChange={(checked) => setIsPrimary(checked)}
              />
            </div>

            <Button type="submit" disabled={isUploading || isPending}>
              <Upload className="size-4" />
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
