import type {
  BrandConfig,
  MetaConfig,
  FeaturesConfig,
  LimitsConfig,
  DefaultsConfig,
  DisplayConfig,
} from "./types";

export const DEFAULT_BRAND: BrandConfig = {
  name: "Leihladen im Commonszentrum",
  tagline: [
    { text: "Ein Projekt von " },
    { text: "Commons Zentrum Lüneburg", url: "https://commonszentrum.de/" },
    { text: " und " },
    { text: "AllerLeih", url: "https://allerleih.org/" },
    { text: "." },
  ],
  logo: "",
  accent: "#597ad8",
};

export const DEFAULT_META: MetaConfig = {
  title: "",
  description: "",
};

export const DEFAULT_FEATURES: FeaturesConfig = {
  search: true,
  availabilityToggle: true,
  itemIds: true,
  detailPages: true,
  urlParams: true,
  timeSelection: true,
  deposit: true,
  copies: true,
  calendarButtons: true,
};

export const DEFAULT_LIMITS: LimitsConfig = {
  cartItems: 10,
  pickupDays: 28,
  itemsPerPage: 24,
};

export const DEFAULT_DEFAULTS: DefaultsConfig = {
  availableOnly: true,
  sort: "name",
};

export const DEFAULT_DISPLAY: DisplayConfig = {
  currency: "€",
};

export const DEFAULT_HOURS_JSON =
  '{"0":"11:00-15:00"}';
