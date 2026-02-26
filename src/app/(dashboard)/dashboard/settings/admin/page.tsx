"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Users,
  FileText,
  Palette,
  PersonStanding,
  ChevronDown,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

type Filter = "all" | "free" | "pro";

export default function AdminPage() {
  const isAdminUser = useQuery(api.users.isAdmin);
  const stats = useQuery(api.users.adminGetStats);
  const users = useQuery(api.users.adminListUsers);
  const setSubscription = useMutation(api.users.adminSetSubscription);
  const hasPerUserPresets = useQuery(api.styles.hasPerUserPresets);
  const migratePresets = useMutation(api.styles.migratePresetsToShared);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    let list = [...users];

    // Filter by plan
    if (filter !== "all") {
      list = list.filter((u) => u.subscription === filter);
    }

    // Filter by search
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    // Sort newest first
    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  }, [users, filter, search]);

  if (isAdminUser === undefined) return null;
  if (!isAdminUser) {
    return (
      <p className="text-muted-foreground text-sm">
        You don&apos;t have access to this page.
      </p>
    );
  }

  async function handleMigratePresets() {
    setIsMigrating(true);
    try {
      const result = await migratePresets({});
      toast.success(
        `Migration complete: ${result.deletedPresets} preset copies removed, ${result.remappedResources} resources remapped`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Migration failed"
      );
    } finally {
      setIsMigrating(false);
    }
  }

  async function handleToggleSubscription(email: string, current: string) {
    const newStatus = current === "pro" ? "free" : "pro";
    setUpdatingUser(email);
    try {
      await setSubscription({ email, subscription: newStatus as "free" | "pro" });
      toast.success(`Updated ${email} to ${newStatus}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update subscription",
      );
    } finally {
      setUpdatingUser(null);
    }
  }

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-xl font-semibold mb-1">Admin</h2>
        <p className="text-sm text-muted-foreground">
          System overview and user management.
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Users className="size-4" aria-hidden="true" />}
            label="Users"
            value={stats.users.total}
            detail={`${stats.users.free} Free · ${stats.users.pro} Pro`}
          />
          <StatCard
            icon={<FileText className="size-4" aria-hidden="true" />}
            label="Resources"
            value={stats.resources.total}
            detail={`${stats.resources.complete} complete`}
          />
          <StatCard
            icon={<Palette className="size-4" aria-hidden="true" />}
            label="Custom Styles"
            value={stats.styles.total}
          />
          <StatCard
            icon={<PersonStanding className="size-4" aria-hidden="true" />}
            label="Characters"
            value={stats.characters.total}
          />
        </div>
      )}

      {/* Preset Migration */}
      {hasPerUserPresets && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <div>
            <h3 className="font-medium text-sm text-amber-900">
              Migrate preset styles
            </h3>
            <p className="text-xs text-amber-700 mt-1">
              Per-user preset copies still exist. Run migration to consolidate
              them into shared presets and remap all references.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isMigrating}
                size="sm"
                className="cursor-pointer btn-coral"
              >
                {isMigrating && (
                  <Loader2
                    className="size-3.5 animate-spin motion-reduce:animate-none mr-1.5"
                    aria-hidden="true"
                  />
                )}
                {isMigrating ? "Migrating…" : "Migrate presets"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Migrate preset styles?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will consolidate all per-user preset copies into shared
                  presets, remap resource and character references, and delete
                  the old copies. This is safe to run multiple times.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleMigratePresets}
                  className="cursor-pointer btn-coral"
                >
                  Run migration
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* User List */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search users"
            />
          </div>
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={`whitespace-nowrap px-2.5 py-1 text-xs rounded-full cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                  filter === f.value
                    ? "bg-[color-mix(in_oklch,var(--coral)_12%,transparent)] text-coral font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {f.label}
                {users && (
                  <span className="ml-1 tabular-nums">
                    {f.value === "all"
                      ? users.length
                      : users.filter((u) => u.subscription === f.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {!users && (
          <div className="flex items-center justify-center py-12">
            <Loader2
              className="size-5 animate-spin motion-reduce:animate-none text-muted-foreground"
              aria-label="Loading users"
            />
          </div>
        )}

        {users && filteredUsers.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No users match your search.
          </p>
        )}

        {filteredUsers.length > 0 && (
          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
            {filteredUsers.map((user) => {
              const isExpanded = expandedUserId === user._id;
              const isUpdating = updatingUser === user.email;

              return (
                <div key={user._id}>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedUserId(isExpanded ? null : user._id)
                    }
                    aria-expanded={isExpanded}
                    className={`w-full text-left px-5 py-3.5 flex items-center gap-4 cursor-pointer transition-colors duration-150 motion-reduce:transition-none hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-inset ${
                      isExpanded ? "border-l-2 border-l-coral" : ""
                    }`}
                  >
                    {/* Name + Email */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </div>
                    </div>

                    {/* Plan badge */}
                    <PlanBadge plan={user.subscription} />

                    {/* Joined */}
                    <div className="hidden sm:block text-xs text-muted-foreground w-20 text-right">
                      {formatRelativeDate(user.createdAt)}
                    </div>

                    {/* Resources count */}
                    <div className="hidden sm:block text-xs text-muted-foreground w-16 text-right tabular-nums">
                      {user.counts.resources} res.
                    </div>

                    {/* Last activity */}
                    <div className="hidden md:block text-xs text-muted-foreground w-20 text-right">
                      {user.lastActivity
                        ? formatRelativeDate(user.lastActivity)
                        : "—"}
                    </div>

                    {/* Chevron */}
                    <ChevronDown
                      className={`size-4 text-muted-foreground shrink-0 transition-transform duration-150 motion-reduce:transition-none ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-5 py-4 bg-muted/20 border-l-2 border-l-coral space-y-4">
                      {/* Activity stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs block mb-0.5">
                            Resources
                          </span>
                          <span className="font-medium tabular-nums">
                            {user.counts.resourcesComplete} complete,{" "}
                            {user.counts.resources -
                              user.counts.resourcesComplete}{" "}
                            draft
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block mb-0.5">
                            Custom styles
                          </span>
                          <span className="font-medium tabular-nums">
                            {user.counts.styles}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block mb-0.5">
                            Characters
                          </span>
                          <span className="font-medium tabular-nums">
                            {user.counts.characters}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block mb-0.5">
                            This month
                          </span>
                          <span className="font-medium tabular-nums">
                            {user.resourcesCreatedThisMonth} resources
                          </span>
                        </div>
                      </div>

                      {/* Subscription info + actions */}
                      <div className="flex items-center gap-3 pt-2 border-t border-border">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <PlanBadge plan={user.subscription} />
                            {user.subscription === "pro" &&
                              !user.dodoCustomerId && (
                                <span className="text-xs text-muted-foreground">
                                  Manually granted
                                </span>
                              )}
                            {user.dodoCustomerId && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {user.dodoCustomerId}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() =>
                            handleToggleSubscription(
                              user.email,
                              user.subscription,
                            )
                          }
                          disabled={isUpdating}
                          variant={
                            user.subscription === "pro" ? "outline" : "default"
                          }
                          size="sm"
                          className={`cursor-pointer ${
                            user.subscription === "pro" ? "" : "btn-coral"
                          }`}
                        >
                          {isUpdating && (
                            <Loader2
                              className="size-3.5 animate-spin motion-reduce:animate-none mr-1.5"
                              aria-hidden="true"
                            />
                          )}
                          {user.subscription === "pro"
                            ? "Downgrade to Free"
                            : "Upgrade to Pro"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="font-serif text-2xl font-semibold">{value}</div>
      {detail && (
        <div className="text-xs text-muted-foreground mt-1">{detail}</div>
      )}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        plan === "pro"
          ? "bg-green-100 text-green-800"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {plan === "pro" ? "Pro" : "Free"}
    </span>
  );
}
