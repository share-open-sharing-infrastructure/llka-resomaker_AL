"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { CartItem } from "./cart-item";
import { useConfig } from "@/context/config-context";

export function CartSheet() {
  const config = useConfig();
  const { items, isOpen, setIsOpen, removeItem, clearCart } = useCart();

  const totalDeposit = items.reduce((sum, item) => sum + item.deposit, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5" />
            Ausleihkorb
            {items.length > 0 && (
              <span className="ml-1 text-muted-foreground font-normal">
                ({items.length} {items.length === 1 ? "Gegenstand" : "Gegenstände"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="rounded-full bg-muted p-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Dein Ausleihkorb ist leer</p>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Füge Gegenstände hinzu, um sie zu reservieren.
              </p>
            </div>
            <Button onClick={() => setIsOpen(false)}>
              Weiter stöbern
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="divide-y">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} onRemove={removeItem} />
                ))}
              </div>
            </div>

            <div className="border-t bg-muted/30 p-6 space-y-4">
              {config.features.deposit && totalDeposit > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Gesamtkaution
                    </span>
                    <span className="text-2xl font-bold">{totalDeposit}{config.display.currency}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Die Kaution wird bei Abholung fällig und bei Rückgabe erstattet.
                  </p>
                  <Separator />
                </>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearCart}
                >
                  Leeren
                </Button>
                <Button className="flex-1" size="lg" asChild>
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    Zur Reservierung
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
