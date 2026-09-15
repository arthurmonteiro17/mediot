"use client";

import { MediotProvider } from "@/lib/store";
import { AppShell } from "@/components/app-shell";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MediotProvider>
      <AppShell>{children}</AppShell>
    </MediotProvider>
  );
}
