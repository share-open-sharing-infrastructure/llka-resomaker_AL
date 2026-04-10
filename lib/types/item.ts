export type ItemStatus =
  | "instock"
  | "reserved"
  | "rented"
  | "outofstock"
  | "onbackorder"
  | "repairing"
  | "lost"
  | "forsale"
  | "deleted";

export const STATUS_LABELS: Record<ItemStatus, string> = {
  instock: "Verfügbar",
  reserved: "Reserviert",
  rented: "Ausgeliehen",
  outofstock: "Nicht vorrätig",
  onbackorder: "Nachbestellt",
  repairing: "In Reparatur",
  lost: "Verloren",
  forsale: "Zu verkaufen",
  deleted: "Gelöscht",
};

export function isAvailable(status: ItemStatus): boolean {
  return status === "instock";
}

export interface Item {
  id: string;
  iid: number;
  name: string;
  description: string;
  status: ItemStatus;
  deposit: number;
  synonyms: string;
  category: string[];
  brand: string;
  model: string;
  packaging: string;
  manual: boolean;
  parts: number;
  copies: number;
  images: string[];
  added_on: string;
  created: string;
  updated: string;
}

export interface ItemsResponse {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: Item[];
}
