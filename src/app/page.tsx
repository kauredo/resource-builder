import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-xl font-bold">Resource Builder</div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Start free trial</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Create beautiful therapy resources{" "}
            <span className="text-primary/80">in minutes</span>
          </h1>
          <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
            AI-powered tools for therapists and psychologists to create
            consistent, branded materials for children and adolescents. Emotion
            cards, worksheets, board games, and more.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">Start your free trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">See how it works</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mt-32">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Consistent Branding</CardTitle>
                <CardDescription>
                  Create a unique visual style that carries through all your
                  materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Choose from beautiful presets or build your own. Colors,
                  typography, and illustration style—all in one place.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Art</CardTitle>
                <CardDescription>
                  Unique illustrations that match your style, created instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Powered by Gemini, generate child-friendly illustrations that
                  stay consistent across all your resources.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Print-Ready PDFs</CardTitle>
                <CardDescription>
                  Export professional materials ready for your printer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Optimized for printing with cut lines, bleeds, and proper
                  sizing. Just print, cut, and use in your sessions.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Resource Builder. Built for therapists, by therapists.</p>
        </div>
      </footer>
    </div>
  );
}
