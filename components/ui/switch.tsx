import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// Switch berbasis input checkbox, dibungkus label agar bisa diklik.
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex h-6 w-11 cursor-pointer items-center", className)}>
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <span className="absolute inset-0 rounded-full bg-muted transition peer-checked:bg-primary" />
        <span className="relative ml-1 h-5 w-5 rounded-full bg-background shadow transition-transform peer-checked:translate-x-5" />
      </label>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };