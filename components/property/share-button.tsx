"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/supabase/user";
import { createShareLink } from "@/app/actions/share";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface ShareButtonProps {
  propertyId: string;
  propertyPath: string;
}

export function ShareButton({ propertyId, propertyPath }: ShareButtonProps) {
  const user = useUser();
  const [loginOpen, setLoginOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleShare() {
    if (!user) { setLoginOpen(true); return; }
    setIsPending(true);
    try {
      const { slug } = await createShareLink(propertyId);
      const url = `${window.location.origin}/s/${slug}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to create share link");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Log in to share properties</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Log in to generate a shareable link you can send to friends.
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

      <Button
        variant="outline"
        className="w-full"
        onClick={handleShare}
        disabled={isPending}
      >
        <Share2 size={14} className="mr-1.5" />
        {isPending ? "Creating link…" : "Share"}
      </Button>
    </>
  );
}
