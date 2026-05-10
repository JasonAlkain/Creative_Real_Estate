"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteShareLink } from "@/app/actions/share";

type ShareLinkRow = {
  id: string;
  slug: string;
  created_at: string;
  property: { id: string; address: string; photos: string[] } | null;
};

export function ShareLinksSection({ links }: { links: ShareLinkRow[] }) {
  const [items, setItems] = useState(links);

  async function handleCopy(slug: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`);
    toast.success("Link copied");
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteShareLink(id);
    } catch {
      setItems(links);
      toast.error("Failed to delete link");
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No share links yet. Use the Share button on any property.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((link) => (
        <div
          key={link.id}
          className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {link.property?.address ?? "Unknown property"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              /s/{link.slug} ·{" "}
              {new Date(link.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => handleCopy(link.slug)}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Copy link"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => handleDelete(link.id)}
            className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
            aria-label="Delete link"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
