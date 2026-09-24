"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mail, MessageSquare, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PickupSelector } from "./pickup-selector";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { createReservation } from "@/lib/api/reservations";
import { checkCustomerExists } from "@/lib/api/customers";
import {
  reservationSchema,
  emptySignup,
  HEARD_OPTIONS,
  ReservationFormData,
} from "@/lib/validation/reservation";
import { ApiClientError } from "@/lib/api/client";

/** Result of looking the entered address up in the member database. */
type LookupState = "idle" | "checking" | "known" | "unknown";

export function ReservationForm() {
  const router = useRouter();
  const config = useConfig();
  const { items, getQuantity, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookup, setLookup] = useState<LookupState>("idle");
  const [checkedEmail, setCheckedEmail] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      customer_email: "",
      pickup: "",
      comments: "",
      signup_required: false,
      signup: emptySignup,
    },
  });

  const pickupValue = watch("pickup");
  const emailValue = watch("customer_email");
  const showSignup = watch("signup_required");

  /** Resolve whether this address is already registered. Returns the outcome so
   *  the submit handler can act on it. A failed lookup counts as "not known":
   *  showing the form costs a returning person some typing, whereas blocking the
   *  reservation would cost them the reservation. */
  const resolveLookup = async (email: string): Promise<LookupState> => {
    setLookup("checking");
    let state: LookupState;
    try {
      state = (await checkCustomerExists(email)) ? "known" : "unknown";
    } catch {
      state = "unknown";
    }
    setCheckedEmail(email);
    setLookup(state);
    setValue("signup_required", state === "unknown");
    return state;
  };

  // Look the address up when the person leaves the email field, so a returning
  // member doesn't have to type their data again.
  const handleEmailBlur = async () => {
    const email = emailValue?.trim();
    if (!email || !(await trigger("customer_email"))) {
      setLookup("idle");
      return;
    }
    if (email === checkedEmail) return;
    await resolveLookup(email);
  };

  const onSubmit = async (data: ReservationFormData) => {
    const reservableItems = items.filter((item) => getQuantity(item.id) > 0);

    if (reservableItems.length === 0) {
      setError("Dein Ausleihkorb ist leer.");
      return;
    }

    setError(null);

    // The person may have submitted without ever leaving the email field, or
    // changed the address afterwards. Settle the lookup before sending anything;
    // if they turn out to be new, reveal the form instead of submitting.
    const email = data.customer_email.trim();
    let registering = data.signup_required;
    if (email !== checkedEmail) {
      registering = (await resolveLookup(email)) === "unknown";
      if (registering) {
        setError("Wir kennen dich noch nicht – bitte ergänze kurz deine Daten.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await createReservation({
        customer_name: registering
          ? `${data.signup.firstname} ${data.signup.lastname}`.trim()
          : "",
        customer_email: data.customer_email,
        customer_phone: registering ? data.signup.phone.trim() : "",
        items: reservableItems.map((item) => item.id),
        pickup: data.pickup,
        comments: data.comments,
        requested_copies: Object.fromEntries(
          reservableItems.map((item) => [item.id, getQuantity(item.id)])
        ),
        // Only sent for people we don't know yet. The backend ignores it if the
        // address turns out to belong to someone after all.
        ...(registering ? { signup: data.signup } : {}),
      });

      // Store reservation info for success page
      sessionStorage.setItem(
        "reservation",
        JSON.stringify({
          id: response.id,
          email: data.customer_email,
          pickup: data.pickup,
          registered: registering,
          items: reservableItems.map((item) => ({
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
        if (err.data && Object.keys(err.data).length > 0) {
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

  const signupErrors = errors.signup;

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
          {...register("customer_email", { onBlur: handleEmailBlur })}
          className={errors.customer_email ? "border-destructive" : ""}
        />
        {errors.customer_email && (
          <p className="text-sm text-destructive">
            {errors.customer_email.message}
          </p>
        )}
        {lookup === "checking" && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Einen Moment, wir schauen nach...
          </p>
        )}
        {lookup === "known" && (
          <p className="text-sm text-primary flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Schön, dass du wieder da bist! Deine Daten sind bei uns hinterlegt.
          </p>
        )}
        {lookup !== "known" && (
          <p className="text-xs text-muted-foreground">
            Du erhältst eine Bestätigung mit allen Details an diese Adresse.
          </p>
        )}
      </div>

      {showSignup && (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div className="space-y-1">
            <h3 className="font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Du bist neu bei uns
            </h3>
            <p className="text-xs text-muted-foreground">
              Bitte trage einmalig deine Daten ein – dann musst du vor Ort nichts
              mehr ausfüllen. Bring zur ersten Abholung bitte einen Ausweis mit.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstname">Vorname</Label>
              <Input
                id="firstname"
                autoComplete="given-name"
                {...register("signup.firstname")}
                className={signupErrors?.firstname ? "border-destructive" : ""}
              />
              {signupErrors?.firstname && (
                <p className="text-sm text-destructive">
                  {signupErrors.firstname.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Nachname</Label>
              <Input
                id="lastname"
                autoComplete="family-name"
                {...register("signup.lastname")}
                className={signupErrors?.lastname ? "border-destructive" : ""}
              />
              {signupErrors?.lastname && (
                <p className="text-sm text-destructive">
                  {signupErrors.lastname.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_5rem] gap-3">
            <div className="space-y-2">
              <Label htmlFor="street">Straße</Label>
              <Input
                id="street"
                autoComplete="address-line1"
                {...register("signup.street")}
                className={signupErrors?.street ? "border-destructive" : ""}
              />
              {signupErrors?.street && (
                <p className="text-sm text-destructive">
                  {signupErrors.street.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="house_number">Nr.</Label>
              <Input
                id="house_number"
                {...register("signup.house_number")}
                className={
                  signupErrors?.house_number ? "border-destructive" : ""
                }
              />
              {signupErrors?.house_number && (
                <p className="text-sm text-destructive">
                  {signupErrors.house_number.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[6rem_1fr] gap-3">
            <div className="space-y-2">
              <Label htmlFor="postal_code">PLZ</Label>
              <Input
                id="postal_code"
                inputMode="numeric"
                autoComplete="postal-code"
                {...register("signup.postal_code")}
                className={signupErrors?.postal_code ? "border-destructive" : ""}
              />
              {signupErrors?.postal_code && (
                <p className="text-sm text-destructive">
                  {signupErrors.postal_code.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input
                id="city"
                autoComplete="address-level2"
                {...register("signup.city")}
                className={signupErrors?.city ? "border-destructive" : ""}
              />
              {signupErrors?.city && (
                <p className="text-sm text-destructive">
                  {signupErrors.city.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefon
              <span className="text-muted-foreground font-normal">
                {" "}
                (optional)
              </span>
            </Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...register("signup.phone")}
              className={signupErrors?.phone ? "border-destructive" : ""}
            />
            {signupErrors?.phone && (
              <p className="text-sm text-destructive">
                {signupErrors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="heard">
              Wie hast du von uns erfahren?
              <span className="text-muted-foreground font-normal">
                {" "}
                (optional)
              </span>
            </Label>
            <select
              id="heard"
              {...register("signup.heard")}
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
            >
              <option value="">Keine Angabe</option>
              {HEARD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 border-t pt-3">
            <div className="flex gap-2.5">
              <Checkbox
                id="accepted_terms"
                className="mt-0.5"
                {...register("signup.accepted_terms")}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="accepted_terms"
                  className="font-normal leading-snug"
                >
                  Ich akzeptiere die{" "}
                  <a
                    href={config.legal.termsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    Leihbedingungen
                  </a>
                  .
                </Label>
                {signupErrors?.accepted_terms && (
                  <p className="text-sm text-destructive">
                    {signupErrors.accepted_terms.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2.5">
              <Checkbox
                id="accepted_privacy"
                className="mt-0.5"
                {...register("signup.accepted_privacy")}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="accepted_privacy"
                  className="font-normal leading-snug"
                >
                  Ich habe die{" "}
                  <a
                    href={config.legal.privacyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    Datenschutzerklärung
                  </a>{" "}
                  gelesen.
                </Label>
                {signupErrors?.accepted_privacy && (
                  <p className="text-sm text-destructive">
                    {signupErrors.accepted_privacy.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2.5">
              <Checkbox
                id="newsletter"
                className="mt-0.5"
                {...register("signup.newsletter")}
              />
              <Label htmlFor="newsletter" className="font-normal leading-snug">
                Ich möchte den Newsletter erhalten.
                <span className="text-muted-foreground"> (optional)</span>
              </Label>
            </div>
          </div>
        </div>
      )}

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
        disabled={isSubmitting || items.length === 0 || lookup === "checking"}
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
