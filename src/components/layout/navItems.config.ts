export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  items?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Overview",
    icon: "dashboard",
    href: "/",
  },
  {
    id: "issues",
    label: "Issues",
    icon: "issues",
    href: "/issues",
    items: [
      { id: "all-issues", label: "All Issues", icon: "issues", href: "/issues" },
      { id: "my-issues", label: "My Issues", icon: "issues", href: "/issues?assigned=me" },
      { id: "new-issue", label: "New Issue", icon: "issues", href: "/issues/new" },
    ],
  },
  {
    id: "chat",
    label: "Chat",
    icon: "chat",
    href: "/chat",
  },
  {
    id: "polls",
    label: "Polls",
    icon: "polls",
    href: "/polls",
  },
  {
    id: "search",
    label: "Search",
    icon: "search",
    href: "/search",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "notifications",
    href: "/notifications",
  },
  {
    id: "admin",
    label: "Admin",
    icon: "admin",
    href: "/admin",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    href: "/profile",
  },
];
