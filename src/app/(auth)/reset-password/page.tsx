"use client";

import { useState, Suspense } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const { signIn } = useAuthActions();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const email = searchParams.get("email") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const missingParams = !code || !email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);

    try {
      await signIn("password", {
        email,
        code,
        newPassword,
        flow: "reset-verification",
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "This reset link is invalid or has expired. Please request a new one."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (missingParams) {
    return (
      <Card className="w-full max-w-md shadow-sm border-border/50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-serif text-3xl tracking-tight">
            Invalid reset link
          </CardTitle>
          <CardDescription className="text-base">
            This password reset link is missing required information.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-foreground font-medium underline underline-offset-4 hover:text-coral transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          >
            Request a new reset link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md shadow-sm border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 size-12 rounded-2xl bg-teal/10 flex items-center justify-center">
            <CheckCircle2 className="size-6 text-teal" aria-hidden="true" />
          </div>
          <CardTitle className="font-serif text-3xl tracking-tight">
            Password updated
          </CardTitle>
          <CardDescription className="text-base">
            Your password has been reset. You can now sign in with your new
            password.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-4">
          <Button asChild className="btn-coral h-11 text-base px-8">
            <Link href="/login">Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-sm border-border/50">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 size-12 rounded-2xl bg-coral/10 flex items-center justify-center">
          <KeyRound className="size-6 text-coral" aria-hidden="true" />
        </div>
        <CardTitle className="font-serif text-3xl tracking-tight">
          Choose a new password
        </CardTitle>
        <CardDescription className="text-base">
          Enter a new password for {email}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          {error && (
            <div
              className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="8+ characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
              minLength={8}
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              disabled={isLoading}
              className="h-11"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full btn-coral h-11 text-base"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                <span>Resetting...</span>
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md shadow-sm border-border/50">
          <CardHeader className="flex items-center justify-center py-12">
            <Loader2
              className="size-8 animate-spin motion-reduce:animate-none text-coral"
              aria-label="Loading"
            />
          </CardHeader>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
