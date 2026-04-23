"use client";

export const dynamic = 'force-dynamic';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SessionGuard } from "@/components/auth/SessionGuard";
import { AppSessionProvider } from "@/components/providers/AppSessionProvider";
import { useUIStore } from "@/store/uiStore";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MobileNav } from "@/components/layout/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppSessionProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AppSessionProvider>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const sessionResult = useSession();
  const status = sessionResult?.status;
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar, commandPaletteOpen } = useUIStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <SessionGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Desktop Sidebar */}
        {!isMobile && <AppSidebar />}

        {/* Mobile Sidebar Sheet */}
        <Sheet open={!sidebarCollapsed} onOpenChange={toggleSidebar}>
          <SheetContent side="left" className="p-0 w-72">
            <AppSidebar mobile />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div
          className={`flex flex-col min-h-screen transition-all duration-300 ${
            !isMobile ? "ml-60" : ""
          }`}
        >
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileNav />}

        {/* Command Palette */}
        {commandPaletteOpen && <CommandPalette />}
      </div>
    </SessionGuard>
  );
}
