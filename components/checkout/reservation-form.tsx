"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PickupSelector } from "./pickup-selector";
import { useCart } from "@/context/cart-context";
import { createReservation } from "@/lib/api/reservations";
import {
  reservationSchema,
  ReservationFormData,
} from "@/lib/validation/reservation";
import { ApiClientError } from "@/lib/api/client";

export function ReservationForm() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      customer_email: "",
      pickup: "",
      comments: "",
    },
  });

  const pickupValue = watch("pickup");

  const onSubmit = async (data: ReservationFormData) => {
    if (items.length === 0) {
      setError("Dein Ausleihkorb ist leer.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createReservation({
        customer_name: "", // Not collected, backend may handle
        customer_email: data.customer_email,
        customer_phone: "", // Not collected
        items: items.map((item) => item.id),
        pickup: data.pickup,
        comments: data.comments,
      });

      // Store reservation info for success page
      sessionStorage.setItem(
        "reservation",
        JSON.stringify({
          id: response.id,
          email: data.customer_email,
          pickup: data.pickup,
          items: items.map((item) => ({
            id: item.id,
            iid: item.iid,
            name: item.name,
          })),
        })
      );

      clearCart();
      router.push("/success");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.data) {
          // Format field-specific errors
          const fieldErrors = Object.entries(err.data)
            .map(([field, error]) => `${field}: ${error.message}`)
            .join(", ");
          setError(fieldErrors || err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          E-Mail-Adresse
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="deine@email.de"
          {...register("customer_email")}
          className={errors.customer_email ? "border-destructive" : ""}
        />
        {errors.customer_email && (
          <p className="text-sm text-destructive">
            {errors.customer_email.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Du erhältst eine Bestätigung mit allen Details an diese Adresse.
        </p>
      </div>

      <PickupSelector
        value={pickupValue}
        onChange={(value) => setValue("pickup", value, { shouldValidate: true })}
        error={errors.pickup?.message}
      />

      <div className="space-y-2">
        <Label htmlFor="comments" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Anmerkungen
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="comments"
          placeholder="Besondere Wünsche oder Hinweise..."
          rows={3}
          {...register("comments")}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting || items.length === 0}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird reserviert...
          </>
        ) : (
          "Jetzt reservieren"
        )}
      </Button>
    </form>
  );
}
