"use client";

import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear as _endOfYear, isValid as _isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";
import { CalendarIcon } from "lucide-react";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const presets = [
  { label: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: "Yesterday", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: "Last 7 days", getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "Last 30 days", getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "This month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last month", getValue: () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
  }},
  { label: "This year", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange>(value || {});

  React.useEffect(() => {
    if (value) {
      setDateRange(value);
    }
  }, [value]);

  const handleSelect = (range: DateRange) => {
    setDateRange(range);
    if (range.from && range.to) {
      onChange?.(range);
      setIsOpen(false);
    }
  };

  const handlePreset = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    setDateRange(range);
    onChange?.(range);
    setIsOpen(false);
  };

  const displayValue = React.useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    if (dateRange.from) {
      return `From ${format(dateRange.from, "MMM d, yyyy")}`;
    }
    return placeholder;
  }, [dateRange, placeholder]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateRange.from && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="border-r p-3 space-y-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handlePreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            {...(dateRange.from && { selected: dateRange.from })}
            onSelect={(date: Date | undefined) => {
              if (date) {
                handleSelect({ from: date, to: dateRange.to || date });
              }
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
