import type { OpeningHoursConfig } from "@/lib/config/types";

export interface OpeningHours {
  open: number;
  close: number;
}

export type OpeningHoursMap = Record<number, OpeningHours>;

export const DAY_NAMES: Record<number, string> = {
  0: "Sonntag",
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
};

export function toOpeningHoursMap(hours: OpeningHoursConfig): OpeningHoursMap {
  return Object.fromEntries(
    Object.entries(hours)
      .filter(([, h]) => h !== null)
      .map(([day, h]) => [Number(day), h as OpeningHours])
  );
}

export function isOpenDay(map: OpeningHoursMap, dayOfWeek: number): boolean {
  return dayOfWeek in map;
}

export function getOpeningHoursForDay(
  map: OpeningHoursMap,
  dayOfWeek: number
): OpeningHours | undefined {
  return map[dayOfWeek];
}

export function formatOpeningHours(
  map: OpeningHoursMap
): { day: string; hours: string }[] {
  const days = [
    { day: "Montag", dayNum: 1 },
    { day: "Dienstag", dayNum: 2 },
    { day: "Mittwoch", dayNum: 3 },
    { day: "Donnerstag", dayNum: 4 },
    { day: "Freitag", dayNum: 5 },
    { day: "Samstag", dayNum: 6 },
    { day: "Sonntag", dayNum: 0 },
  ];

  return days.map(({ day, dayNum }) => {
    const hours = map[dayNum];
    return {
      day,
      hours: hours
        ? `${hours.open}:00 - ${hours.close}:00`
        : "Geschlossen",
    };
  });
}

export function getValidPickupSlots(
  map: OpeningHoursMap,
  weeksAhead: number = 4
): Date[] {
  const slots: Date[] = [];
  const now = new Date();
  const endDate = new Date(
    now.getTime() + weeksAhead * 7 * 24 * 60 * 60 * 1000
  );

  const current = new Date(now);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const hours = map[dayOfWeek];

    if (hours) {
      for (let minutes = hours.open * 60; minutes < hours.close * 60; minutes += 30) {
        const slot = new Date(current);
        slot.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
        if (slot > now) {
          slots.push(slot);
        }
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return slots;
}

export function isValidPickupTime(map: OpeningHoursMap, date: Date): boolean {
  const now = new Date();
  if (date <= now) return false;

  const dayOfWeek = date.getDay();
  const hours = map[dayOfWeek];
  if (!hours) return false;

  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  return totalMinutes >= hours.open * 60 && totalMinutes < hours.close * 60;
}

export function formatPickupDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
