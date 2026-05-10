"use client";

import { useState, useRef, useCallback } from "react";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/supabase/user";
import {
  toggleSaved,
  updateSavedStatus,
  updateSavedNotes,
  removeSaved,
} from "@/app/actions/saved";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SAVED_STATUSES, STATUS_LABELS, STATUS_COLORS } from "@/lib/saved-status";
import type { SavedStatus } from "@/types";
import Link from "next/link";

interface SaveButtonProps {
  propertyId: string;
  initialSaved: boolean;
  initialStatus: SavedStatus | null;
  initialNotes?: string | null;
  savedAt?: string | null;
  variant: "card" | "detail";
  propertyPath: string;
}

export function SaveButton({
  propertyId,
  initialSaved,
  initialStatus,
  initialNotes,
  savedAt,
  variant,
  propertyPath,
}: SaveButtonProps) {
  const user = useUser();
  const [saved, setSaved] = useState(initialSaved);
  const [status, setStatus] = useState<SavedStatus | null>(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isPending, setIsPending] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleToggle = useCallback(async () => {
    if (!user) { setLoginOpen(true); return; }
    if (saved) { setEditorOpen(true); return; }

    setIsPending(true);
    setSaved(true);
    setStatus("new");
    try {
      await toggleSaved(propertyId);
    } catch {
      setSaved(false);
      setStatus(null);
      toast.error("Failed to save property");
    } finally {
      setIsPending(false);
    }
  }, [user, saved, propertyId]);

  const handleUnsave = useCallback(async () => {
    setEditorOpen(false);
    setIsPending(true);
    setSaved(false);
    setStatus(null);
    try {
      await removeSaved(propertyId);
    } catch {
      setSaved(true);
      setStatus(initialStatus);
      toast.error("Failed to remove property");
    } finally {
      setIsPending(false);
    }
  }, [propertyId, initialStatus]);

  const handleStatusChange = useCallback(
    async (newStatus: SavedStatus) => {
      const prev = status;
      setStatus(newStatus);
      try {
        await updateSavedStatus(propertyId, newStatus);
      } catch {
        setStatus(prev);
        toast.error("Failed to update status");
      }
    },
    [propertyId, status]
  );

  const handleNotesBlur = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await updateSavedNotes(propertyId, notes);
      } catch {
        toast.error("Failed to save notes");
      }
    }, 500);
  }, [propertyId, notes]);

  const loginDialog = (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Log in to save properties</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Create a free account to save listings and track your favorite creative
          financing properties.
        </p>
        <DialogFooter>
          <Link
            href={`/login?next=${encodeURIComponent(propertyPath)}`}
            className={buttonVariants()}
            onClick={() => setLoginOpen(false)}
          >
            Log in
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const statusEditor = (
    <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Saved property</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={status ?? "new"}
              onValueChange={(v) => handleStatusChange(v as SavedStatus)}
            >
              <SelectTrigger className="w-full">
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
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Your private notes about this property…"
              rows={3}
            />
          </div>
          {savedAt && (
            <p className="text-xs text-muted-foreground">
              Saved{" "}
              {new Date(savedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <DialogFooter showCloseButton={false}>
          <button
            onClick={handleUnsave}
            className="text-xs text-destructive hover:underline mr-auto"
          >
            Remove from saved
          </button>
          <Button onClick={() => setEditorOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (variant === "card") {
    return (
      <>
        {loginDialog}
        {statusEditor}
        <button
          onClick={handleToggle}
          disabled={isPending}
          aria-label={saved ? "Remove from saved" : "Save property"}
          className="bg-background/80 backdrop-blur rounded-full p-1.5 transition-colors hover:bg-background disabled:opacity-50"
        >
          <Heart
            size={14}
            className={
              saved
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground"
            }
          />
        </button>
      </>
    );
  }

  // Detail variant
  if (!user) {
    return (
      <>
        {loginDialog}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setLoginOpen(true)}
        >
          <Heart size={14} className="mr-1.5" />
          Save Property
        </Button>
      </>
    );
  }

  if (!saved) {
    return (
      <Button
        variant="outline"
        className="w-full"
        onClick={handleToggle}
        disabled={isPending}
      >
        <Heart size={14} className="mr-1.5" />
        Save Property
      </Button>
    );
  }

  // Detail: saved state — show full editor card
  return (
    <>
      {statusEditor}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Heart size={14} className="fill-red-500 text-red-500" />
            Saved
          </div>
          <button
            onClick={() => setEditorOpen(true)}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Edit
          </button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={status ?? "new"}
            onValueChange={(v) => handleStatusChange(v as SavedStatus)}
          >
            <SelectTrigger className="w-full h-8 text-sm">
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
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Your private notes…"
            className="text-sm resize-none"
            rows={3}
          />
        </div>

        {savedAt && (
          <p className="text-xs text-muted-foreground">
            Saved{" "}
            {new Date(savedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        <button
          onClick={handleUnsave}
          disabled={isPending}
          className="text-xs text-destructive hover:underline disabled:opacity-50"
        >
          Remove from saved
        </button>
      </div>
    </>
  );
}
