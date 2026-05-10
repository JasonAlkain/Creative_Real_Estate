"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  photos: string[];
  address: string;
}

export function PhotoGallery({ photos, address }: PhotoGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (!photos.length) {
    return (
      <div className="w-full aspect-video bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm">
        No photos available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
        <Image
          src={photos[selected]}
          alt={`${address} — photo ${selected + 1} of ${photos.length}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority={selected === 0}
        />
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "relative shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-muted transition-opacity",
                i === selected
                  ? "ring-2 ring-primary opacity-100"
                  : "opacity-60 hover:opacity-90"
              )}
              aria-label={`Photo ${i + 1}`}
            >
              <Image
                src={photo}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
