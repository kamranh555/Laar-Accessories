"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
} from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number | null;
  isActive: boolean | null;
  expiresAt: Date | null;
  createdAt: Date | null;
};

function CouponForm({
  coupon,
  onClose,
}: {
  coupon?: Coupon;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState(coupon?.code || "");
  const [discountType, setDiscountType] = useState(
    coupon?.discountType || "percentage"
  );
  const [discountValue, setDiscountValue] = useState(
    String(coupon?.discountValue ?? "")
  );
  const [minOrderAmount, setMinOrderAmount] = useState(
    coupon?.minOrderAmount ? String(coupon.minOrderAmount / 100) : ""
  );
  const [maxUses, setMaxUses] = useState(
    coupon?.maxUses ? String(coupon.maxUses) : ""
  );
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);
  const [expiresAt, setExpiresAt] = useState(
    coupon?.expiresAt
      ? new Date(coupon.expiresAt).toISOString().split("T")[0]
      : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.set("code", code.toUpperCase());
    formData.set("discountType", discountType);
    formData.set("discountValue", discountValue);
    if (minOrderAmount) {
      // Convert rupees to paisa for storage
      formData.set("minOrderAmount", String(Math.round(parseFloat(minOrderAmount) * 100)));
    }
    if (maxUses) {
      formData.set("maxUses", maxUses);
    }
    formData.set("isActive", isActive ? "true" : "false");
    if (expiresAt) {
      formData.set("expiresAt", expiresAt);
    }

    startTransition(async () => {
      const result = coupon
        ? await updateCoupon(coupon.id, formData)
        : await createCoupon(formData);

      if (result.success) {
        toast.success(
          coupon ? "Coupon updated successfully" : "Coupon created successfully"
        );
        onClose();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Code</Label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SUMMER20"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Discount Type</Label>
        <Select
          value={discountType}
          onValueChange={(val: string | null) => {
            if (val) setDiscountType(val);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          Discount Value{" "}
          {discountType === "percentage" ? "(%)" : "(PKR)"}
        </Label>
        <Input
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder={discountType === "percentage" ? "15" : "500"}
          required
          min={1}
        />
      </div>
      <div className="space-y-2">
        <Label>Minimum Order Amount (PKR, optional)</Label>
        <Input
          type="number"
          value={minOrderAmount}
          onChange={(e) => setMinOrderAmount(e.target.value)}
          placeholder="1000"
          min={0}
        />
      </div>
      <div className="space-y-2">
        <Label>Max Uses (optional)</Label>
        <Input
          type="number"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          placeholder="100"
          min={1}
        />
      </div>
      <div className="space-y-2">
        <Label>Expires At (optional)</Label>
        <Input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={isActive} onCheckedChange={setIsActive} />
        <Label>Active</Label>
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? coupon
              ? "Updating..."
              : "Creating..."
            : coupon
              ? "Update Coupon"
              : "Create Coupon"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ActiveToggle({
  couponId,
  isActive,
}: {
  couponId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      const result = await toggleCouponActive(couponId, checked);
      if (result.success) {
        toast.success(checked ? "Coupon activated" : "Coupon deactivated");
      } else {
        toast.error("Failed to update coupon");
      }
    });
  }

  return (
    <Switch
      checked={isActive}
      onCheckedChange={handleToggle}
      disabled={isPending}
      size="sm"
    />
  );
}

function formatDiscountValue(type: string, value: number) {
  if (type === "percentage") {
    return `${value}%`;
  }
  return formatPrice(value * 100);
}

function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(coupon: Coupon) {
    if (
      !window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCoupon(coupon.id);
      if (result.success) {
        toast.success("Coupon deleted");
      } else {
        toast.error(result.error || "Failed to delete coupon");
      }
    });
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brown">
            Coupons
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage discount coupons
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />
            Add Coupon
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Coupon</DialogTitle>
              <DialogDescription>
                Create a new discount coupon.
              </DialogDescription>
            </DialogHeader>
            <CouponForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No coupons yet. Create your first coupon to get started.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt);
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-medium">
                        {coupon.code}
                      </TableCell>
                      <TableCell className="capitalize">
                        {coupon.discountType}
                      </TableCell>
                      <TableCell>
                        {formatDiscountValue(
                          coupon.discountType,
                          coupon.discountValue
                        )}
                      </TableCell>
                      <TableCell>
                        {coupon.minOrderAmount
                          ? formatPrice(coupon.minOrderAmount)
                          : "--"}
                      </TableCell>
                      <TableCell>
                        {coupon.usedCount ?? 0}
                        {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString(
                              "en-PK"
                            )
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {expired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : coupon.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <ActiveToggle
                          couponId={coupon.id}
                          isActive={coupon.isActive ?? false}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditCoupon(coupon)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(coupon)}
                            disabled={isPending}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editCoupon}
        onOpenChange={(open) => {
          if (!open) setEditCoupon(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update coupon details.</DialogDescription>
          </DialogHeader>
          {editCoupon && (
            <CouponForm
              key={editCoupon.id}
              coupon={editCoupon}
              onClose={() => setEditCoupon(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
