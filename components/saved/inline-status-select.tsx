"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateSavedStatus } from "@/app/actions/saved";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SAVED_STATUSES, STATUS_LABELS } from "@/lib/saved-status";
import type { SavedStatus } from "@/types";

export function InlineStatusSelect({
  propertyId,
  currentStatus,
}: {
  propertyId: string;
  currentStatus: SavedStatus;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, setIsPending] = useState(false);

  async function handleChange(value: string | null) {
    if (!value) return;
    const newStatus = value as SavedStatus;
    const prev = status;
    setStatus(newStatus);
    setIsPending(true);
    try {
      await updateSavedStatus(propertyId, newStatus);
    } catch {
      setStatus(prev);
      toast.error("Failed to update status");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger size="sm" className="w-40 h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SAVED_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
