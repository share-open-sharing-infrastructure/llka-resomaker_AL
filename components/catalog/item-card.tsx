"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, STATUS_LABELS, isAvailable } from "@/lib/types/item";
import { getImageUrl } from "@/lib/api/client";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";

interface ItemCardProps {
  item: Item;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function ItemCard({ item }: ItemCardProps) {
  const config = useConfig();
  const { addItem, removeItem, isInCart } = useCart();
  const inCart = isInCart(item.id);
  const available = isAvailable(item.status);
  const imageUrl =
    item.images.length > 0 ? getImageUrl(item.id, item.images[0]) : null;

  const handleToggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  const name = stripHtml(item.name);
  const description = item.description ? stripHtml(item.description) : null;

  const cardContent = (
    <Card className={`flex flex-col overflow-hidden gap-0 py-0 transition-shadow hover:shadow-lg ${!available ? "opacity-70" : ""}`}>
      <div className="relative aspect-square bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className={`object-cover ${!available ? "grayscale" : ""}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span>Kein Bild</span>
          </div>
        )}
        {config.features.itemIds && (
          <Badge className="absolute top-2 left-2 text-lg font-bold px-3 py-1">
            #{item.iid}
          </Badge>
        )}
        {config.features.copies && available && item.copies > 1 && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            {item.copies}x verfügbar
          </Badge>
        )}
        {!available && (
          <Badge className="absolute top-2 right-2" variant="destructive">
            {STATUS_LABELS[item.status]}
          </Badge>
        )}
      </div>

      <CardContent className="flex-1 p-4 pb-2">
        <h3 className="font-semibold line-clamp-1">{name}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-10 flex items-center justify-between gap-4">
        {config.features.deposit && item.deposit > 0 && (
          <span className="text-sm font-semibold">
            Kaution: {item.deposit}{config.display.currency}
          </span>
        )}
        {available ? (
          <Button
            variant={inCart ? "secondary" : "default"}
            size="sm"
            className="ml-auto"
            onClick={handleToggleCart}
          >
            {inCart ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Im Ausleihkorb
              </>
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Ausleihen
              </>
            )}
          </Button>
        ) : (
          <span className="ml-auto text-sm text-muted-foreground">
            Nicht verfügbar
          </span>
        )}
      </CardFooter>
    </Card>
  );

  if (config.features.detailPages) {
    return <Link href={`/${item.iid}`}>{cardContent}</Link>;
  }

  return cardContent;
}
