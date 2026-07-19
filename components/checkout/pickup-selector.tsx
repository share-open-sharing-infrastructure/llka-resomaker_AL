"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getValidPickupSlots,
  formatPickupDateTime,
  toOpeningHoursMap,
} from "@/lib/constants/opening-hours";
import { useConfig } from "@/context/config-context";
import { useOpeningHours } from "@/context/opening-hours-context";

interface PickupSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

interface PickupSlot {
  date: Date;
  dateKey: string;
  timeLabel: string;
  fullDateTime: string;
}

export function PickupSelector({ value, onChange, error }: PickupSelectorProps) {
  const config = useConfig();
  const openingHours = useOpeningHours();
  const weeksAhead = Math.ceil(config.limits.pickupDays / 7);

  const slots = useMemo(() => {
    const map = toOpeningHoursMap(openingHours);
    const rawSlots = getValidPickupSlots(map, weeksAhead);
    return rawSlots.map((date): PickupSlot => ({
      date,
      dateKey: format(date, "yyyy-MM-dd"),
      timeLabel: format(date, "HH:mm"),
      fullDateTime: formatPickupDateTime(date),
    }));
  }, [openingHours, weeksAhead]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, PickupSlot[]>();
    for (const slot of slots) {
      const existing = grouped.get(slot.dateKey) || [];
      existing.push(slot);
      grouped.set(slot.dateKey, existing);
    }
    return grouped;
  }, [slots]);

  // Get unique dates for the date selector
  const availableDates = useMemo(() => {
    return Array.from(slotsByDate.keys()).map((dateKey) => {
      const firstSlot = slotsByDate.get(dateKey)![0];
      return {
        key: dateKey,
        label: format(firstSlot.date, "EEEE, d. MMMM", { locale: de }),
      };
    });
  }, [slotsByDate]);

  // Parse current value to get selected date and time
  const selectedSlot = slots.find((s) => s.fullDateTime === value);
  const selectedDateKey = selectedSlot?.dateKey || "";
  const selectedTime = selectedSlot?.timeLabel || "";

  // Get available times for selected date
  const availableTimes = selectedDateKey
    ? slotsByDate.get(selectedDateKey) || []
    : [];

  const handleDateChange = (dateKey: string) => {
    const timesForDate = slotsByDate.get(dateKey);
    if (timesForDate && timesForDate.length > 0) {
      if (config.features.timeSelection) {
        // Select the first available time for this date
        onChange(timesForDate[0].fullDateTime);
      } else {
        // Auto-select the last time slot (closing - 1 hour)
        onChange(timesForDate[timesForDate.length - 1].fullDateTime);
      }
    }
  };

  const handleTimeChange = (time: string) => {
    const slot = availableTimes.find((s) => s.timeLabel === time);
    if (slot) {
      onChange(slot.fullDateTime);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Abholdatum
        </Label>
        <Select value={selectedDateKey} onValueChange={handleDateChange}>
          <SelectTrigger className={error ? "border-destructive" : ""}>
            <SelectValue placeholder="Datum auswählen..." />
          </SelectTrigger>
          <SelectContent>
            {availableDates.map((date) => (
              <SelectItem key={date.key} value={date.key}>
                {date.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {config.features.timeSelection && selectedDateKey && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Uhrzeit
          </Label>
          <Select value={selectedTime} onValueChange={handleTimeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Uhrzeit auswählen..." />
            </SelectTrigger>
            <SelectContent>
              {availableTimes.map((slot) => (
                <SelectItem key={slot.timeLabel} value={slot.timeLabel}>
                  {slot.timeLabel} Uhr
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
