"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { User, Shield, CreditCard, AlertTriangle, Wrench } from "lucide-react";

const settingsNav = [
  { href: "/dashboard/settings/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings/security", label: "Security", icon: Shield },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
  {
    href: "/dashboard/settings/account",
    label: "Account",
    icon: AlertTriangle,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminUser = useQuery(api.users.isAdmin);

  const navItems = isAdminUser
    ? [...settingsNav, { href: "/dashboard/settings/admin", label: "Admin", icon: Wrench }]
    : settingsNav;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-2xl font-semibold mb-6">Settings</h1>
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar - horizontal pills on mobile, vertical on desktop */}
        <nav
          className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible sm:w-52 sm:shrink-0 pb-2 sm:pb-0"
          aria-label="Settings navigation"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150 motion-reduce:transition-none ${
                  isActive
                    ? "bg-coral/10 text-coral"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
