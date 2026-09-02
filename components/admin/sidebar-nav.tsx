"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { adminNavItems } from "./nav-config";

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {adminNavItems
        .filter((item) => !item.adminOnly || isAdmin)
        .map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2.5 rounded-sm text-sm font-medium transition-colors border-l-2",
                active
                  ? "bg-ak-red/10 text-white border-ak-red"
                  : "text-ak-silver-dark border-transparent hover:text-ak-silver-light hover:bg-white/5"
              )}
            >
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}
