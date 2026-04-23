"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BarChart3,
  User,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard, href: "/" },
  { id: "issues", label: "Issues", icon: FileText, href: "/issues" },
  { id: "chat", label: "Chat", icon: MessageSquare, href: "/chat" },
  { id: "polls", label: "Polls", icon: BarChart3, href: "/polls" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 md:hidden z-50">
      <ul className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 text-xs",
                  isActive
                    ? "text-primary"
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
