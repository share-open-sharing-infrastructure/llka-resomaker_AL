import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A native checkbox styled to match the rest of the form controls.
 *
 * Deliberately not the Radix primitive: it would add a dependency, and a native
 * input works directly with react-hook-form's `register()` without a Controller.
 *
 * The tick is a real icon layered over the input rather than a background-image
 * utility — an inline SVG data URI contains spaces, which Tailwind cannot parse
 * inside an arbitrary value, so that class is silently dropped at build time.
 *
 * `className` lands on the wrapper, since that is the element callers position.
 */
function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <span className={cn("relative inline-flex size-4 shrink-0", className)}>
      <input
        type="checkbox"
        data-slot="checkbox"
        className={cn(
          "peer size-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border bg-transparent shadow-xs outline-none transition-[color,box-shadow]",
          "border-input checked:border-primary checked:bg-primary",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        strokeWidth={3.5}
        className="pointer-events-none absolute inset-0 size-4 scale-75 text-primary-foreground opacity-0 peer-checked:opacity-100"
      />
    </span>
  );
}

export { Checkbox };
