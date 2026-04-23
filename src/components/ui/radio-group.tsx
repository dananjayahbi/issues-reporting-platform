"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value: _value, onValueChange: _onValueChange, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid gap-2", className)}
      role="radiogroup"
      {...props}
    />
  )
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  value?: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => (
    <input
      ref={ref}
      type="radio"
      value={value}
      className={cn(
        "hover:cursor-pointer aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };

