"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  selected?: Date;
  onSelect?: (date: Date) => void;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, selected, onSelect, ...props }, ref) => {
    const [currentDate, setCurrentDate] = React.useState(selected || new Date());

    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const prevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
      <div ref={ref} className={cn("p-4", className)} {...props}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            ←
          </button>
          <span className="font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            →
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-slate-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = selected?.toDateString() === date.toDateString();

            return (
              <button
                key={day}
                type="button"
                onClick={() => onSelect?.(date)}
                className={cn(
                  "h-8 w-8 rounded-full text-sm hover:bg-slate-100 dark:hover:bg-slate-700",
                  isSelected && "bg-primary text-primary-foreground"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);
Calendar.displayName = "Calendar";

export { Calendar };
