/** Personal data a not-yet-registered person enters while reserving. The backend
 *  creates a customer record from it, atomically with the reservation, and ignores
 *  it entirely when the email already belongs to someone. */
export interface SignupData {
  firstname: string;
  lastname: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  phone?: string;
  /** Must be one of the backend's `heard` select values, see HEARD_OPTIONS. */
  heard?: string;
  newsletter: boolean;
  accepted_terms: boolean;
  accepted_privacy: boolean;
}

export interface ReservationRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: string[];
  pickup: string; // "YYYY-MM-DD HH:mm:ss"
  comments?: string;
  requested_copies?: Record<string, number>;
  signup?: SignupData;
}

export interface CustomerExistsResponse {
  known: boolean;
}

export interface ReservationResponse {
  id: string;
  created: string;
  updated: string;
}

export interface ApiError {
  code: number;
  message: string;
  data?: Record<
    string,
    {
      code: string;
      message: string;
    }
  >;
}
