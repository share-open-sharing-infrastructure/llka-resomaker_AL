"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Item } from "@/lib/types/item";
import { getThumbnailUrl } from "@/lib/api/client";
import { useConfig } from "@/context/config-context";

interface CartSummaryProps {
  items: Item[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function CartSummary({ items }: CartSummaryProps) {
  const config = useConfig();
  const totalDeposit = items.reduce((sum, item) => sum + item.deposit, 0);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <h3 className="font-semibold">
        Ihre Ausleihe ({items.length}{" "}
        {items.length === 1 ? "Gegenstand" : "Gegenstände"})
      </h3>

      <div className="space-y-3">
        {items.map((item) => {
          const imageUrl =
            item.images.length > 0 ? getThumbnailUrl(item.id, item.images[0], "100x100") : null;
          const name = stripHtml(item.name);

          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                    —
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{name}</p>
                <p className="text-xs text-muted-foreground">#{item.iid}</p>
              </div>
              {config.features.deposit && item.deposit > 0 && (
                <Badge variant="secondary" className="shrink-0">
                  Kaution: {item.deposit}{config.display.currency} 
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {config.features.deposit && totalDeposit > 0 && (
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Gesamtkaution</span>
          <span className="text-lg font-bold">{totalDeposit}{config.display.currency}</span>
        </div>
      )}
    </div>
  );
}
