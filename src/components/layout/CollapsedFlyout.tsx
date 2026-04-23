"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "./navItems.config";

interface CollapsedFlyoutProps {
  itemId: string;
  items: NavItem[];
  onClose: () => void;
}

export function CollapsedFlyout({ itemId: _itemId, items, onClose }: CollapsedFlyoutProps) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      data-flyout-panel
      className={cn(
        "absolute left-full top-0 ml-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50"
      )}
    >
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.id}
            href={item.href}
            data-flyout-trigger
            onClick={onClose}
            className={cn(
              "block px-4 py-2 text-sm",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
