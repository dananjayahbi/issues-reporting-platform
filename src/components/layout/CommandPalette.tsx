"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Users, Search as SearchIcon } from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, toggleCommandPalette } = useUIStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleCommandPalette]);

  const handleSelect = (href: string) => {
    router.push(href);
    toggleCommandPalette();
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={toggleCommandPalette}>
      <CommandInput
        placeholder="Search issues, messages, users..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => handleSelect("/issues/new")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Create New Issue</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/chat")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Open Chat</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/polls")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>View Polls</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect("/")}>
            <SearchIcon className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/issues")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>All Issues</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/admin")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function CommandPaletteTrigger() {
  const { toggleCommandPalette } = useUIStore();

  return (
    <Button
      variant="outline"
      className="hidden md:flex items-center gap-2 w-64 justify-start text-slate-500"
      onClick={toggleCommandPalette}
    >
      <SearchIcon className="h-4 w-4" />
      <span>Search...</span>
      <kbd className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
        ⌘K
      </kbd>
    </Button>
  );
}
