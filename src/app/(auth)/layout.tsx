import type { Metadata } from "next";
import AuthGuard from "./AuthGuard";

export const metadata: Metadata = {
  title: {
    template: "%s | Resource Builder",
    default: "Account | Resource Builder",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
