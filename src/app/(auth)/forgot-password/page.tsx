"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
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
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn("password", { email, flow: "reset" });
    } catch {
      // Silently ignore errors to avoid leaking whether the email exists
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-sm border-border/50">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 size-12 rounded-2xl bg-coral/10 flex items-center justify-center">
          <Mail className="size-6 text-coral" aria-hidden="true" />
        </div>
        <CardTitle className="font-serif text-3xl tracking-tight">
          {submitted ? "Check your email" : "Reset password"}
        </CardTitle>
        <CardDescription className="text-base">
          {submitted
            ? "If an account exists with that email, we've sent a reset link."
            : "Enter your email and we'll send you a reset link."}
        </CardDescription>
      </CardHeader>

      {submitted ? (
        <CardFooter className="flex flex-col gap-4 pt-4">
          <p className="text-sm text-muted-foreground text-center">
            Didn&apos;t get the email? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-foreground font-medium underline underline-offset-4 hover:text-coral transition-colors cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              try again
            </button>
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </CardFooter>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
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
                  <Loader2
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <span>Sending...</span>
                </>
              ) : (
                "Send reset link"
              )}
            </Button>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
