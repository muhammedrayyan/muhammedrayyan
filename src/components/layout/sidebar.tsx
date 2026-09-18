"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Plus, Users } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { SignOutButton } from "@/components/layout/sign-out-button";
import type { Profile, Project } from "@/lib/types";

export function Sidebar({
  profile,
  projects,
}: {
  profile: Profile | null;
  projects: Project[];
}) {
  const pathname = usePathname();

  const navLink = (href: string, icon: React.ReactNode, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-white/10 text-sidebar-foreground"
            : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground",
        )}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          F
        </div>
        <span className="text-sm font-semibold">Flowbase CRM</span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {navLink("/app", <LayoutGrid size={17} />, "Home")}
        {navLink("/app/contacts", <Users size={17} />, "Contacts")}
      </nav>

      <div className="mt-6 flex-1 overflow-y-auto px-3">
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/40">
            Projects
          </span>
          <Link
            href="/app/projects"
            className="rounded-md p-1 text-sidebar-foreground/50 hover:bg-white/10 hover:text-sidebar-foreground"
            title="New project"
            aria-label="New project"
          >
            <Plus size={14} />
          </Link>
        </div>
        <div className="flex flex-col gap-0.5">
          {projects.map((project) => {
            const href = `/app/projects/${project.id}`;
            const active = pathname === href;
            return (
              <Link
                key={project.id}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground",
                )}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate">{project.name}</span>
              </Link>
            );
          })}
          {projects.length === 0 && (
            <Link
              href="/app/projects"
              className="px-3 py-1.5 text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
            >
              No projects yet — create one
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 border-t border-white/10 px-4 py-4">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: profile?.avatar_color ?? "#7B68EE" }}
        >
          {initials(profile?.full_name)}
        </span>
        <span className="flex-1 truncate text-sm text-sidebar-foreground/90">
          {profile?.full_name ?? "You"}
        </span>
        <SignOutButton />
      </div>
    </aside>
  );
}
