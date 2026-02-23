"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

interface DeleteAccountDialogProps {
  email: string;
}

export function DeleteAccountDialog({ email }: DeleteAccountDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const { signOut } = useAuthActions();

  const canDelete = confirmEmail === email;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await deleteAccount();
      await signOut();
    } catch {
      setDeleting(false);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep(1);
      setConfirmEmail("");
    }
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5 cursor-pointer">
          Delete my account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your account and all your data
            including styles, characters, and resources. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {step === 1 ? (
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => setStep(2)}
              className="cursor-pointer"
            >
              I understand, continue
            </Button>
          </AlertDialogFooter>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Type <strong>{email}</strong> to confirm.
              </p>
              <Input
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="off"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={!canDelete || deleting}
                onClick={handleDelete}
                className="cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete my account"}
              </Button>
            </AlertDialogFooter>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
