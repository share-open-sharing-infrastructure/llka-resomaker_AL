import { fetchApi } from "./client";
import type { OpeningHoursConfig } from "@/lib/config/types";

const DAY_NAME_TO_NUM: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

interface OpeningHoursResponse {
  opening_hours: [string, string, string][];
}

export async function fetchOpeningHours(): Promise<OpeningHoursConfig> {
  const { opening_hours } = await fetchApi<OpeningHoursResponse>(
    "/api/opening-hours"
  );

  const result: OpeningHoursConfig = {};
  for (const [day, open, close] of opening_hours) {
    const dayNum = DAY_NAME_TO_NUM[day];
    if (dayNum === undefined) continue;
    result[dayNum] = {
      open: parseInt(open.split(":")[0], 10),
      close: parseInt(close.split(":")[0], 10),
    };
  }
  return result;
}
