"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Target,
  UserCircle,
  FileText,
  Flag,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/epics", label: "Épicas", icon: Flag },
  { href: "/sprints", label: "Sprints", icon: Target },
  { href: "/tasks", label: "My Tasks", icon: ListChecks },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/users", label: "Users", icon: UserCircle },
  { href: "/transcripts", label: "Transcripts", icon: FileText },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-border bg-white dark:bg-gray-900 flex flex-col transition-all duration-300",
          // Mobile: off-screen by default, slide in when open
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          // Width: always w-60 on mobile, respect collapsed on desktop
          "w-60",
          collapsed && "md:w-16"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border dark:border-gray-800 px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden"
            onClick={onMobileClose}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              O
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="text-base font-semibold text-foreground whitespace-nowrap md:hidden">
                Operations
              </span>
            )}
            {!collapsed && (
              <span className="text-base font-semibold text-foreground whitespace-nowrap hidden md:inline">
                Operations
              </span>
            )}
          </Link>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {/* Always show label on mobile, respect collapsed on desktop */}
                <span className="md:hidden">{item.label}</span>
                {!collapsed && <span className="hidden md:inline">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle - desktop only */}
        <div className="border-t border-border dark:border-gray-800 p-3 hidden md:block">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
