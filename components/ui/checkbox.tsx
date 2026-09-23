import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A native checkbox styled to match the rest of the form controls.
 *
 * Deliberately not the Radix primitive: it would add a dependency, and a native
 * input works directly with react-hook-form's `register()` without a Controller.
 */
function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "border-input size-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border bg-transparent shadow-xs transition-[color,box-shadow] outline-none",
        "checked:bg-primary checked:border-primary",
        // the tick, drawn as a background image so we need no child element
        "checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M3 8.5l3.5 3.5L13 5%22/></svg>')] checked:bg-center checked:bg-no-repeat",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Checkbox };
