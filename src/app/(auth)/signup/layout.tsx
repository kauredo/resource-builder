import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Account",
  description:
    "Sign up for Resource Builder and start creating professional therapy materials. Free to start, no credit card required.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
