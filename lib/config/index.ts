import type { AppConfig, OpeningHoursConfig } from "./types";
import {
  DEFAULT_BRAND,
  DEFAULT_FEATURES,
  DEFAULT_LIMITS,
  DEFAULT_DEFAULTS,
  DEFAULT_DISPLAY,
  DEFAULT_HOURS_JSON,
} from "./defaults";

function env(key: string, defaultValue: string): string {
  return process.env[`NEXT_PUBLIC_${key}`] ?? defaultValue;
}

function envBool(key: string, defaultValue: boolean): boolean {
  const value = process.env[`NEXT_PUBLIC_${key}`];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}

function envInt(key: string, defaultValue: number): number {
  const value = process.env[`NEXT_PUBLIC_${key}`];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseHours(json: string): OpeningHoursConfig {
  try {
    const parsed = JSON.parse(json) as Record<string, string | null>;
    const result: OpeningHoursConfig = {};

    for (const [day, hours] of Object.entries(parsed)) {
      const dayNum = parseInt(day, 10);
      if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) continue;

      if (hours === null || hours === "") {
        result[dayNum] = null;
      } else {
        const match = hours.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
        if (match) {
          result[dayNum] = {
            open: parseInt(match[1], 10),
            close: parseInt(match[3], 10),
          };
        }
      }
    }

    return result;
  } catch {
    return {};
  }
}

const brandName = env("BRAND_NAME", DEFAULT_BRAND.name);
const taglineText = DEFAULT_BRAND.tagline.map((s) => s.text).join("");

export const config: AppConfig = {
  brand: {
    name: brandName,
    tagline: DEFAULT_BRAND.tagline,
    logo: env("BRAND_LOGO", DEFAULT_BRAND.logo),
    accent: env("BRAND_ACCENT", DEFAULT_BRAND.accent),
  },
  meta: {
    title:
      env("META_TITLE", "") || `${brandName} - ${taglineText}`,
    description:
      env("META_DESCRIPTION", "") ||
      `Reservieren Sie Gegenstande bei ${brandName} - nachhaltig und gemeinschaftlich.`,
  },
  features: {
    search: envBool("FEATURE_SEARCH", DEFAULT_FEATURES.search),
    availabilityToggle: envBool(
      "FEATURE_AVAILABILITY_TOGGLE",
      DEFAULT_FEATURES.availabilityToggle
    ),
    categoryFilter: envBool(
      "FEATURE_CATEGORY_FILTER",
      DEFAULT_FEATURES.categoryFilter
    ),
    itemIds: envBool("FEATURE_ITEM_IDS", DEFAULT_FEATURES.itemIds),
    detailPages: envBool("FEATURE_DETAIL_PAGES", DEFAULT_FEATURES.detailPages),
    urlParams: envBool("FEATURE_URL_PARAMS", DEFAULT_FEATURES.urlParams),
    timeSelection: envBool(
      "FEATURE_TIME_SELECTION",
      DEFAULT_FEATURES.timeSelection
    ),
    deposit: envBool("FEATURE_DEPOSIT", DEFAULT_FEATURES.deposit),
    copies: envBool("FEATURE_COPIES", DEFAULT_FEATURES.copies),
    calendarButtons: envBool(
      "FEATURE_CALENDAR_BUTTONS",
      DEFAULT_FEATURES.calendarButtons
    ),
  },
  limits: {
    cartItems: envInt("LIMIT_CART_ITEMS", DEFAULT_LIMITS.cartItems),
    pickupDays: envInt("LIMIT_PICKUP_DAYS", DEFAULT_LIMITS.pickupDays),
    itemsPerPage: envInt("LIMIT_ITEMS_PER_PAGE", DEFAULT_LIMITS.itemsPerPage),
  },
  defaults: {
    availableOnly: envBool(
      "DEFAULT_AVAILABLE_ONLY",
      DEFAULT_DEFAULTS.availableOnly
    ),
    sort: env("DEFAULT_SORT", DEFAULT_DEFAULTS.sort),
  },
  display: {
    currency: env("DISPLAY_CURRENCY", DEFAULT_DISPLAY.currency),
  },
  hours: parseHours(env("HOURS_JSON", DEFAULT_HOURS_JSON)),
  api: {
    base: env("API_BASE", ""),
  },
} as const;
