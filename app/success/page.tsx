"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import {
  CheckCircle2,
  Calendar,
  Mail,
  Clock,
  Package,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  generateGoogleCalendarUrl,
  generateOutlookUrl,
  downloadICSFile,
} from "@/lib/utils/calendar";
import { useConfig } from "@/context/config-context";

interface ReservationInfo {
  id: string;
  email: string;
  pickup: string;
  items: { id: string; iid: number; name: string }[];
}

export default function SuccessPage() {
  const config = useConfig();
  const router = useRouter();
  const [reservation, setReservation] = useState<ReservationInfo | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("reservation");
    if (stored) {
      try {
        setReservation(JSON.parse(stored));
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  if (!reservation) {
    return null;
  }

  // Parse pickup date
  const pickupDate = parse(
    reservation.pickup,
    "yyyy-MM-dd HH:mm:ss",
    new Date()
  );
  const pickupEndDate = new Date(pickupDate.getTime() + 30 * 60 * 1000); // 30 min

  const formattedDate = format(pickupDate, "EEEE, d. MMMM yyyy", { locale: de });
  const formattedTime = format(pickupDate, "HH:mm", { locale: de });

  const calendarEvent = {
    title: `Abholung bei ${config.brand.name}`,
    description: `Reservierte Gegenstände:\n${reservation.items
      .map((item) => `- #${item.iid} ${item.name}`)
      .join("\n")}`,
    location: config.brand.name,
    startDate: pickupDate,
    endDate: pickupEndDate,
  };

  const handleAddToAppleCalendar = () => {
    downloadICSFile(calendarEvent, "leihlokal-abholung.ics");
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Reservierung erfolgreich!</h1>
        <p className="text-muted-foreground mt-2">
          Wir haben deine Reservierung erhalten.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Bestätigung an</p>
              <p className="font-medium">{reservation.email}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Abholtermin</p>
              <p className="font-medium">{formattedDate}</p>
              <p className="font-medium">{formattedTime} Uhr</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                Reservierte Gegenstände
              </p>
              <ul className="mt-1 space-y-1">
                {reservation.items.map((item) => (
                  <li key={item.id} className="text-sm">
                    <span className="font-mono text-muted-foreground">
                      #{item.iid}
                    </span>{" "}
                    {item.name.replace(/<[^>]*>/g, "").trim()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <h2 className="font-semibold text-amber-900 mb-2">Du bist neu bei uns?</h2>
          <p className="text-sm text-amber-800">
            Dann musst du einen{" "}
            <strong>Nutzungsantrag</strong> ausfüllen und unseren <strong>Leihbedingungen</strong> zustimmen. Du hast zwei Möglichkeiten:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-amber-800 list-disc list-inside">
            <li>
              <span className="font-bold">Online:</span>{" "}
              <a
                href="https://tally.so/r/jaGazx"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-amber-900"
              >
                Nutzungsantrag jetzt online ausfüllen
              </a>
            </li>
            <li>
              <span className="font-bold">Vor Ort:</span>{" "}
              Du kannst den Antrag auch in Papierform bei der Abholung im Commons Zentrum ausfüllen.
            </li>
          </ul>
        </CardContent>
      </Card>

      {config.features.calendarButtons && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Zum Kalender hinzufügen
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex-col h-auto py-3"
              onClick={() =>
                window.open(generateGoogleCalendarUrl(calendarEvent), "_blank")
              }
            >
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">Google</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3"
              onClick={handleAddToAppleCalendar}
            >
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">Apple</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3"
              onClick={() =>
                window.open(generateOutlookUrl(calendarEvent), "_blank")
              }
            >
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">Outlook</span>
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Link>
        </Button>
      </div>
    </div>
  );
}
