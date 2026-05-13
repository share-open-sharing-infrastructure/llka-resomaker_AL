"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReservationForm } from "@/components/checkout/reservation-form";
import { CartSummary } from "@/components/checkout/cart-summary";
import { useCart } from "@/context/cart-context";

export default function CheckoutPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6">
        <h1 className="text-2xl font-bold">Ihr Ausleihkorb ist leer</h1>
        <p className="text-muted-foreground">
          Füge Gegenstände hinzu, um sie zu reservieren.
        </p>
        <Button asChild>
          <Link href="/">Zur Übersicht</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Reservierung abschließen</h1>
        <p className="text-muted-foreground mt-1">
          Gebe deine Daten ein und wähle einen Abholtermin.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        <div className="order-2 lg:order-1">
          <ReservationForm />
        </div>
        <div className="order-1 lg:order-2">
          <CartSummary items={items} />
        </div>
      </div>
    </div>
  );
}
