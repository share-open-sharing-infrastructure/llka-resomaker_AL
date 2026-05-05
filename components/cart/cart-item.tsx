"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Item } from "@/lib/types/item";
import { getThumbnailUrl } from "@/lib/api/client";

interface CartItemProps {
  item: Item;
  onRemove: (itemId: string) => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function CartItem({ item, onRemove }: CartItemProps) {
  const imageUrl =
    item.images.length > 0 ? getThumbnailUrl(item.id, item.images[0], "100x100") : null;
  const name = stripHtml(item.name);

  return (
    <div className="flex items-start gap-4 py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="80px"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="text-xs">Kein Bild</span>
          </div>
        )}
        <Badge className="absolute -top-1 -left-1 text-xs px-1.5 py-0.5">
          #{item.iid}
        </Badge>
      </div>

      <div className="flex-1 min-w-0 py-1">
        <h4 className="font-medium leading-tight">{name}</h4>
        {item.category && item.category.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">{item.category.join(', ')}</p>
        )}
        {item.deposit > 0 && (
          <p className="text-sm font-medium mt-1">{item.deposit}&euro;</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(item.id)}
        aria-label={`${name} entfernen`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
