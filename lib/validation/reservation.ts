import { z } from "zod";

/** Must stay in sync with HEARD_VALUES in the backend's pb_hooks/constants.js –
 *  the backend rejects anything else. */
export const HEARD_OPTIONS = [
  "Internet",
  "Freunde & Bekannte",
  "Zeitung / Medien",
  "Nachbarschaft",
  "Sonstige",
] as const;

/** Mirrors REQUIRED_FIELDS in the backend's pb_hooks/services/signup.js. */
const REQUIRED_SIGNUP_FIELDS = [
  ["firstname", "Vorname"],
  ["lastname", "Nachname"],
  ["street", "Straße"],
  ["house_number", "Hausnummer"],
  ["postal_code", "PLZ"],
  ["city", "Stadt"],
] as const;

// The fields are always present in the form state so react-hook-form can register
// them; whether they are *required* depends on `is_known` and is decided in the
// superRefine below.
const signupShape = z.object({
  firstname: z.string(),
  lastname: z.string(),
  street: z.string(),
  house_number: z.string(),
  postal_code: z.string(),
  city: z.string(),
  phone: z.string(),
  heard: z.string(),
  newsletter: z.boolean(),
  accepted_terms: z.boolean(),
  accepted_privacy: z.boolean(),
});

export const reservationSchema = z
  .object({
    customer_email: z
      .string()
      .min(1, "E-Mail ist erforderlich")
      .email("Bitte gebe eine gültige E-Mail-Adresse ein"),
    pickup: z.string().min(1, "Bitte wähle einen Abholtermin"),
    comments: z.string().optional(),
    /**
     * Set once the lookup found no account for this address, i.e. the signup
     * fields are on screen. While it is false the fields are hidden, so they
     * must not be validated – otherwise the submit would fail with errors the
     * person cannot see. The form resolves the lookup before submitting.
     */
    signup_required: z.boolean(),
    signup: signupShape,
  })
  .superRefine((data, ctx) => {
    if (!data.signup_required) return;

    for (const [field, label] of REQUIRED_SIGNUP_FIELDS) {
      if (!data.signup[field].trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["signup", field],
          message: `${label} ist erforderlich`,
        });
      }
    }

    const phone = data.signup.phone.trim();
    if (phone && !/^[0-9\s+\-/]+$/.test(phone)) {
      ctx.addIssue({
        code: "custom",
        path: ["signup", "phone"],
        message: "Bitte gib eine gültige Telefonnummer ein",
      });
    }

    if (data.signup.heard && !HEARD_OPTIONS.includes(data.signup.heard as (typeof HEARD_OPTIONS)[number])) {
      ctx.addIssue({
        code: "custom",
        path: ["signup", "heard"],
        message: "Bitte wähle eine gültige Option",
      });
    }

    if (!data.signup.accepted_terms) {
      ctx.addIssue({
        code: "custom",
        path: ["signup", "accepted_terms"],
        message: "Bitte akzeptiere die Leihbedingungen",
      });
    }
    if (!data.signup.accepted_privacy) {
      ctx.addIssue({
        code: "custom",
        path: ["signup", "accepted_privacy"],
        message: "Bitte akzeptiere die Datenschutzerklärung",
      });
    }
  });

export type ReservationFormData = z.infer<typeof reservationSchema>;
export type SignupFormData = ReservationFormData["signup"];

export const emptySignup: SignupFormData = {
  firstname: "",
  lastname: "",
  street: "",
  house_number: "",
  postal_code: "",
  city: "",
  phone: "",
  heard: "",
  newsletter: false,
  accepted_terms: false,
  accepted_privacy: false,
};
