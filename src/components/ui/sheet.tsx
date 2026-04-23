"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used within a Sheet");
  }
  return context;
}

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </SheetContext.Provider>
  );
}

interface SheetTriggerProps {
  children?: React.ReactNode;
  asChild?: boolean;
  onClick?: () => void;
}

function SheetTrigger({ children, onClick }: SheetTriggerProps) {
  return <div onClick={onClick}>{children}</div>;
}

interface SheetContentProps {
  children?: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

function SheetContent({ children, className, side = "right" }: SheetContentProps) {
  const { open, onOpenChange } = useSheetContext();

  if (!open) return null;

  const sideClasses = {
    top: "inset-x-0 top-0 border-b",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 border-r",
    right: "inset-y-0 right-0 border-l",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "fixed z-50 bg-white dark:bg-slate-900 shadow-lg transition-transform duration-300",
          sideClasses[side],
          side === "right" && "right-0 h-full w-3/4 max-w-sm",
          side === "left" && "left-0 h-full w-3/4 max-w-sm",
          side === "top" && "top-0 w-full",
          side === "bottom" && "bottom-0 w-full",
          className
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </>
  );
}

interface SheetHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

function SheetHeader({ children, className }: SheetHeaderProps) {
  return <div className={cn("px-6 py-4 border-b", className)}>{children}</div>;
}

interface SheetTitleProps {
  children?: React.ReactNode;
  className?: string;
}

function SheetTitle({ children, className }: SheetTitleProps) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}

interface SheetDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

function SheetDescription({ children, className }: SheetDescriptionProps) {
  return <p className={cn("text-sm text-slate-500", className)}>{children}</p>;
}

interface SheetFooterProps {
  children?: React.ReactNode;
  className?: string;
}

function SheetFooter({ children, className }: SheetFooterProps) {
  return <div className={cn("px-6 py-4 border-t mt-auto", className)}>{children}</div>;
}

interface SheetCloseProps {
  children?: React.ReactNode;
  onClick?: () => void;
}

function SheetClose({ children, onClick }: SheetCloseProps) {
  const { onOpenChange } = useSheetContext();
  return (
    <div
      onClick={() => {
        onOpenChange(false);
        onClick?.();
      }}
    >
      {children}
    </div>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
};
