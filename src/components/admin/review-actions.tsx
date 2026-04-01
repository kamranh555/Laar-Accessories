"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveReview, deleteReview } from "@/lib/actions/admin";
import { Check, Trash2 } from "lucide-react";

export function ApproveButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveReview(reviewId);
      if (result.success) {
        toast.success("Review approved");
      } else {
        toast.error("Failed to approve review");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleApprove}
      disabled={isPending}
    >
      <Check className="size-3.5" />
      {isPending ? "Approving..." : "Approve"}
    </Button>
  );
}

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Delete this review? This cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteReview(reviewId);
      if (result.success) {
        toast.success("Review deleted");
      } else {
        toast.error("Failed to delete review");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="size-3.5 text-destructive" />
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
