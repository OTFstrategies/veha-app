import type { Metadata } from "next";
import { DemoShell } from "@/components/demo/DemoShell";

export const metadata: Metadata = {
  title: "VEHA Klantportaal | CSU Demo",
  description:
    "Bekijk als klant de voortgang van uw projecten, communiceer met uw projectleider, en houd overzicht over planning en taken.",
};

interface DemoLayoutProps {
  children: React.ReactNode;
}

export default function DemoLayout({ children }: DemoLayoutProps) {
  return <DemoShell>{children}</DemoShell>;
}
