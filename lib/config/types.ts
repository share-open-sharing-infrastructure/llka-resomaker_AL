export interface TaglineSegment {
  text: string;
  url?: string;
}

export interface BrandConfig {
  name: string;
  tagline: TaglineSegment[];
  logo: string;
  accent: string;
}

export interface MetaConfig {
  title: string;
  description: string;
}

export interface OpeningHoursConfig {
  [day: number]: { open: number; close: number } | null;
}

export interface FeaturesConfig {
  search: boolean;
  availabilityToggle: boolean;
  itemIds: boolean;
  detailPages: boolean;
  urlParams: boolean;
  timeSelection: boolean;
  deposit: boolean;
  copies: boolean;
  calendarButtons: boolean;
}

export interface LimitsConfig {
  cartItems: number;
  pickupDays: number;
  itemsPerPage: number;
}

export interface DefaultsConfig {
  availableOnly: boolean;
  sort: string;
}

export interface DisplayConfig {
  currency: string;
}

export interface ApiConfig {
  base: string;
}

export interface AppConfig {
  brand: BrandConfig;
  meta: MetaConfig;
  features: FeaturesConfig;
  limits: LimitsConfig;
  defaults: DefaultsConfig;
  display: DisplayConfig;
  hours: OpeningHoursConfig;
  api: ApiConfig;
}
