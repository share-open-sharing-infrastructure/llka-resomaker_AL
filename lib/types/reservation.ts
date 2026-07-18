export interface ReservationRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: string[];
  pickup: string; // "YYYY-MM-DD HH:mm:ss"
  comments?: string;
  requested_copies?: Record<string, number>;
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
