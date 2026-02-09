"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoLandingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-16 animate-fade-in">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center rounded-full glass-subtle px-4 py-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          Demo omgeving
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl dark:text-zinc-50">
          Welkom bij het VEHA Klantportaal
        </h1>
        <p className="mb-8 text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
          Bekijk als klant de voortgang van uw projecten, communiceer met uw projectleider,
          en houd overzicht over planning en taken — alles op een plek.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/demo/portal">
            Bekijk Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Features */}
      <div className="mt-16 grid w-full max-w-3xl gap-6 sm:grid-cols-3">
        <div className="glass rounded-xl p-6 text-center glow-hover transition-shadow">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <BarChart3 className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
          </div>
          <h3 className="mb-2 font-semibold">Voortgang Inzicht</h3>
          <p className="text-sm text-muted-foreground">
            Realtime voortgang van al uw projecten met visuele Gantt planning.
          </p>
        </div>
        <div className="glass rounded-xl p-6 text-center glow-hover transition-shadow">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Calendar className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
          </div>
          <h3 className="mb-2 font-semibold">Planning & Taken</h3>
          <p className="text-sm text-muted-foreground">
            Overzicht van alle taken, mijlpalen en deadlines per project.
          </p>
        </div>
        <div className="glass rounded-xl p-6 text-center glow-hover transition-shadow">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <MessageSquare className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
          </div>
          <h3 className="mb-2 font-semibold">Direct Communiceren</h3>
          <p className="text-sm text-muted-foreground">
            Stel vragen en geef feedback direct via het portaal aan uw projectleider.
          </p>
        </div>
      </div>

      {/* Info */}
      <p className="mt-12 max-w-md text-center text-xs text-zinc-400 dark:text-zinc-500">
        Dit is een interactieve demo met voorbeelddata. Alle wijzigingen worden gereset bij het
        herladen van de pagina. Geen account nodig.
      </p>
    </div>
  );
}
