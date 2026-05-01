"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";

export function Header() {
  const { items, setIsOpen } = useCart();
  const config = useConfig();
  const itemCount = items.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          {config.brand.logo && (
            <Image
              src={config.brand.logo}
              alt={config.brand.name}
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          )}
          <span className="text-xl font-bold">{config.brand.name}</span>
        </Link>

        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(true)}
          aria-label="Warenkorb öffnen"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {itemCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
