"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateOrderStatus,
  updateTrackingNumber,
  updatePaymentStatus,
} from "@/lib/actions/admin";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-red-100 text-red-800",
};

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export function StatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleUpdate() {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      if (result.success) {
        toast.success("Order status updated successfully");
      } else {
        toast.error(result.error || "Failed to update order status");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-brown">Order Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current:</span>
          <Badge
            className={statusColors[currentStatus] || "bg-gray-100 text-gray-800"}
          >
            {currentStatus}
          </Badge>
        </div>
        <div className="space-y-2">
          <Label>Update Status</Label>
          <Select
            value={status}
            onValueChange={(val: string | null) => {
              if (val) setStatus(val);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleUpdate}
          disabled={isPending || status === currentStatus}
        >
          {isPending ? "Updating..." : "Update Status"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function TrackingUpdater({
  orderId,
  currentTracking,
}: {
  orderId: string;
  currentTracking: string | null;
}) {
  const [tracking, setTracking] = useState(currentTracking || "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateTrackingNumber(orderId, tracking);
      if (result.success) {
        toast.success("Tracking number saved");
      } else {
        toast.error("Failed to save tracking number");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-brown">Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tracking Number</Label>
          <Input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Enter tracking number"
          />
        </div>
        <Button onClick={handleSave} disabled={isPending || !tracking}>
          {isPending ? "Saving..." : "Save Tracking"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function PaymentUpdater({
  orderId,
  currentPaymentMethod,
  currentPaymentStatus,
  currentPaymentReference,
}: {
  orderId: string;
  currentPaymentMethod: string;
  currentPaymentStatus: string;
  currentPaymentReference: string | null;
}) {
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [reference, setReference] = useState(currentPaymentReference || "");
  const [isPending, startTransition] = useTransition();

  function handleUpdate() {
    startTransition(async () => {
      const result = await updatePaymentStatus(
        orderId,
        paymentStatus,
        reference || undefined
      );
      if (result.success) {
        toast.success("Payment status updated");
      } else {
        toast.error("Failed to update payment status");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-brown">Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Method:</span>
          <span className="text-sm font-medium capitalize">
            {currentPaymentMethod}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge
            className={
              paymentStatusColors[currentPaymentStatus] ||
              "bg-gray-100 text-gray-800"
            }
          >
            {currentPaymentStatus}
          </Badge>
        </div>
        {currentPaymentReference && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Reference:</span>
            <span className="text-sm font-mono">{currentPaymentReference}</span>
          </div>
        )}
        <div className="space-y-2">
          <Label>Update Payment Status</Label>
          <Select
            value={paymentStatus}
            onValueChange={(val: string | null) => {
              if (val) setPaymentStatus(val);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Payment Reference (optional)</Label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. transaction ID"
          />
        </div>
        <Button
          onClick={handleUpdate}
          disabled={isPending || paymentStatus === currentPaymentStatus}
        >
          {isPending ? "Updating..." : "Update Payment"}
        </Button>
      </CardContent>
    </Card>
  );
}
