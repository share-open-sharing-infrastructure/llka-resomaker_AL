"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Plus, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Item, STATUS_LABELS, isAvailable, getAvailableCopies } from "@/lib/types/item";
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
  const { addItem, removeItem, isInCart, getQuantity, setQuantity } = useCart();
  const inCart = isInCart(item.id);
  const statusAvailable = isAvailable(item.status);
  const availableCopies = getAvailableCopies(item);
  const available = statusAvailable && availableCopies > 0;
  const showQuantitySelector = config.features.copies && availableCopies > 1;
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const name = stripHtml(item.name);
  const description = item.description ? stripHtml(item.description) : null;
  const hasImages = item.images.length > 0;
  const currentImage = hasImages
    ? getThumbnailUrl(item.id, item.images[currentImageIndex], "512x512f")
    : null;

  const handleToggleCart = () => {
    if (inCart) {
      removeItem(item.id);
      setPendingQuantity(1);
    } else {
      addItem(item, pendingQuantity);
    }
  };

  const cartQuantity = getQuantity(item.id);

  const handleQuantityChange = (delta: number) => {
    if (inCart) {
      const next = Math.min(Math.max(1, cartQuantity + delta), availableCopies);
      setQuantity(item.id, next);
    } else {
      setPendingQuantity((prev) => Math.min(Math.max(1, prev + delta), availableCopies));
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
                unoptimized
                className={`object-contain ${!available ? "grayscale opacity-70" : ""}`}
                sizes="(max-width: 1024px) 100vw, 50vw"
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
          {!statusAvailable && (
            <Badge
              variant="destructive"
              className="absolute top-4 right-4 text-sm px-3 py-1"
            >
              {STATUS_LABELS[item.status]}
            </Badge>
          )}
          {statusAvailable && !available && (
            <Badge
              variant="destructive"
              className="absolute top-4 right-4 text-sm px-3 py-1"
            >
              Alle Exemplare ausgeliehen
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
                  src={getThumbnailUrl(item.id, img, "80x80f")}
                  alt={`${name} - Bild ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="64px"
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
              <p className="font-medium">
                {availableCopies}
                {availableCopies !== item.copies && (
                  <span className="text-muted-foreground font-normal"> von {item.copies}</span>
                )}
              </p>
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

        {available && showQuantitySelector && (
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Anzahl Exemplare:</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(-1)}
                disabled={inCart ? cartQuantity <= 1 : pendingQuantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">
                {inCart ? cartQuantity : pendingQuantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(1)}
                disabled={inCart ? cartQuantity >= availableCopies : pendingQuantity >= availableCopies}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">von {availableCopies}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          {config.features.deposit && item.deposit > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Kaution</p>
              <p className="text-3xl font-bold">{item.deposit}{config.display.currency} </p>
            </div>
          )}

          {available || inCart ? (
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
                  {showQuantitySelector && cartQuantity > 1 && ` (×${cartQuantity})`}
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
                {statusAvailable ? "Alle Exemplare ausgeliehen" : STATUS_LABELS[item.status]}
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
