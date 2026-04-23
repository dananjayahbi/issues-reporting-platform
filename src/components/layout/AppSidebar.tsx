"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { navItems } from "./navItems.config";
import { CollapsedFlyout } from "./CollapsedFlyout";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const iconMap: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  issues: FileText,
  chat: MessageSquare,
  polls: BarChart3,
  search: Search,
  notifications: Bell,
  admin: Shield,
  settings: Settings,
};

interface AppSidebarProps {
  mobile?: boolean;
}

export function AppSidebar({ mobile }: AppSidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-40 transition-all duration-300",
        mobile ? "w-72" : sidebarCollapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
        {!mobile && !sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">LLC Tracker</span>
          </Link>
        )}
        {!mobile && sidebarCollapsed && (
          <Link href="/" className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
          </Link>
        )}
        {mobile && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">LLC Tracker</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const hasSubItems = item.items && item.items.length > 0;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                  onClick={(e) => {
                    if (hasSubItems) {
                      e.preventDefault();
                      setExpandedItem(expandedItem === item.id ? null : item.id);
                    }
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && !mobile && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {hasSubItems && (
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedItem === item.id && "rotate-90"
                          )}
                        />
                      )}
                    </>
                  )}
                </Link>

                {/* Sub-items */}
                {hasSubItems && (sidebarCollapsed || mobile) && expandedItem === item.id && (
                  <CollapsedFlyout
                    itemId={item.id}
                    items={item.items || []}
                    onClose={() => setExpandedItem(null)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle (desktop only) */}
      {!mobile && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
