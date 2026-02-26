"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";

export default function AdminPage() {
  const isAdminUser = useQuery(api.users.isAdmin);
  const [email, setEmail] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [updating, setUpdating] = useState(false);

  const lookedUpUser = useQuery(
    api.users.adminLookupUser,
    lookupEmail ? { email: lookupEmail } : "skip",
  );
  const setSubscription = useMutation(api.users.adminSetSubscription);

  if (isAdminUser === undefined) return null;
  if (!isAdminUser) {
    return (
      <p className="text-muted-foreground text-sm">
        You don&apos;t have access to this page.
      </p>
    );
  }

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLookupEmail(trimmed);
  }

  async function handleToggle() {
    if (!lookedUpUser || updating) return;
    const newStatus = lookedUpUser.subscription === "pro" ? "free" : "pro";
    setUpdating(true);
    try {
      await setSubscription({
        email: lookedUpUser.email,
        subscription: newStatus,
      });
      toast.success(`Updated ${lookedUpUser.email} to ${newStatus}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update subscription",
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-xl font-semibold mb-1">Admin</h2>
        <p className="text-sm text-muted-foreground">
          Manage user subscriptions.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-3 items-end">
        <div className="flex-1">
          <Label htmlFor="admin-email">User email</Label>
          <Input
            id="admin-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <Button type="submit" variant="outline" className="cursor-pointer h-9">
          <Search className="size-4 mr-1.5" aria-hidden="true" />
          Look up
        </Button>
      </form>

      {lookupEmail && lookedUpUser === null && (
        <p className="text-sm text-muted-foreground">
          No user found for {lookupEmail}
        </p>
      )}

      {lookedUpUser && (
        <div className="border border-border rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block mb-0.5">Name</span>
              <span className="font-medium">{lookedUpUser.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Email</span>
              <span className="font-medium">{lookedUpUser.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Plan</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  lookedUpUser.subscription === "pro"
                    ? "bg-green-100 text-green-800"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {lookedUpUser.subscription === "pro" ? "Pro" : "Free"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">
                Joined
              </span>
              <span className="font-medium">
                {new Date(lookedUpUser.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <Button
              onClick={handleToggle}
              disabled={updating}
              className={`cursor-pointer ${
                lookedUpUser.subscription === "pro"
                  ? ""
                  : "btn-coral"
              }`}
              variant={
                lookedUpUser.subscription === "pro" ? "outline" : "default"
              }
            >
              {updating && (
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none mr-2"
                  aria-hidden="true"
                />
              )}
              {lookedUpUser.subscription === "pro"
                ? "Downgrade to Free"
                : "Upgrade to Pro"}
            </Button>
            {!lookedUpUser.dodoCustomerId &&
              lookedUpUser.subscription === "pro" && (
                <p className="text-xs text-muted-foreground mt-2">
                  No Dodo subscription — this is a manually granted Pro account.
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
