"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item } from "@/lib/types/item";
import { getThumbnailUrl } from "@/lib/api/client";
import { useConfig } from "@/context/config-context";
import { useCart } from "@/context/cart-context";

interface CartSummaryProps {
  items: Item[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function CartSummary({ items }: CartSummaryProps) {
  const config = useConfig();
  const { getQuantity, setQuantity } = useCart();
  const totalDeposit = items.reduce((sum, item) => sum + item.deposit * (getQuantity(item.id)), 0);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <h3 className="font-semibold">
        Deine Ausleihe ({items.length}{" "}
        {items.length === 1 ? "Gegenstand" : "Gegenstände"})
      </h3>

      <div className="space-y-3">
        {items.map((item) => {
          const imageUrl =
            item.images.length > 0 ? getThumbnailUrl(item.id, item.images[0], "40x40f") : null;
          const name = stripHtml(item.name);
          const qty = getQuantity(item.id);
          const maxCopies = item.available_copies ?? item.copies;
          const showStepper = item.copies > 1;

          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="48px"
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
                {showStepper && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => setQuantity(item.id, Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                      aria-label="Weniger"
                    >
                      <Minus className="h-2.5 w-2.5" />
                    </Button>
                    <span className="w-5 text-center text-xs font-medium">{qty}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => setQuantity(item.id, Math.min(maxCopies, qty + 1))}
                      disabled={qty >= maxCopies}
                      aria-label="Mehr"
                    >
                      <Plus className="h-2.5 w-2.5" />
                    </Button>
                    <span className="text-xs text-muted-foreground">Exemplare</span>
                  </div>
                )}
              </div>
              {config.features.deposit && item.deposit > 0 && (
                <Badge variant="secondary" className="shrink-0">
                  Kaution: {item.deposit * qty}{config.display.currency}
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
