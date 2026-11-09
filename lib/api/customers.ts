import { fetchApi } from "./client";
import type { CustomerExistsResponse } from "@/lib/types/reservation";

/**
 * Ask whether an account already exists for this address, so returning people
 * don't have to enter their data again.
 *
 * The endpoint answers with nothing but a boolean. Callers must treat a failure
 * (network error, rate limit) as "unknown" and fall back to showing the form –
 * a lookup problem must never block a reservation.
 */
export async function checkCustomerExists(email: string): Promise<boolean> {
  const response = await fetchApi<CustomerExistsResponse>(
    "/api/customer/exists",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  );
  return response.known;
}
