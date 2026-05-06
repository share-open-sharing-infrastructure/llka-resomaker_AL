"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Item, STATUS_LABELS, isAvailable } from "@/lib/types/item";
import { getThumbnailUrl } from "@/lib/api/client";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";

interface ItemDetailProps {
  item: Item;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function ItemDetail({ item }: ItemDetailProps) {
  const config = useConfig();
  const { addItem, removeItem, isInCart } = useCart();
  const inCart = isInCart(item.id);
  const available = isAvailable(item.status);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const name = stripHtml(item.name);
  const description = item.description ? stripHtml(item.description) : null;
  const hasImages = item.images.length > 0;
  const currentImage = hasImages
    ? getThumbnailUrl(item.id, item.images[currentImageIndex], "1024x1024")
    : null;

  const handleToggleCart = () => {
    if (inCart) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + item.images.length) % item.images.length
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Image Gallery */}
      <div className="space-y-4">
        <Card className="relative aspect-square overflow-hidden">
          {currentImage ? (
            <>
              <Image
                src={currentImage}
                alt={name}
                fill
                className={`object-contain ${!available ? "grayscale opacity-70" : ""}`}
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
                priority
              />
              {item.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
              Kein Bild vorhanden
            </div>
          )}
          {config.features.itemIds && (
            <Badge className="absolute top-4 left-4 text-xl font-bold px-4 py-2">
              #{item.iid}
            </Badge>
          )}
          {!available && (
            <Badge
              variant="destructive"
              className="absolute top-4 right-4 text-sm px-3 py-1"
            >
              {STATUS_LABELS[item.status]}
            </Badge>
          )}
        </Card>

        {/* Thumbnails */}
        {item.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {item.images.map((img, index) => (
              <button
                key={img}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                  index === currentImageIndex
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground"
                }`}
              >
                <Image
                  src={getThumbnailUrl(item.id, img, "128x128")}
                  alt={`${name} - Bild ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          {item.category && item.category.length > 0 && (
            <p className="text-lg text-muted-foreground mt-1">{item.category.join(', ')}</p>
          )}
        </div>

        {description && (
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        )}

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          {item.brand && (
            <div>
              <p className="text-sm text-muted-foreground">Marke</p>
              <p className="font-medium">{item.brand}</p>
            </div>
          )}
          {item.model && (
            <div>
              <p className="text-sm text-muted-foreground">Modell</p>
              <p className="font-medium">{item.model}</p>
            </div>
          )}
          {config.features.copies && item.copies > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Verfügbare Exemplare</p>
              <p className="font-medium">{item.copies}</p>
            </div>
          )}
          {item.parts > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Teile</p>
              <p className="font-medium">{item.parts}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          {config.features.deposit && item.deposit > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Kaution</p>
              <p className="text-3xl font-bold">{item.deposit}{config.display.currency} </p>
            </div>
          )}

          {available ? (
            <Button
              size="lg"
              variant={inCart ? "secondary" : "default"}
              onClick={handleToggleCart}
              className="flex-1 sm:flex-none"
            >
              {inCart ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Im Ausleihkorb
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Ausleihen
                </>
              )}
            </Button>
          ) : (
            <div className="text-right">
              <Badge variant="destructive" className="text-base px-4 py-2">
                {STATUS_LABELS[item.status]}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Dieser Gegenstand ist derzeit nicht verfügbar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
