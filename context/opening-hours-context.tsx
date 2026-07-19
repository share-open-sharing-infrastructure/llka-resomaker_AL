"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { OpeningHoursConfig } from "@/lib/config/types";
import { config } from "@/lib/config";
import { fetchOpeningHours } from "@/lib/api/opening-hours";

const OpeningHoursContext = createContext<OpeningHoursConfig>(config.hours);

export function OpeningHoursProvider({ children }: { children: ReactNode }) {
  const [hours, setHours] = useState<OpeningHoursConfig>(config.hours);

  useEffect(() => {
    let cancelled = false;

    fetchOpeningHours()
      .then((fetched) => {
        if (!cancelled && Object.keys(fetched).length > 0) {
          setHours(fetched);
        }
      })
      .catch(() => {
        // Keep the static fallback if the backend is unreachable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <OpeningHoursContext.Provider value={hours}>
      {children}
    </OpeningHoursContext.Provider>
  );
}

export function useOpeningHours(): OpeningHoursConfig {
  return useContext(OpeningHoursContext);
}
